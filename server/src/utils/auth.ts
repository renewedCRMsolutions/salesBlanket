import jwt from 'jsonwebtoken';
import { AuthenticationError } from 'apollo-server-express';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

/**
 * Generate a JWT token for a user
 * 
 * @param user User object
 * @returns JWT token string
 */
export function generateToken(user: any): string {
  const payload = {
    userId: user.id,
    email: user.email,
    username: user.username
  };

  // @ts-ignore
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

/**
 * Verify a JWT token
 * 
 * @param token JWT token
 * @returns Decoded token payload
 * @throws AuthenticationError if token is invalid
 */
export function verifyToken(token: string): any {
  if (!token) {
    return null;
  }

  try {
    // @ts-ignore
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new AuthenticationError('Invalid or expired token');
  }
}

/**
 * Create an authentication middleware for Express
 */
export function authMiddleware(req: any, res: any, next: any) {
  const authHeader = req.headers.authorization;
  
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decoded = verifyToken(token);
      req.user = decoded;
    } catch (error) {
      // Continue as unauthenticated user
    }
  }
  
  next();
}