const fs = require('fs');
const path = require('path');
const { query, pool } = require('../db/connection');

async function migrate() {
  let client;
  try {
    console.log('Starting database migration...');
    console.log('Connecting to database...');
    
    // Test connection first
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection successful!');
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by semicolons and execute each statement
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    
    console.log(`Executing ${statements.length} schema statements...`);
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement && !statement.startsWith('--')) {
        try {
          await query(statement);
          console.log(`✅ Schema statement ${i + 1}/${statements.length} executed`);
        } catch (err) {
          // Ignore "already exists" errors
          if (err.message && err.message.includes('already exists')) {
            console.log(`⚠️  Statement ${i + 1}: ${err.message.split('\n')[0]}`);
          } else {
            throw err;
          }
        }
      }
    }
    
    console.log('✅ Schema migration completed');
    
    // Read and execute seed data
    const seedPath = path.join(__dirname, '../db/seed.sql');
    const seed = fs.readFileSync(seedPath, 'utf8');
    
    // For seed.sql, execute as single block since it uses DO $$ blocks
    console.log('Executing seed data...');
    try {
      await query(seed);
      console.log('✅ Seed data migration completed');
    } catch (err) {
      // Ignore duplicate key errors
      if (err.message && (err.message.includes('duplicate') || err.message.includes('already exists'))) {
        console.log('⚠️  Some seed data already exists (this is okay)');
      } else {
        throw err;
      }
    }
    
    console.log('✅ Database migration successful!');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    if (error.code === 'ETIMEDOUT') {
      console.error('\n⚠️  Connection timeout! Please check:');
      console.error('1. Your DATABASE_URL in .env file');
      console.error('2. For Supabase: Use port 5432 (direct connection), not 6543 (pooler)');
      console.error('3. Ensure SSL mode is set: ?sslmode=require');
      console.error('4. Check your internet connection');
    }
    if (pool) await pool.end();
    process.exit(1);
  }
}

migrate();

