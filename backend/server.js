const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}));

app.use(express.json());

// Import database connection
require('./config/database');

// Routes - Mount attendance routes at /api
const attendanceRoutes = require('./routes/attendance');
app.use('/api', attendanceRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ 
    message: '✅ Server is running', 
    database: 'MySQL Connected',
    timestamp: new Date().toISOString() 
  });
});

// Database test route
app.get('/test-db', async (req, res) => {
  try {
    const db = require('./config/database');
    const [rows] = await db.execute('SELECT 1 as test');
    res.json({ 
      database: '✅ Connected to MySQL database',
      test: rows[0].test 
    });
  } catch (error) {
    res.status(500).json({ 
      database: '❌ Database connection failed',
      error: error.message 
    });
  }
});

// Test the attendance route directly
app.get('/test-attendance', async (req, res) => {
  try {
    const Attendance = require('./models/Attendance');
    const records = await Attendance.getAll();
    res.json({
      message: '✅ Attendance route working',
      recordCount: records.length,
      records: records
    });
  } catch (error) {
    res.status(500).json({
      error: 'Attendance route failed',
      details: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// 404 handler - Improved to show available routes
app.use('*', (req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    path: req.originalUrl,
    availableRoutes: [
      'GET /health',
      'GET /test-db', 
      'GET /test-attendance',
      'POST /api/attendance',
      'GET /api/attendance',
      'DELETE /api/attendance/:id',
      'GET /api/attendance/search?query=',
      'GET /api/attendance/filter?date='
    ]
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️  DB test: http://localhost:${PORT}/test-db`);
  console.log(`👤 Test attendance: http://localhost:${PORT}/test-attendance`);
  console.log(`📝 API Base: http://localhost:${PORT}/api`);
});