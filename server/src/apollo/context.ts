import { Request, Response } from 'express';
import { getDb } from '../db/db';
import { verifyToken } from '../utils/auth';
import { createCaseConvertingDb } from '../utils/db-converter';

// User interface
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  [key: string]: any; // Allow other properties
}

// Database interface
export interface QueryResult {
  rows: any[];
  rowCount: number | null; // Changed from just 'number' to allow null
}

export interface Database {
  query: (text: string, params?: any[]) => Promise<QueryResult>;
  pool?: any; // Add this if your db object has a pool property
}

// Define Context interface
export interface Context {
  req: Request;
  res: Response;
  db: Database;
  user: User | null;
}

/**
 * Creates the context for each GraphQL request
 *
 * @param {Object} context - The context object from Apollo Server
 * @returns {Context} The enhanced context object
 */
export async function createContext({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): Promise<Context> {
  // Get the database instance
  const rawDb = getDb();

  // Create enhanced database with case conversion
  const db = createCaseConvertingDb(rawDb);

  // Get auth token from request headers
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace('Bearer ', '');

  // Verify token and get user (if token exists)
  let user = null;
  if (token) {
    try {
      // Verify JWT and get user ID
      const decoded = verifyToken(token);
      if (decoded?.userId) {
        // Get user from database and auto-convert to camelCase
        const result = await db.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [
          decoded.userId,
        ]);

        // Use the camelRows property from our enhanced db
        user = result.camelRows[0] || null;
      }
    } catch (error) {
      console.error('Authentication error:', error);
      // Continue as unauthenticated user
    }
  }

  return {
    req,
    res,
    db,
    user,
  };
}
