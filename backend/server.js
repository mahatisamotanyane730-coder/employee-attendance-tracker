const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enhanced CORS configuration for production
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://employee-attendance-backend-xzwb.onrender.com',
      // Add your frontend production URLs here when deployed
      'https://your-frontend-app.onrender.com',
      'https://your-frontend-app.netlify.app'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Security middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`🌐 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  next();
});

// Import database connection
console.log('🔌 Initializing database connection...');
require('./config/database');

// Routes - Mount attendance routes at /api
const attendanceRoutes = require('./routes/attendance');
app.use('/api', attendanceRoutes);

// Health check route with detailed info
app.get('/health', (req, res) => {
  res.status(200).json({ 
    message: '✅ Server is running', 
    environment: process.env.NODE_ENV || 'development',
    database: 'MySQL Connected',
    timestamp: new Date().toISOString(),
    uptime: `${process.uptime().toFixed(2)} seconds`,
    memory: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
  });
});

// Enhanced database test route
app.get('/test-db', async (req, res) => {
  try {
    const db = require('./config/database');
    const [rows] = await db.execute('SELECT 1 as test');
    
    // Get database info
    const [dbInfo] = await db.execute('SELECT DATABASE() as db_name, USER() as user');
    const [tableCount] = await db.execute('SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE()');
    
    res.json({ 
      database: '✅ Connected to MySQL database',
      connection: {
        database: dbInfo[0].db_name,
        user: dbInfo[0].user
      },
      tables: tableCount[0].count,
      test: rows[0].test 
    });
  } catch (error) {
    console.error('❌ Database test failed:', error);
    res.status(500).json({ 
      database: '❌ Database connection failed',
      error: error.message,
      details: 'Check your database credentials and connection'
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
      records: records.slice(0, 5) // Return only first 5 records for preview
    });
  } catch (error) {
    console.error('❌ Attendance test failed:', error);
    res.status(500).json({
      error: 'Attendance route failed',
      details: error.message
    });
  }
});
app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});
// Root route - Welcome page
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Employee Attendance Tracker API',
    version: '1.0.0',
    status: 'Running',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    endpoints: {
      documentation: '/api-docs',
      health: '/health',
      database_test: '/test-db',
      api: {
        base: '/api',
        mark_attendance: 'POST /api/attendance',
        get_attendance: 'GET /api/attendance',
        delete_attendance: 'DELETE /api/attendance/:id',
        search_attendance: 'GET /api/attendance/search?query=',
        filter_attendance: 'GET /api/attendance/filter?date='
      }
    },
    frontend: 'https://your-frontend-url.com (update when deployed)',
    repository: 'https://github.com/your-username/employee-attendance-tracker'
  });
});

// API documentation route
app.get('/api-docs', (req, res) => {
  res.json({
    message: 'Employee Attendance Tracker API',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      database_test: 'GET /test-db',
      attendance_test: 'GET /test-attendance',
      api: {
        mark_attendance: 'POST /api/attendance',
        get_attendance: 'GET /api/attendance',
        delete_attendance: 'DELETE /api/attendance/:id',
        search_attendance: 'GET /api/attendance/search?query=',
        filter_attendance: 'GET /api/attendance/filter?date='
      }
    },
    example_request: {
      mark_attendance: {
        method: 'POST',
        url: '/api/attendance',
        body: {
          employeeName: 'John Doe',
          employeeID: 'EMP001',
          date: '2024-01-15',
          status: 'Present'
        }
      }
    }
  });
});

// Rate limiting middleware (basic example)
const requestCounts = new Map();
app.use((req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 100; // max 100 requests per window
  
  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, { count: 1, startTime: now });
  } else {
    const ipData = requestCounts.get(ip);
    if (now - ipData.startTime > windowMs) {
      // Reset counter
      ipData.count = 1;
      ipData.startTime = now;
    } else {
      ipData.count++;
    }
    
    if (ipData.count > maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Please try again later'
      });
    }
  }
  
  next();
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Unhandled error:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });
  
  // CORS error
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({ 
      error: 'CORS policy violation',
      message: 'Origin not allowed'
    });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : error.message
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
      'GET /health - Server health check',
      'GET /test-db - Database connection test', 
      'GET /test-attendance - Attendance API test',
      'GET /api-docs - API documentation',
      'POST /api/attendance - Mark attendance',
      'GET /api/attendance - Get all attendance',
      'DELETE /api/attendance/:id - Delete attendance record',
      'GET /api/attendance/search?query= - Search attendance',
      'GET /api/attendance/filter?date= - Filter by date'
    ],
    documentation: '/api-docs'
  });
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('🛑 Server shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('🛑 Server shutting down gracefully...');
  process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️  DB test: http://localhost:${PORT}/test-db`);
  console.log(`👤 Test attendance: http://localhost:${PORT}/test-attendance`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

module.exports = app;