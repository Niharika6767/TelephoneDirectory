//src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';
import LoginForm from './LoginForm';
import LoginButton from './LoginButton';
import { saveAs } from 'file-saver';
import rcilogo from './images/rcilogo (1).png'; // Import the logo image

import { exportToPDF, exportToExcel } from './exportFunctions';
import FileUpload from './FileUpload';

function App() {
  const [nameQuery, setNameQuery] = useState('');
  const [rcNoQuery, setrcNoQuery] = useState('');
  const [directorateQuery, setDirectorateQuery] = useState('');
  const [designationQuery, setDesignationQuery] = useState('');
  const [divQuery, setDivQuery] = useState('');
  const [contactQuery, setContactQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    rcNo:'',
    directorate: '',
    designation: '',
    div: '',
    contact: ''
  });
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [allEmployees, setAllEmployees] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const directorateOptions = ['ASL' ,
    'ASL/HTTC', 
    'CHESS',
    'CSL',
    'Cybernetics Systems',
    'DCMM',
    'DCS',
    'DEAIS',
    'DECS',
    'DEM',
    'DESG',
    'DHILS',
    'DHPT & P',
    'DICT',
    'DIIRS-1',
    'DIIRS-2',
    'Directors Sett',
    'DLS',
    'DNEC',
    'DNS',
    'DOAI',
    'DOFI',
   ' DOMS',
    'DOPSS',
    'DP & HR',
    'DR & QA',
    'DRFS-1',
    'DRFS-2',
    'DRFT',
    'DRSS',
    'DSC',
    'DSP',
    'DSQA',
    'DSST',
    'ENTEST',
    'Garuda I',
    'Ground Systems',
    'Guest Rooms',
    'HPT&P',
    'K-15',
    'LRGB',
    'MES',
    'MRSAM',
    'MRSAM (ARMY)',
    'NASM-MR',
    'NASM-SR',
    'NECS',
    'Pinaka Project',
    'PRALAY',
    'PRITHVI (PS&PU) & NASM',
    'PROJECT RUDRAM-II',
    'Project VSHORADS',
    'PSSG',
    'RUDRAM-III',
    'SAAW',
    'SANT',
    'SINT - M',
    'SINT-E',
    'SINT-E',
    'TFC',
    'Union Office'];
  const [downloadFormat, setDownloadFormat] = useState('');

  const handleDownload = () => {
    if (downloadFormat === 'pdf') {
      const pdfBlob = exportToPDF(searchResult);
      saveAs(pdfBlob, 'employee_details.pdf');
    } else if (downloadFormat === 'excel') {
      const excelBlob = exportToExcel(searchResult);
      saveAs(excelBlob, 'employee_details.xlsx');
    } else {
      alert('Please select a download format (PDF or Excel).');
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
  };

  const handleUpdateEmployee = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/employees/${editingEmployee.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingEmployee)
      });
      alert('Employee details updated successfully!');
      setEditingEmployee(null);
      fetchAllEmployees();
    } catch (error) {
      console.error('Error updating employee:', error);
    }
  };

  const fetchAllEmployees = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/employees?showAll=true');
      const data = await response.json();
      setSearchResult(data);
    } catch (error) {
      console.error('Error fetching all employees:', error);
    }
  };

  useEffect(() => {
    setIsLoggedIn(!!loggedInUser);
  }, [loggedInUser]);

  const handleShowAll = () => {
    fetchAllEmployees();
  };

  const handleSearch = async () => {
    console.log('Searching...');
    const url = `http://localhost:5000/api/employees?rcNo=${encodeURIComponent(rcNoQuery)}&name=${encodeURIComponent(nameQuery)}&directorate=${encodeURIComponent(directorateQuery)}&designation=${encodeURIComponent(designationQuery)}&div=${encodeURIComponent(divQuery)}&contact=${encodeURIComponent(contactQuery)}`;
    console.log('Search URL:', url);
    if ( rcNoQuery || nameQuery || directorateQuery || designationQuery || divQuery || contactQuery) {
      try {
        const response = await fetch(url);
        const data = await response.json();
        setSearchResult(data);
      } catch (error) {
        console.error('Error fetching employee data:', error);
        setSearchResult([]);
      }
    } else {
      console.log("No search criteria provided");
    }
  };

  const handleLogin = (username) => {
    setLoggedInUser(username);
    setShowLoginForm(false);
  };

  const handleAddClick = () => {
    setShowAddForm(true);
  };

  const handleAddEmployee = async () => {
    if (newEmployee.contact.length !== 10 || !(/^\d+$/.test(newEmployee.contact))) {
      alert('Contact number must be exactly 10 digits long and contain only numbers.');
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/employees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEmployee)
      });
      if (response.ok) {
        const data = await response.json();
        setSearchResult(data);
        setNewEmployee({ rcNo:'', name: '', directorate: '', designation: '', div: '', contact: '' });
        setShowAddForm(false);
        alert('Employee details added successfully!');
      } else if (response.status === 400) {
        // Handle duplicate rcNo error
        alert('RCNo already exists. Please provide a unique RCNo.');
      } else {
        // Handle other errors
        alert('Error adding new employee. Please try again later.');
      }
    } catch (error) {
      console.error('Error adding new employee:', error);
    }
  };

  const handleDeleteEmployee = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/employees/${id}`, {
        method: 'DELETE'
      });
      alert('Employee deleted successfully!');
      fetchAllEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '20px',
  };

  const headerCellStyle = {
    backgroundColor: '#f2f2f2',
    fontWeight: 'bold',
    padding: '8px',
    textAlign: 'center',
    borderBottom: '1px solid #ddd',
  };

  const cellStyle = {
    padding: '8px',
    textAlign: 'center',
    borderBottom: '1px solid #ddd',
  };

  return (
    <div className="App">
      <div className="header">
        <div className="logo-container">
          <img src={rcilogo} alt="rcilogo" className="logo" />
          <h1>RCI TELEPHONE DIRECTORY</h1>
          <img src={rcilogo} alt="rcilogo" className="logo" />
        </div>
        {!isLoggedIn && (
          <LoginButton onClick={() => setShowLoginForm(true)} />
        )}
      </div>

      <div className="content">
        {showLoginForm && (
          <LoginForm visible={showLoginForm} onClose={() => setShowLoginForm(false)} onLogin={handleLogin} />
        )}
        <div className="login-container">
          {isLoggedIn ? (
            <p>Welcome, {loggedInUser}!</p>
          ) : (
            <LoginForm onLogin={handleLogin} />
          )}
        </div>
        <div className="search-container">
          <div className="search-criteria">
            <input type="text" placeholder="Enter employee ID..." value={rcNoQuery} onChange={(e) => setrcNoQuery(e.target.value)} />
            <input type="text" placeholder="Enter employee name..." value={nameQuery} onChange={(e) => setNameQuery(e.target.value)} />
            
            <select value={directorateQuery} onChange={(e) => setDirectorateQuery(e.target.value)}>
              <option value="">Select Directorate</option>
              {directorateOptions.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
            <input type="text" placeholder="Enter employee designation..." value={designationQuery} onChange={(e) => setDesignationQuery(e.target.value)} />
            <input type="text" placeholder="Enter employee div..." value={divQuery} onChange={(e) => setDivQuery(e.target.value)} />
            <input type="text" placeholder="Enter employee contact..." value={contactQuery} onChange={(e) => setContactQuery(e.target.value)} />
            <button onClick={handleSearch}>Search</button>
          </div>
          <div className="button-container">
            {isLoggedIn && (
              <>
                <button onClick={handleAddClick}>Add</button>
                <button onClick={handleShowAll}>Show All</button>
                {/* <FileUpload onUploadSuccess={fetchAllEmployees} /> */}
                <div className="download-container">
                  <button onClick={handleDownload}>Download</button>
                  <select value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value)}>
                    <option value="">Select Format</option>
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
        {showAddForm && (
          <div>
            <h2>Add Employee:</h2>
            <div>
              <input
                type="text"
                placeholder="RCNO"
                value={newEmployee.rcNo}
                onChange={(e) => setNewEmployee({ ...newEmployee, rcNo: e.target.value })}
                style={{ padding: '8px', marginRight: '10px' }} />
              <input
                type="text"
                placeholder="Name"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                style={{ padding: '8px', marginRight: '10px' }} />
                
              <select
                value={newEmployee.directorate}
                onChange={(e) => setNewEmployee({ ...newEmployee, directorate: e.target.value })}
                style={{ padding: '8px', marginRight: '10px' }}
              >
                <option value="">Select Directorate</option>
                {directorateOptions.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Designation"
                value={newEmployee.designation}
                onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })}
                style={{ padding: '8px', marginRight: '10px' }} />
              <input
                type="text"
                placeholder="div"
                value={newEmployee.div}
                onChange={(e) => setNewEmployee({ ...newEmployee, div: e.target.value })}
                style={{ padding: '8px', marginRight: '10px' }} />
              <input
                type="text"
                placeholder="Contact"
                value={newEmployee.contact}
                onChange={(e) => {
                  if (/^\d*$/.test(e.target.value) && e.target.value.length <= 10) {
                    setNewEmployee({ ...newEmployee, contact: e.target.value });
                  }
                }}
                maxLength={10}
                style={{ padding: '8px', marginRight: '10px' }} />
              <button
                onClick={handleAddEmployee}
                style={{
                  padding: '8px',
                  cursor: 'pointer',
                  backgroundColor: '#28a745',
                  color: '#fff',
                  border: 'none',
                }}
              >
                Add Employee
              </button>
            </div>
          </div>
        )}
        {searchResult && searchResult.length > 0 && (
          // <div>
          //   <h2>Search Results:</h2>
          //   <table style={tableStyle}>
          //     <tbody>
          //       <tr>
          //         <th style={headerCellStyle}>SNo</th>
          //         <th style={headerCellStyle}>RCNO</th>
          //         <th style={headerCellStyle}>Name</th>
          //         <th style={headerCellStyle}>Directorate</th>
          //         <th style={headerCellStyle}>Designation</th>
          //         <th style={headerCellStyle}>Div</th>
          //         <th style={headerCellStyle}>Contact</th>
          //         {isLoggedIn && <th style={headerCellStyle}>Actions</th>}
          //       </tr>
          //       {searchResult.map(employee => (
          //         <tr key={employee.id}>
          //           <td style={cellStyle}>{employee.id}</td>
          //           <td style={cellStyle}>{employee.rcNo}</td>
          //           <td style={cellStyle}>{employee.name}</td>
          //           <td style={cellStyle}>{employee.directorate}</td>
          //           <td style={cellStyle}>{employee.designation}</td>
          //           <td style={cellStyle}>{employee.div}</td>
          //           <td style={cellStyle}>{employee.contact}</td>
          //           {isLoggedIn && (
          //             <td style={cellStyle}>
          //               <button onClick={() => handleDeleteEmployee(employee.id)}>Delete</button>
          //               <button onClick={() => handleEditEmployee(employee)}>Edit</button>
          //               {editingEmployee && editingEmployee.id === employee.id && (
          //                 <div>
          //                   <input
          //                     type="text"
          //                     value={editingEmployee.rcNo}
          //                     onChange={(e) => setEditingEmployee({ ...editingEmployee, rcNo: e.target.value })} />
          //                   <input
          //                     type="text"
          //                     value={editingEmployee.name}
          //                     onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })} />
          //                   <select
          //                     value={editingEmployee.directorate}
          //                     onChange={(e) => setEditingEmployee({ ...editingEmployee, directorate: e.target.value })}
          //                   >
          //                     <option value="">Select Directorate</option>
          //                     {directorateOptions.map((option, index) => (
          //                       <option key={index} value={option}>{option}</option>
          //                     ))}
          //                   </select>
          //                   <input
          //                     type="text"
          //                     value={editingEmployee.designation}
          //                     onChange={(e) => setEditingEmployee({ ...editingEmployee, designation: e.target.value })} />
          //                   <input
          //                     type="text"
          //                     value={editingEmployee.div}
          //                     onChange={(e) => setEditingEmployee({ ...editingEmployee, div: e.target.value })} />
          //                   <input
          //                     type="text"
          //                     value={editingEmployee.contact}
          //                     onChange={(e) => setEditingEmployee({ ...editingEmployee, contact: e.target.value })} />
          //                   <button onClick={handleUpdateEmployee}>Update</button>
          //                 </div>
          //               )}
          //             </td>
          //           )}
          //         </tr>
          //       ))}
          //     </tbody>
          //   </table>
          // </div>
          <div>
          <h2>Search Results:</h2>
          <table style={tableStyle}>
            <tbody>
              <tr>
                <th style={headerCellStyle}>SNo</th>
                <th style={headerCellStyle}>ID</th>
                <th style={headerCellStyle}>Name</th>
                <th style={headerCellStyle}>Directorate</th>
                <th style={headerCellStyle}>Designation</th>
                <th style={headerCellStyle}>Div</th>
                <th style={headerCellStyle}>Contact</th>
                {isLoggedIn && <th style={headerCellStyle}>Actions</th>}
              </tr>
              {searchResult.map((employee, index) => (
                <tr key={employee.rcNo}>
                  <td style={cellStyle}>{index + 1}</td>
                  <td style={cellStyle}>{employee.rcNo}</td>
                  <td style={cellStyle}>{employee.name}</td>
                  <td style={cellStyle}>{employee.directorate}</td>
                  <td style={cellStyle}>{employee.designation}</td>
                  <td style={cellStyle}>{employee.div}</td>
                  <td style={cellStyle}>{employee.contact}</td>
                  {isLoggedIn && (
                    <td style={cellStyle}>
                      <button onClick={() => handleDeleteEmployee(employee.rcNo)}>Delete</button>
                      <button onClick={() => handleEditEmployee(employee)}>Edit</button>
                      {editingEmployee && editingEmployee.rcNo === employee.rcNo && (
                        <div>
                          {/* <input
                            type="text"
                            value={editingEmployee.rcNo}
                            onChange={(e) => setEditingEmployee({ ...editingEmployee, rcNo: e.target.value })}
                          /> */}
                          <input
                            type="text"
                            value={editingEmployee.name}
                            onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                          />
                          <select
                            value={editingEmployee.directorate}
                            onChange={(e) => setEditingEmployee({ ...editingEmployee, directorate: e.target.value })}
                          >
                            <option value="">Select Directorate</option>
                            {directorateOptions.map((option, index) => (
                              <option key={index} value={option}>{option}</option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={editingEmployee.designation}
                            onChange={(e) => setEditingEmployee({ ...editingEmployee, designation: e.target.value })}
                          />
                          <input
                            type="text"
                            value={editingEmployee.div}
                            onChange={(e) => setEditingEmployee({ ...editingEmployee, div: e.target.value })}
                          />
                          <input
                            type="text"
                            value={editingEmployee.contact}
                            onChange={(e) => setEditingEmployee({ ...editingEmployee, contact: e.target.value })}
                          />
                          <button onClick={handleUpdateEmployee}>Update</button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
        {(!searchResult || searchResult.length === 0) && <p>No matching employees found.</p>}
      </div>
    </div>
  );
}

export default App;

