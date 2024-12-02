//src/exportFunctions.jsx
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import 'jspdf-autotable';

// Function to export data to PDF
export const exportToPDF = (data) => {
  // Create a new PDF document
  const doc = new jsPDF();

  // Add header
  doc.setFontSize(12);
  doc.text('Employee Details', 10, 10);

  // Add table headers
  const headers = ['SNo', 'ID','Name', 'Directorate', 'Designation','Div', 'Contact'];
  const tableRows = [];

  // Add data
  data.forEach((employee, index) => {
    const rowData = [index + 1, employee.rcNo,employee.name, employee.directorate, employee.designation,employee.div, employee.contact];
    tableRows.push(rowData);
  });

  // Draw table
  doc.autoTable({
    head: [headers],
    body: tableRows,
    startY: 20
  });

  // Save the PDF as a Blob
  return doc.output('blob');
};

// Function to export data to Excel
export const exportToExcel = (data) => {
  // Create a new workbook
  const workbook = XLSX.utils.book_new();

   // Convert data to Excel sheet format
   const sheetdata = data.map((employee, index) => ({
    //"SNo": index + 1,
    "ID": employee.rcNo,
    "Name": employee.name,
    "Directorate": employee.directorate,
    "Designation": employee.designation,
    "Div": employee.div,
    "Contact": employee.contact
  }));

  // Convert data to Excel sheet format
  const sheet = XLSX.utils.json_to_sheet(sheetdata);

  // Add the sheet to the workbook
  XLSX.utils.book_append_sheet(workbook, sheet, 'Employee Details');

  // Save the workbook as a Blob
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
};