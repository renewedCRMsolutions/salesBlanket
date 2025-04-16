import { dbRowToCamelCase, TableSchema, QueryResult } from '../utils/db-utils';

/**
 * Database schema definitions mapping snake_case DB columns to camelCase JS properties
 * Each table in your database should have an entry here.
 */
export const DB_SCHEMAS: Record<string, TableSchema> = {
  // Users table schema
  users: {
    id: {
      jsProperty: 'id',
      type: 'string',
      required: true,
    },
    username: {
      jsProperty: 'username',
      type: 'string',
      required: true,
    },
    email: {
      jsProperty: 'email',
      type: 'string',
      required: true,
    },
    first_name: {
      jsProperty: 'firstName',
      type: 'string',
    },
    last_name: {
      jsProperty: 'lastName',
      type: 'string',
    },
    password_hash: {
      jsProperty: 'passwordHash',
      type: 'string',
      required: true,
    },
    status: {
      jsProperty: 'status',
      type: 'string',
      required: true,
    },
    avatar_url: {
      jsProperty: 'avatarUrl',
      type: 'string',
    },
    last_login: {
      jsProperty: 'lastLogin',
      type: 'date',
      transform: (value) => (value ? new Date(value) : null),
    },
    preferences: {
      jsProperty: 'preferences',
      type: 'object',
    },
    metadata: {
      jsProperty: 'metadata',
      type: 'object',
    },
    created_at: {
      jsProperty: 'createdAt',
      type: 'date',
      transform: (value) => (value ? new Date(value) : null),
    },
    updated_at: {
      jsProperty: 'updatedAt',
      type: 'date',
      transform: (value) => (value ? new Date(value) : null),
    },
    is_external: {
      jsProperty: 'isExternal',
      type: 'boolean',
    },
  },

  // Addresses table schema
  addresses: {
    id: {
      jsProperty: 'id',
      type: 'string',
      required: true,
    },
    display_name: {
      jsProperty: 'displayName',
      type: 'string',
    },
    street: {
      jsProperty: 'street',
      type: 'string',
      required: true,
    },
    address_line_2: {
      jsProperty: 'addressLine2',
      type: 'string',
    },
    city: {
      jsProperty: 'city',
      type: 'string',
    },
    state: {
      jsProperty: 'state',
      type: 'string',
    },
    postal_code: {
      jsProperty: 'postalCode',
      type: 'string',
    },
    notes: {
      jsProperty: 'notes',
      type: 'string',
    },
    property_condition: {
      jsProperty: 'propertyCondition',
      type: 'object',
    },
    next_knock_date: {
      jsProperty: 'nextKnockDate',
      type: 'date',
      transform: (value) => (value ? new Date(value) : null),
    },
    address_type_id: {
      jsProperty: 'addressTypeId',
      type: 'string',
    },
    collection_id: {
      jsProperty: 'collectionId',
      type: 'string',
    },
    status: {
      jsProperty: 'status',
      type: 'string',
    },
    metadata: {
      jsProperty: 'metadata',
      type: 'object',
    },
    created_by: {
      jsProperty: 'createdBy',
      type: 'string',
    },
    created_at: {
      jsProperty: 'createdAt',
      type: 'date',
      transform: (value) => (value ? new Date(value) : null),
    },
    updated_at: {
      jsProperty: 'updatedAt',
      type: 'date',
      transform: (value) => (value ? new Date(value) : null),
    },
  },

  // Add schemas for other tables as needed
  // For example:

  entity_types: {
    id: {
      jsProperty: 'id',
      type: 'string',
      required: true,
    },
    name: {
      jsProperty: 'name',
      type: 'string',
      required: true,
    },
    display_name: {
      jsProperty: 'displayName',
      type: 'string',
      required: true,
    },
    description: {
      jsProperty: 'description',
      type: 'string',
    },
    is_active: {
      jsProperty: 'isActive',
      type: 'boolean',
    },
    created_at: {
      jsProperty: 'createdAt',
      type: 'date',
      transform: (value) => (value ? new Date(value) : null),
    },
    updated_at: {
      jsProperty: 'updatedAt',
      type: 'date',
      transform: (value) => (value ? new Date(value) : null),
    },
  },
};

/**
 * Converts a database row to a JavaScript object using the defined schema
 */
export function convertDbRowWithSchema<T = any>(
  tableName: string,
  dbRow: Record<string, any>
): T | null {
  if (!dbRow) return null;

  const schema = DB_SCHEMAS[tableName];

  if (!schema) {
    console.warn(
      `[CaseConverter] No schema defined for table "${tableName}". Falling back to generic conversion.`
    );
    return dbRowToCamelCase<T>(dbRow);
  }

  const result: Record<string, any> = {};

  // Process each field according to the schema
  Object.keys(schema).forEach((dbColumn) => {
    const fieldSchema = schema[dbColumn];
    const { jsProperty, transform } = fieldSchema;

    if (dbColumn in dbRow) {
      let value = dbRow[dbColumn];

      // Apply any custom transformation
      if (transform) {
        value = transform(value);
      }

      result[jsProperty] = value;
    } else if (fieldSchema.required) {
      console.warn(`[CaseConverter] Required field "${dbColumn}" missing in ${tableName} row`);
    }
  });

  return result as T;
}

/**
 * Converts an array of database rows using the defined schema
 */
export function convertDbRowsWithSchema<T = any>(
  tableName: string,
  dbRows: Record<string, any>[]
): T[] {
  return dbRows.map((row) => convertDbRowWithSchema<T>(tableName, row) as T);
}

/**
 * Wraps database query methods with automatic case conversion
 */
export function createCaseConvertingDb(db: any) {
  return {
    // Preserve the original db object
    raw: db,

    /**
     * Executes a query and converts the results to camelCase
     */
    async query<T = any>(text: string, params?: any[]): Promise<QueryResult & { camelRows: T[] }> {
      const result = await db.query(text, params);

      // Add a camelRows property with converted rows
      return {
        ...result,
        camelRows: dbRowsToCamelCase<T>(result.rows),
      };
    },

    /**
     * Executes a query using the schema definition for the specified table
     */
    async queryWithSchema<T = any>(
      tableName: string,
      text: string,
      params?: any[]
    ): Promise<QueryResult & { schemaRows: T[] }> {
      const result = await db.query(text, params);

      return {
        ...result,
        schemaRows: convertDbRowsWithSchema<T>(tableName, result.rows),
      };
    },

    /**
     * Executes a query and returns a single row converted to camelCase
     */
    async queryFirstRow<T = any>(text: string, params?: any[]): Promise<T | null> {
      const result = await db.query(text, params);
      return result.rows.length > 0 ? dbRowToCamelCase<T>(result.rows[0]) : null;
    },

    /**
     * Executes a query and returns a single row converted using the schema
     */
    async queryFirstRowWithSchema<T = any>(
      tableName: string,
      text: string,
      params?: any[]
    ): Promise<T | null> {
      const result = await db.query(text, params);

      return result.rows.length > 0 ? convertDbRowWithSchema<T>(tableName, result.rows[0]) : null;
    },
  };
}
