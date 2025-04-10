import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'salesblanketv4',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected at:', res.rows[0].now);
  }
});

// Handle pool errors
pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Get the database connection
export function getDb() {
  return {
    query: (text: string, params: any[]) => pool.query(text, params),
    pool,
    // Add models here as they are created
    // For example:
    // users: new UserModel(pool),
    // zones: new ZoneModel(pool),
  };
}

// Close database connection
export function closeDb() {
  return pool.end();
}