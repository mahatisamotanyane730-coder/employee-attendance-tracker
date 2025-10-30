const Attendance = require('../models/Attendance');

exports.markAttendance = async (req, res) => {
  try {
    const { employeeName, employeeID, date, status } = req.body;

    console.log('📥 Received data from frontend:', {
      employeeName,
      employeeID, 
      date,
      status
    });

    // Validation
    if (!employeeName || !employeeID || !date || !status) {
      console.log('❌ Missing fields:', { employeeName, employeeID, date, status });
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['Present', 'Absent'].includes(status)) {
      return res.status(400).json({ error: 'Status must be Present or Absent' });
    }

    const newAttendance = await Attendance.create({ 
      employeeName, 
      employeeID, 
      date, 
      status 
    });

    console.log('✅ Saved to database:', newAttendance);
    
    res.status(201).json({
      message: 'Attendance marked successfully',
      record: newAttendance
    });
  } catch (error) {
    console.error('❌ Error marking attendance:', error);
    res.status(500).json({ error: 'Failed to mark attendance' });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.getAll();
    console.log('📊 Sending attendance data:', attendance.length + ' records');
    res.json(attendance);
  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting record ID:', id);
    
    const deletedRecord = await Attendance.delete(id);
    
    if (!deletedRecord) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    
    console.log('✅ Deleted record:', deletedRecord);
    res.json({ 
      message: 'Attendance record deleted successfully',
      deletedRecord 
    });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ error: 'Failed to delete attendance record' });
  }
};

exports.searchAttendance = async (req, res) => {
  try {
    const { query } = req.query;
    console.log('🔍 Searching for:', query);
    
    if (!query || query.trim() === '') {
      const allRecords = await Attendance.getAll();
      return res.json(allRecords);
    }
    
    const results = await Attendance.search(query);
    console.log('🔍 Search results:', results.length + ' records');
    res.json(results);
  } catch (error) {
    console.error('Error searching attendance:', error);
    res.status(500).json({ error: 'Failed to search attendance records' });
  }
};

exports.filterByDate = async (req, res) => {
  try {
    const { date } = req.query;
    console.log('📅 Filtering by date:', date);
    
    if (!date) {
      const allRecords = await Attendance.getAll();
      return res.json(allRecords);
    }
    
    const results = await Attendance.filterByDate(date);
    console.log('📅 Date filter results:', results.length + ' records');
    res.json(results);
  } catch (error) {
    console.error('Error filtering attendance:', error);
    res.status(500).json({ error: 'Failed to filter attendance records' });
  }
};