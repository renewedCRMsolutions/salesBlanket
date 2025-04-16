// server/src/utils/db-converter.test.ts

import {
  snakeToCamel,
  camelToSnake,
  dbRowToCamelCase,
  dbRowsToCamelCase,
  createCaseConvertingDb,
  QueryResult,
} from './db-converter';

// Test basic string conversion
console.log('--- Testing basic string conversion ---');
console.log(`snakeToCamel('first_name') => ${snakeToCamel('first_name')}`);
console.log(`camelToSnake('firstName') => ${camelToSnake('firstName')}`);
console.log();

// Test object conversion
console.log('--- Testing object conversion ---');
const dbRow = {
  user_id: 123,
  first_name: 'John',
  last_name: 'Doe',
  created_at: '2025-04-16T12:00:00Z',
  is_active: true,
  nested_object: {
    object_id: 456,
    object_name: 'Test',
  },
};
console.log('Original DB row:');
console.log(dbRow);
console.log('\nConverted to camelCase:');
console.log(dbRowToCamelCase(dbRow));
console.log();

// Test array conversion
console.log('--- Testing array conversion ---');
const dbRows = [
  { user_id: 1, first_name: 'Alice' },
  { user_id: 2, first_name: 'Bob' },
];
console.log('Original DB rows:');
console.log(dbRows);
console.log('\nConverted to camelCase:');
console.log(dbRowsToCamelCase(dbRows));
console.log();

// Test DB wrapper with a mock
console.log('--- Testing DB wrapper ---');
// Create a mock DB object
const mockDb = {
  query: async (text: string, params?: any[]): Promise<QueryResult> => {
    console.log(`Mock query executed: ${text}`);
    console.log(`With params: ${JSON.stringify(params)}`);
    return {
      rows: [
        { user_id: 1, first_name: 'Alice' },
        { user_id: 2, first_name: 'Bob' },
      ],
      rowCount: 2,
    };
  },
};

// Create the converting DB wrapper
const db = createCaseConvertingDb(mockDb);

// Execute a test query
(async () => {
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [1]);
    console.log('Query result:');
    console.log(result);
    console.log('\nCamel case rows:');
    console.log(result.camelRows);

    const singleRow = await db.queryFirstRow('SELECT * FROM users WHERE id = $1', [1]);
    console.log('\nSingle row result:');
    console.log(singleRow);
  } catch (error) {
    console.error('Test error:', error);
  }
})();
