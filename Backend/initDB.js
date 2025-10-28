const mariadb = require('mariadb');

//Creating a connection with a pool
const pool = mariadb.createPool({
  host: 'localhost',
  user: 'simon',        // your DB user
  password: 'Javajuma', // your DB password
  connectionLimit: 6
});

async function init() {
  let conn;
  try {
    conn = await pool.getConnection();

    // 1. Create database if it doesn't exist
    await conn.query("CREATE DATABASE IF NOT EXISTS testdb");
    console.log("Database created or already exists.");

    // 2. Use the database
    await conn.query("USE testdb");

    // 3. Create 'users' table for signup/login
    await conn.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        fullname VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("Users table created successfully.");

  } catch (err) {
    console.error("DB Error: ", err);
  } finally {
    if (conn) conn.release();
    process.exit();
  }
}

init();
