import { Database, QueryResult } from '../apollo/context';

/**
 * Helper function to execute a database query and extract rows
 * 
 * @param db Database instance
 * @param query SQL query string
 * @param params Query parameters
 * @returns Query results rows array
 */
export async function executeQuery(db: Database, query: string, params?: any[]): Promise<any[]> {
  const result = await db.query(query, params);
  return result.rows;
}

/**
 * Helper function to execute a database query and extract first row
 * 
 * @param db Database instance
 * @param query SQL query string
 * @param params Query parameters
 * @returns First row or null if no results
 */
export async function executeQueryOne(db: Database, query: string, params?: any[]): Promise<any | null> {
  const result = await db.query(query, params);
  return result.rows.length > 0 ? result.rows[0] : null;
}

/**
 * Helper function to execute a transaction with multiple queries
 * 
 * @param db Database instance
 * @param callback Function that executes queries within the transaction
 * @returns Result of the callback function
 */
export async function executeTransaction<T>(db: Database, callback: () => Promise<T>): Promise<T> {
  try {
    await db.query('BEGIN');
    const result = await callback();
    await db.query('COMMIT');
    return result;
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
}

/**
 * Helper function that safely destructures the first row from a query result
 * Use this pattern to replace: const [row] = await db.query(...)
 * 
 * @param db Database instance 
 * @param query SQL query string
 * @param params Query parameters
 * @returns The first row or null
 */
export async function queryFirstRow(db: Database, query: string, params?: any[]): Promise<any | null> {
  const result = await db.query(query, params);
  return result.rows[0] || null;
}