const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Add logging middleware
router.use((req, res, next) => {
  console.log('📨 Incoming request:', req.method, req.url);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Request body:', req.body);
  }
  next();
});

// Define all routes
router.post('/', attendanceController.markAttendance);
router.get('/', attendanceController.getAttendance);
router.delete('/:id', attendanceController.deleteAttendance);
router.get('/search', attendanceController.searchAttendance);
router.get('/filter', attendanceController.filterByDate);

module.exports = router;