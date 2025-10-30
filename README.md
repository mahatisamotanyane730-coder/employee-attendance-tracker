## 🗄️ Database

This project uses **MySQL** with the following setup:

### Database Schema
```sql
CREATE TABLE Attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employeeName VARCHAR(255) NOT NULL,
    employeeID VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    status ENUM('Present', 'Absent') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);