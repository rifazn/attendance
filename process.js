// Global array to hold attendance data
let attendanceData = [];

// Function to handle the file upload (both CSV and Excel)
function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select a file to upload.");
        return;
    }

    // Check file type
    const fileType = file.name.split('.').pop().toLowerCase();
    if (fileType === 'csv') {
        processCSV(file);
    } else if (fileType === 'xlsx') {
        processExcel(file);
    } else {
        alert("Unsupported file type. Please upload a CSV or Excel file.");
    }
}

// Function to process CSV file
function processCSV(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result.trim();
        const rows = content.split('\n');
        const headers = rows[0].split(',').map(header => header.trim());  // Trim spaces

        // Parse CSV into an array of objects
        attendanceData = rows.slice(1).map(row => {
            const values = row.split(',').map(value => value.trim());  // Trim spaces
            let record = {};
            headers.forEach((header, index) => {
                record[header] = values[index] || '';  // Handle missing values
            });
            return record;
        });

        // Log the data to inspect
        console.log(attendanceData);

        // Populate employee dropdown and show table
        populateEmployeeDropdown();
        alert("CSV file uploaded and processed successfully.");
    };
    reader.readAsText(file);
}

// Function to process Excel file using SheetJS
function processExcel(file) {
    const reader = new FileReader();
    reader.onload = function (e) {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Assume the first sheet contains the attendance data
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const headers = rows[0];
        attendanceData = rows.slice(1).map(row => {
            let record = {};
            headers.forEach((header, index) => {
                record[header] = row[index]?.toString().trim() || '';  // Handle missing values
            });
            return record;
        });

        // Log the data to inspect
        console.log(attendanceData);

        // Populate employee dropdown and show table
        populateEmployeeDropdown();
        alert("Excel file uploaded and processed successfully.");
    };
    reader.readAsBinaryString(file);
}

// Populate employee dropdown with unique employee names
function populateEmployeeDropdown() {
    const employeeDropdown = document.getElementById('employeeDropdown');

    // Get unique employee names based on the "Name" column
    const employees = [...new Set(attendanceData.map(record => record['Name']))];

    // Clear existing options before adding
    employeeDropdown.innerHTML = `<option value="">--Select Employee--</option>`;

    employees.forEach(employee => {
        const option = document.createElement('option');
        option.value = employee;
        option.textContent = employee;
        employeeDropdown.appendChild(option);
    });
}

// Function to fetch and display the attendance report based on filters
function fetchAttendance() {
    const employeeName = document.getElementById('employeeDropdown').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    let filteredData = attendanceData;

    // Apply employee filter
    if (employeeName) {
        filteredData = filteredData.filter(record => record['Name'] === employeeName);
    }

    // Apply date range filter
    if (startDate) {
        filteredData = filteredData.filter(record => new Date(record['Date']) >= new Date(startDate));
    }
    if (endDate) {
        filteredData = filteredData.filter(record => new Date(record['Date']) <= new Date(endDate));
    }

    displayAttendanceTable(filteredData);
}

// Function to display filtered attendance data in a table
function displayAttendanceTable(filteredData) {
    const tableBody = document.getElementById('attendanceTableBody');
    tableBody.innerHTML = ""; // Clear existing rows

    if (filteredData.length === 0) {
        alert("No records found.");
        document.getElementById('attendanceTable').style.display = "none";
        return;
    }

    filteredData.forEach(record => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${record['Date']}</td>
            <td>${record['Clock In']}</td>
            <td>${record['Clock Out']}</td>
        `;
        tableBody.appendChild(row);
    });

    document.getElementById('attendanceTable').style.display = "table";
}
