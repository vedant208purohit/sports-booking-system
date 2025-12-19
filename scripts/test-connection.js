const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
  console.log('Testing database connection...');
  console.log('Connection string:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'));
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { 
      rejectUnauthorized: false  // Required for Supabase self-signed certificates
    },
    connectionTimeoutMillis: 15000,
    query_timeout: 15000,
    statement_timeout: 15000,
  });

  try {
    console.log('\nAttempting to connect...');
    const client = await pool.connect();
    console.log('✅ Connection successful!');
    
    const result = await client.query('SELECT NOW() as time, current_database() as database');
    console.log('✅ Query successful!');
    console.log('Database:', result.rows[0].database);
    console.log('Server time:', result.rows[0].time);
    
    // Test if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('\n✅ Tables in database:');
    if (tablesResult.rows.length === 0) {
      console.log('  (No tables found - run migrations first)');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`);
      });
    }
    
    client.release();
    await pool.end();
    console.log('\n✅ Connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Connection failed!');
    console.error('Error:', error.message);
    console.error('Code:', error.code);
    
    if (error.code === 'ETIMEDOUT') {
      console.error('\n⚠️  Connection timeout detected.');
      console.error('\nPossible solutions:');
      console.error('1. Check your internet connection');
      console.error('2. Verify Supabase project is not paused');
      console.error('3. Try using Transaction mode connection string from Supabase');
      console.error('4. Check if your IP is blocked by Supabase firewall');
    }
    
    await pool.end();
    process.exit(1);
  }
}

testConnection();

