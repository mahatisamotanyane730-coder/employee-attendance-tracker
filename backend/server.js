const express = require('express');
const cors = require('cors');
const attendanceRoutes = require('./routes/attendance');

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true
}));

app.use(express.json());

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: '✅ Server is working perfectly!' });
});

// Routes
app.use('/api/attendance', attendanceRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('🚀 SERVER STARTED SUCCESSFULLY!');
  console.log(`📍 Server running on port ${PORT}`);
  console.log(`📍 Frontend: http://localhost:3000`);
  console.log(`📍 Backend API: http://localhost:${PORT}/api`);
});