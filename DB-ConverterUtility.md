# Explicit Directives for Your Team on the DB-Converter Utility

Here's a clear guide for your team on using the db-converter utility:
salesBlanket DB-Converter Guidelines
Purpose
The DB-Converter utility standardizes the conversion between PostgreSQL's snake_case column names and JavaScript/TypeScript's camelCase property names, ensuring consistent data handling throughout the application.
Key Components

Basic Conversion Functions
typescriptimport { snakeToCamel, camelToSnake } from '../utils/db-converter';

// Convert individual strings
const camelCaseProperty = snakeToCamel('database_column'); // databaseColumn
const snakeCaseColumn = camelToSnake('javaScriptProperty'); // javascript_property

Object Conversion
typescriptimport { dbRowToCamelCase } from '../utils/db-converter';

// Convert entire database row objects
const dbRow = { user_id: 1, first_name: 'John' };
const jsObject = dbRowToCamelCase(dbRow); // { userId: 1, firstName: 'John' }

Enhanced Database Connection
typescriptimport { createCaseConvertingDb } from '../utils/db-converter';

// In resolver functions
const db = createCaseConvertingDb(context.db);

// Simple query with automatic conversion
const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
return result.camelRows; // Array of converted objects

// Get single row with conversion
const user = await db.queryFirstRow('SELECT * FROM users WHERE id = $1', [id]);
return user; // Single converted object or null


Entity-Specific Transformations
For entities that require special field mappings (like User):
typescript// models/user.ts
import { dbRowToCamelCase } from '../utils/db-converter';

export function mapDbUserToGraphQLUser(dbUser) {
  // First do the standard camelCase conversion
  const camelCaseUser = dbRowToCamelCase(dbUser);
  
  // Then handle special mappings
  return {
    ...camelCaseUser,
    // Convert string status to boolean
    isActive: camelCaseUser.status === 'ACTIVE',
    // Map database fields to GraphQL schema fields
    settings: camelCaseUser.preferences || {},
    // Exclude sensitive fields
    passwordHash: undefined
  };
}
Best Practices

Always use the utility for database access
typescript// ❌ DON'T directly access snake_case properties
const name = `${result.rows[0].first_name} ${result.rows[0].last_name}`;

// ✅ DO use the converter
const user = dbRowToCamelCase(result.rows[0]);
const name = `${user.firstName} ${user.lastName}`;

Create entity-specific mappers for complex transformations
typescript// ❌ DON'T transform in resolver functions
return {
  ...dbRowToCamelCase(dbRow),
  isActive: dbRow.status === 'ACTIVE',
  // More transformations...
};

// ✅ DO use centralized mappers
return mapDbUserToGraphQLUser(dbRow);

Be consistent with JSON field usage

Use preferences for user-configurable application settings
Use metadata for system data and form submission data



By following these guidelines, we'll maintain consistent data handling throughout the application and reduce errors caused by property name mismatches.