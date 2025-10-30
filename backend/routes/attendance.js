const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Add logging middleware
router.use((req, res, next) => {
  console.log('📨 Incoming request:', req.method, req.originalUrl);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Request body:', req.body);
  }
  next();
});

// Define routes using YOUR controller function names
router.post('/attendance', attendanceController.markAttendance); // ✅ matches markAttendance
router.get('/attendance', attendanceController.getAttendance);   // ✅ matches getAttendance
router.delete('/attendance/:id', attendanceController.deleteAttendance);
router.get('/attendance/search', attendanceController.searchAttendance);
router.get('/attendance/filter', attendanceController.filterByDate);

console.log('✅ Routes registered with functions:', {
  markAttendance: typeof attendanceController.markAttendance,
  getAttendance: typeof attendanceController.getAttendance,
  deleteAttendance: typeof attendanceController.deleteAttendance,
  searchAttendance: typeof attendanceController.searchAttendance,
  filterByDate: typeof attendanceController.filterByDate
});

module.exports = router;