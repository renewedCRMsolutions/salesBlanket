import { Request, Response } from 'express';
import { getDb } from '../db/db';
import { verifyToken } from '../utils/auth';

// Define Context interface
export interface Context {
  req: Request;
  res: Response;
  db: any; // Replace with appropriate DB type
  user: any | null; // Replace with User type
}

/**
 * Creates the context for each GraphQL request
 * 
 * @param {Object} context - The context object from Apollo Server
 * @returns {Context} The enhanced context object
 */
export async function createContext({ req, res }: { req: Request, res: Response }): Promise<Context> {
  // Get the database instance
  const db = getDb();
  
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
        // Get user from database
        user = await db.users.findOne({ id: decoded.userId });
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