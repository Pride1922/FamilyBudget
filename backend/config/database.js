const mysql = require('mysql2');
require('dotenv').config();  // Load environment variables

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,      // Maximum number of connections in the pool
  queueLimit: 0             // Unlimited requests waiting for a connection
});

// Promisify the pool's query function for convenience with async/await
const db = pool.promise();

// Export the pool for use in other parts of the application
module.exports = db;
