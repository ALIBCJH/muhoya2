require('dotenv').config();
const { Pool } = require('pg');

// Create a connection pool
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  database: 'postgres', // Connect to default postgres database first
});

async function testConnection() {
  console.log('\n🔍 Testing PostgreSQL Connection...\n');
  console.log('Configuration:');
  console.log('  Host:', process.env.DB_HOST || 'localhost');
  console.log('  Port:', process.env.DB_PORT || 5432);
  console.log('  User:', process.env.DB_USER || 'postgres');
  console.log('  Password:', process.env.DB_PASSWORD ? '***' + process.env.DB_PASSWORD.slice(-3) : 'NOT SET');
  console.log('');

  try {
    // Test basic connection
    console.log('Step 1: Testing connection to PostgreSQL...');
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL successfully!\n');

    // Check PostgreSQL version
    console.log('Step 2: Checking PostgreSQL version...');
    const versionResult = await client.query('SELECT version()');
    console.log('✅ PostgreSQL Version:', versionResult.rows[0].version.split(',')[0]);
    console.log('');

    // Check if garage_db exists
    console.log('Step 3: Checking if garage_db exists...');
    const dbCheckResult = await client.query(
      "SELECT datname FROM pg_database WHERE datname = 'garage_db'"
    );

    if (dbCheckResult.rows.length > 0) {
      console.log('✅ Database "garage_db" exists!');
      
      // Test connection to garage_db
      client.release();
      const garagePool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
        database: 'garage_db',
      });

      const garageClient = await garagePool.connect();
      console.log('✅ Successfully connected to garage_db!\n');

      // Check tables
      console.log('Step 4: Checking tables in garage_db...');
      const tablesResult = await garageClient.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);

      if (tablesResult.rows.length > 0) {
        console.log(`✅ Found ${tablesResult.rows.length} tables:`);
        tablesResult.rows.forEach(row => {
          console.log(`   - ${row.table_name}`);
        });
      } else {
        console.log('⚠️  No tables found. Run: npm run db:setup');
      }

      garageClient.release();
      await garagePool.end();
    } else {
      console.log('❌ Database "garage_db" does NOT exist!');
      console.log('');
      console.log('To create it, run:');
      console.log('  psql -U postgres -c "CREATE DATABASE garage_db;"');
      console.log('  OR');
      console.log('  npm run db:setup');
      client.release();
    }

    console.log('\n✅ Database connection test completed!\n');
    process.exit(0);

  } catch (err) {
    console.error('\n❌ Connection Error:', err.message);
    console.error('\n📝 Troubleshooting:');
    
    if (err.message.includes('password authentication failed')) {
      console.error('  - Incorrect password. Update DB_PASSWORD in .env file');
      console.error('  - Default password might be empty or different');
      console.error('  - Try: psql -U postgres (to test password)');
    } else if (err.message.includes('does not exist')) {
      console.error('  - User "postgres" might not exist');
      console.error('  - Check available users with: psql -U postgres -c "\\du"');
    } else if (err.message.includes('ECONNREFUSED')) {
      console.error('  - PostgreSQL is not running');
      console.error('  - Start it with: sudo systemctl start postgresql');
    } else {
      console.error('  - Check your .env configuration');
      console.error('  - Ensure PostgreSQL is running: systemctl status postgresql');
    }

    console.error('\nFull error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
