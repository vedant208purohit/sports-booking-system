const { Pool } = require('pg');
require('dotenv').config();

// Determine SSL configuration based on connection string
const getSSLConfig = () => {
  const dbUrl = process.env.DATABASE_URL || '';
  
  // For Supabase and cloud databases, we need to accept self-signed certificates
  if (dbUrl.includes('supabase') || dbUrl.includes('neon') || dbUrl.includes('pooler')) {
    return { rejectUnauthorized: false };
  }
  
  // If connection string includes sslmode=require, use SSL
  if (dbUrl.includes('sslmode=require')) {
    return { rejectUnauthorized: false };
  }
  
  // For production, use SSL
  if (process.env.NODE_ENV === 'production') {
    return { rejectUnauthorized: false };
  }
  
  // Local development - no SSL
  return false;
};

// Create connection pool with proper timeout settings
// For Supabase, we need more aggressive timeout and connection settings
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: getSSLConfig(), // This handles SSL certificate acceptance for Supabase
  connectionTimeoutMillis: 15000, // 15 seconds
  idleTimeoutMillis: 10000,
  max: 5,
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Helper function to execute queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Query error', { text, error: error.message });
    throw error;
  }
};

// Helper function to get a client from the pool
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;
  
  // Set a timeout of 5 seconds
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
  }, 5000);
  
  // Monkey patch the query method to log the query
  client.query = (...args) => {
    client.lastQuery = args;
    return query.apply(client, args);
  };
  
  client.release = () => {
    clearTimeout(timeout);
    client.query = query;
    client.release = release;
    return release.apply(client);
  };
  
  return client;
};

module.exports = {
  query,
  getClient,
  pool
};
