/**
 * Database utilities for standardizing case conversion between PostgreSQL and JavaScript
 * Provides functions to convert between snake_case (database) and camelCase (JavaScript)
 */

/**
 * Converts a snake_case string to camelCase
 */
export function snakeToCamel(snakeCase: string): string {
  return snakeCase.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Converts a camelCase string to snake_case
 */
export function camelToSnake(camelCase: string): string {
  return camelCase.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Converts a database row object with snake_case keys to a JavaScript
 * object with camelCase keys
 */
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

/**
 * Converts an array of database rows with snake_case keys to an array
 * of JavaScript objects with camelCase keys
 */
export function dbRowsToCamelCase<T = any>(dbRows: Record<string, any>[]): T[] {
  return dbRows.map((row) => dbRowToCamelCase<T>(row) as T);
}

/**
 * Identifies potential case conversion issues in an object
 */
export function detectCaseIssues(
  obj: any,
  options: {
    expectedCase: 'snake' | 'camel';
    entityName?: string;
  }
): Array<{
  path: string[];
  key: string;
  issue: string;
}> {
  const issues: Array<{ path: string[]; key: string; issue: string }> = [];

  function analyze(value: any, path: string[] = []) {
    if (!value || typeof value !== 'object') return;

    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        analyze(item, [...path, `[${index}]`]);
      });
      return;
    }

    Object.keys(value).forEach((key) => {
      const currentPath = [...path, key];

      // Check for case issues
      if (options.expectedCase === 'camel') {
        if (key.includes('_')) {
          issues.push({
            path,
            key,
            issue: `Unexpected snake_case key "${key}" in camelCase context`,
          });
        }
      } else if (options.expectedCase === 'snake') {
        if (/[A-Z]/.test(key)) {
          issues.push({
            path,
            key,
            issue: `Unexpected camelCase key "${key}" in snake_case context`,
          });
        }
      }

      // Analyze nested objects
      analyze(value[key], currentPath);
    });
  }

  analyze(obj);
  return issues;
}

/**
 * Converts a database row to camelCase format with debugging
 */
export function dbRowToCamelCaseDebug<T = any>(dbRow: Record<string, any>, entityName?: string): T {
  // Perform the conversion
  const result = dbRowToCamelCase<T>(dbRow) as T;

  // Debug checks in development environment only
  if (process.env.NODE_ENV !== 'production') {
    const issues = detectCaseIssues(result, {
      expectedCase: 'camel',
      entityName,
    });

    if (issues.length > 0) {
      console.warn(
        `[CaseConverter] Found ${issues.length} case issues in ${entityName || 'object'}:`
      );
      issues.forEach((issue) => {
        console.warn(`  - ${issue.issue} at ${issue.path.join('.')}`);
      });
    }
  }

  return result;
}

// Define TableSchema interface here to avoid circular dependencies
export interface TableSchema {
  [dbColumn: string]: {
    jsProperty: string;
    type?: 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';
    required?: boolean;
    transform?: (value: any) => any;
  };
}

// Assuming you have a QueryResult type similar to this:
export interface QueryResult {
  rows: any[];
  rowCount: number;
  // Other properties from your database driver
}
