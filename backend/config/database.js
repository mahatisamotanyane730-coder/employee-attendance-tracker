const mysql = require('mysql2');
require('dotenv').config();

console.log('🔌 Connecting to Railway MySQL...');
console.log('MYSQLHOST:', process.env.MYSQLHOST);
console.log('MYSQLPORT:', process.env.MYSQLPORT);
console.log('MYSQLUSER:', process.env.MYSQLUSER);
console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE);

// Create connection pool for Railway MySQL
const pool = mysql.createPool({
  host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 60000,
  ssl: { rejectUnauthorized: false } // Railway requires SSL
});

const promisePool = pool.promise();

// Test connection and create table
const initializeDatabase = async () => {
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
  } catch (error) {
    console.error('❌ Railway MySQL connection failed:', error.message);
    console.log('💡 Check your Railway credentials in .env file');
  }
};

initializeDatabase();

module.exports = promisePool;