const mysql = require('mysql2/promise');
require('dotenv').config();

// Create a connection pool with better settings
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'christ_praises',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  // Handle connection errors gracefully
  namedPlaceholders: false,
});

// Test connection on startup
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    // Retry after 5 seconds
    setTimeout(testConnection, 5000);
  }
};

testConnection();

// Helper function to execute queries with retry
const executeWithRetry = async (sql, params, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await pool.execute(sql, params);
    } catch (error) {
      if (
        (error.code === 'ER_MALFORMED_PACKET' || 
         error.code === 'PROTOCOL_CONNECTION_LOST' ||
         error.code === 'ECONNRESET') && 
        i < retries - 1
      ) {
        console.log(`Database query failed, retrying (${i + 1}/${retries})...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
      throw error;
    }
  }
};

// Export both pool and helper
module.exports = pool;
module.exports.executeWithRetry = executeWithRetry;
