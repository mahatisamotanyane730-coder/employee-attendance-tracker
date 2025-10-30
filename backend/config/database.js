const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'attendance_tracker',
  password: process.env.DB_PASSWORD || 'your_password_here',
  port: process.env.DB_PORT || 5432,
});

// Test connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to PostgreSQL:', err.message);
  } else {
    console.log('✅ Connected to PostgreSQL database successfully!');
    release();
  }
});

// Create table if not exists (optional - you already created it in PGAdmin)
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS Attendance (
    id SERIAL PRIMARY KEY,
    employeeName VARCHAR(255) NOT NULL,
    employeeID VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('Present', 'Absent')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`;

pool.query(createTableQuery, (err) => {
  if (err) {
    console.error('Error creating table:', err);
  } else {
    console.log('✅ Attendance table is ready');
  }
});

module.exports = pool;