const mysql = require('mysql2');
require('dotenv').config();

console.log('🔌 Connecting to Railway MySQL...');
console.log('MYSQLHOST:', process.env.MYSQLHOST);
console.log('MYSQLPORT:', process.env.MYSQLPORT);
console.log('MYSQLUSER:', process.env.MYSQLUSER);
console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE);

// Create connection pool with better error handling
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000, // 30 seconds
  acquireTimeout: 30000,
  timeout: 30000,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  reconnect: true
});

const promisePool = pool.promise();

// Test connection with retry logic
const initializeDatabase = async (retries = 3, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await promisePool.getConnection();
      console.log('✅ Connected to Railway MySQL successfully!');
      
      // Create attendance table
      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS attendance (
          id INT AUTO_INCREMENT PRIMARY KEY,
          employeeName VARCHAR(255) NOT NULL,
          employeeID VARCHAR(255) NOT NULL,
          date DATE NOT NULL,
          status ENUM('Present', 'Absent') NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      await connection.query(createTableQuery);
      console.log('✅ Attendance table ready in Railway MySQL');
      
      // Check if table has data
      const [rows] = await connection.query('SELECT COUNT(*) as count FROM attendance');
      console.log(`📊 Current records in Railway: ${rows[0].count}`);
      
      connection.release();
      return; // Success, exit function
    } catch (error) {
      console.error(`❌ Database connection attempt ${i + 1} failed:`, error.message);
      
      if (i < retries - 1) {
        console.log(`🔄 Retrying in ${delay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('💥 All database connection attempts failed');
        console.log('💡 Check your Railway credentials and network connection');
      }
    }
  }
};

// Don't block server startup on database connection
setTimeout(() => {
  initializeDatabase();
}, 1000);

module.exports = promisePool;