const pool = require('../config/database');

class Attendance {
  static async create(attendanceData) {
    const { employeeName, employeeID, date, status } = attendanceData;
    const query = `
      INSERT INTO Attendance (employeeName, employeeID, date, status) 
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(query, [employeeName, employeeID, date, status]);
    return { id: result.insertId, employeeName, employeeID, date, status };
  }

  static async getAll() {
    const query = 'SELECT * FROM Attendance ORDER BY date DESC, created_at DESC';
    const [rows] = await pool.execute(query);
    return rows;
  }

  static async delete(id) {
    const query = 'DELETE FROM Attendance WHERE id = ?';
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0;
  }

  static async search(query) {
    const searchQuery = `
      SELECT * FROM Attendance 
      WHERE employeeName LIKE ? OR employeeID LIKE ? 
      ORDER BY date DESC, created_at DESC
    `;
    const [rows] = await pool.execute(searchQuery, [`%${query}%`, `%${query}%`]);
    return rows;
  }

  static async filterByDate(date) {
    const query = 'SELECT * FROM Attendance WHERE date = ? ORDER BY created_at DESC';
    const [rows] = await pool.execute(query, [date]);
    return rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM Attendance WHERE id = ?';
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
  }
}

module.exports = Attendance;