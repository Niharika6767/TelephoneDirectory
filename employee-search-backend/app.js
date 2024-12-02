//employee-search-backend//app.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const upload = multer({ dest: 'uploads/' });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());``
app.use(express.json());

const db = new sqlite3.Database('employees.db');

db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS employees (id TEXT ,rcNo TEXT,name TEXT, directorate TEXT, designation TEXT, div TEXT,contact TEXT)");
});
app.get('/api/employees', (req, res) => {
  const { rcNo,name, directorate, designation,div, contact } = req.query;
  const queryParams = [];
  let query = "SELECT * FROM employees WHERE 1";

  // Construct the query dynamically based on provided parameters
  if (rcNo) {
    query += " AND rcNo LIKE ?";
    queryParams.push(`%${rcNo}%`);
  }
  if (name) {
    query += " AND LOWER(name) LIKE ?";
    queryParams.push(`%${name.toLowerCase()}%`);
  }
  if (directorate) {
    query += " AND LOWER(directorate) LIKE ?";
    queryParams.push(`%${directorate.toLowerCase()}%`);
  }
  if (designation) {
    query += " AND LOWER(designation) LIKE ?";
    queryParams.push(`%${designation.toLowerCase()}%`);
  }
  if (div) {
    query += " AND LOWER(div) LIKE ?";
    queryParams.push(`%${div.toLowerCase()}%`);
  }
  if (contact) {
    query += " AND contact LIKE ?";
    queryParams.push(`%${contact}%`);
  }

  // Execute the query
  db.all(query, queryParams, (err, rows) => {
    if (err) {
      console.error('Error fetching employee data:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    res.json(rows);
  });
});


// Route to update an employee by ID
app.put('/api/employees/:id', (req, res) => {
  const employeeId = req.params.id;
  const { rcNo,name, directorate, designation,div, contact } = req.body;

  // Update the employee with the given ID
  db.run("UPDATE employees SET name = ?, directorate = ?, designation = ?, div = ?, contact = ? WHERE id = ?", 
    [name, directorate, designation,div, contact, employeeId], 
    function(err) {
      if (err) {
        console.error('Error updating employee:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
      
      // Fetch the updated employee
      db.get("SELECT * FROM employees WHERE id = ?", employeeId, (err, row) => {
        if (err) {
          console.error('Error fetching updated employee:', err);
          res.status(500).json({ error: 'Internal server error' });
          return;
        }
        res.json(row);
      });
  });
});

// Route to add a new employee
app.post('/api/employees', (req, res) => {
  const { rcNo,name, directorate, designation, div,contact } = req.body;
  // Check if the provided rcNo already exists
  db.get("SELECT * FROM employees WHERE rcNo = ?", rcNo, (err, row) => {
    if (err) {
      console.error('Error checking rcNo uniqueness:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    if (row) {
      // If rcNo already exists, return an error
      res.status(400).json({ error: 'RCNo already exists. Please provide a unique RCNo.' });
      return;
    }

  // Fetch the last ID from the database
  db.get("SELECT id FROM employees ORDER BY id DESC LIMIT 1", (err, row) => {
    if (err) {
      console.error('Error fetching last employee ID:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    // Calculate the new ID
    const newId = row ? row.id + 1 : 1;

    // Insert the new employee with the calculated ID
    db.run("INSERT INTO employees (id, rcNo, name, directorate, designation, div, contact) VALUES (?, ?, ?, ?, ?, ?, ?)", 
        [newId, rcNo, name, directorate, designation, div, contact], 
        function(err) {
      if (err) {
        console.error('Error adding new employee:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }
      res.json({ id: newId, rcNo,name, directorate, designation,div, contact });
    });
  });
});
});

app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = path.resolve(req.file.path);
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

  const employees = sheet.map((row, index) => ({
    rcNo: row.ID,
    name: row.Name,
    directorate: row.Directorate,
    designation: row.Designation,
    div: row.Div,
    contact: row.Contact,
  }));

  const insertEmployee = (employee, callback) => {
    db.run(
      "INSERT INTO employees (rcNo, name, directorate, designation, div, contact) VALUES (?, ?, ?, ?, ?, ?)",
      [employee.rcNo, employee.name, employee.directorate, employee.designation, employee.div, employee.contact],
      callback
    );
  };

  employees.forEach((employee, index) => {
    insertEmployee(employee, (err) => {
      if (err) {
        console.error('Error adding employee:', err);
        if (index === employees.length - 1) {
          return res.status(500).json({ error: 'Internal server error' });
        }
      } else {
        if (index === employees.length - 1) {
          return res.json({ success: true, message: 'Employees added successfully' });
        }
      }
    });
  });
});
// Route to delete an employee by ID
app.delete('/api/employees/:id', (req, res) => {
  const employeeId = req.params.id;

  // Delete the employee with the given ID
  db.run("DELETE FROM employees WHERE id = ?", employeeId, function(err) {
    if (err) {
      console.error('Error deleting employee:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }

    // Get all employees ordered by ID
    db.all("SELECT * FROM employees ORDER BY id", (err, rows) => {
      if (err) {
        console.error('Error fetching employees:', err);
        res.status(500).json({ error: 'Internal server error' });
        return;
      }

      // Update IDs sequentially starting from 1
      rows.forEach((row, index) => {
        db.run("UPDATE employees SET id = ? WHERE id = ?", [index + 1, row.id], function(err) {
          if (err) {
            console.error('Error updating employee ID:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
          }
        });
      });

      res.json({ success: true, message: 'Employee deleted successfully' });
    });
  });
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});