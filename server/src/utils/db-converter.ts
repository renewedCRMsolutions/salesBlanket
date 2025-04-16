/**
 * Utility for converting between PostgreSQL snake_case and JavaScript camelCase
 */

// Basic conversion functions
export function snakeToCamel(snakeCase: string): string {
  return snakeCase.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function camelToSnake(camelCase: string): string {
  return camelCase.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

// Object converters
export function dbRowToCamelCase<T = any>(dbRow: Record<string, any> | null): T | null {
  if (!dbRow || typeof dbRow !== 'object' || Array.isArray(dbRow)) {
    return dbRow as T | null;
  }

  const result: Record<string, any> = {};

  Object.keys(dbRow).forEach((key) => {
    const camelKey = snakeToCamel(key);
    const value = dbRow[key];

    // Handle nested objects and arrays recursively
    if (value !== null && typeof value === 'object') {
      if (Array.isArray(value)) {
        result[camelKey] = value.map((item) =>
          typeof item === 'object' && item !== null ? dbRowToCamelCase(item) : item
        );
      } else {
        result[camelKey] = dbRowToCamelCase(value);
      }
    } else {
      result[camelKey] = value;
    }
  });

  return result as T;
}

// Array converter
export function dbRowsToCamelCase<T = any>(dbRows: Record<string, any>[]): T[] {
  return dbRows.map((row) => dbRowToCamelCase<T>(row) as T);
}

// Database wrapper
export interface QueryResult {
  rows: any[];
  rowCount: number;
}

export function createCaseConvertingDb(db: any) {
  return {
    // Preserve the original db object
    raw: db,

    // Execute query and convert results to camelCase
    async query<T = any>(text: string, params?: any[]): Promise<QueryResult & { camelRows: T[] }> {
      const result = await db.query(text, params);

      return {
        ...result,
        camelRows: dbRowsToCamelCase<T>(result.rows),
      };
    },

    // Execute query and return a single row converted to camelCase
    async queryFirstRow<T = any>(text: string, params?: any[]): Promise<T | null> {
      const result = await db.query(text, params);
      return result.rows.length > 0 ? dbRowToCamelCase<T>(result.rows[0]) : null;
    },
  };
}
