import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { users, liquidityPools, transactions } from '../shared/schema';
import { eq, or } from 'drizzle-orm';

const { Pool } = pg;

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create a Drizzle instance
export const db = drizzle(pool);

// Run a simple query to ensure the database is properly connected
export async function testDatabaseConnection() {
  try {
    await pool.query('SELECT NOW()');
    console.log('PostgreSQL database connected successfully');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}