const pool = require('../config/database');

class Attendance {
  static async create(attendanceData) {
    const { employeeName, employeeID, date, status } = attendanceData;
    const query = `
      INSERT INTO Attendance (employeeName, employeeID, date, status) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *
    `;
    
    const values = [employeeName, employeeID, date, status];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async getAll() {
    const query = 'SELECT * FROM Attendance ORDER BY date DESC, created_at DESC';
    const result = await pool.query(query);
    return result.rows;
  }

  static async delete(id) {
    const query = 'DELETE FROM Attendance WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async search(query) {
    const searchQuery = `
      SELECT * FROM Attendance 
      WHERE employeeName ILIKE $1 OR employeeID ILIKE $1 
      ORDER BY date DESC, created_at DESC
    `;
    const result = await pool.query(searchQuery, [`%${query}%`]);
    return result.rows;
  }

  static async filterByDate(date) {
    const query = 'SELECT * FROM Attendance WHERE date = $1 ORDER BY created_at DESC';
    const result = await pool.query(query, [date]);
    return result.rows;
  }

  static async getById(id) {
    const query = 'SELECT * FROM Attendance WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Attendance;