var app = angular.module('myApp', []);

app.controller('myCtrl', function($scope, $http) {
    // Define grades with their corresponding grade points
    $scope.grades = [
        { 'value': '', 'name': 'Grade' },
        { 'value': '10', 'name': 'O' },
        { 'value': '9', 'name': 'A+' },
        { 'value': '8', 'name': 'A' },
        { 'value': '7', 'name': 'B+' },
        { 'value': '6', 'name': 'B' },
        { 'value': '5', 'name': 'C' },
        { 'value': '0', 'name': 'RA/U/AB' }
    ];

    // Create a mapping from grade names to grade points
    $scope.gradeMap = {
        'o': 10,
        'a+': 9,
        'a': 8,
        'b+': 7,
        'b': 6,
        'c': 5,
        'ra/u/ab': 0
    };

    // Load semesters data from JSON file
    $http.get('cse.json').then(function(response) {
        $scope.semesters = response.data.semesters;
        console.log("Semesters Data Loaded:", $scope.semesters); // Debugging line
    }).catch(function(error) {
        console.error('Error loading semester data:', error);
    });

    $scope.displayTemplate = function() {
        if (!$scope.selectedSemester || !$scope.semesters[$scope.selectedSemester]) {
            console.error('Selected semester is invalid or data is not loaded.');
            return;
        }

        const semester = $scope.selectedSemester;
        const subjects = $scope.semesters[semester];

        $scope.templateHeaders = subjects.map(sub => sub.name);
        $scope.templateData = []; // Reset template data

        // Clear results, uploaded data, and file input
        $scope.results = [];
        $scope.uploadedData = [];

        // Clear file input element
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.value = ''; // Reset file input
        }

        // Pre-fill with some student names (dummy data)
        for (let i = 1; i <= 3; i++) { // Adjust number of students as needed
            let studentData = { name: 'Student ' + i };
            subjects.forEach(sub => {
                studentData[sub.name] = ''; // Initialize with empty values
            });
            $scope.templateData.push(studentData);
        }
    };

    $scope.handleFile = function(input) {
        const file = input.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const data = event.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            console.log("Excel Data:", jsonData); // Debugging line

            $scope.$apply(function() {
                // Save uploaded data
                $scope.uploadedData = jsonData;

                // Calculate results based on uploaded data and selected semester
                $scope.results = jsonData.map(student => {
                    let totalCredits = 0;
                    let weightedSum = 0;

                    if (!$scope.semesters[$scope.selectedSemester]) {
                        console.error('No subjects data available for the selected semester.');
                        return { name: student['Student Name'], sgpa: 'Error' };
                    }

                    $scope.semesters[$scope.selectedSemester].forEach(subject => {
                        const gradeText = (student[subject.name] || '').trim().toLowerCase();
                        const credit = subject.credit;

                        // Convert grade text to grade points
                        const gradePoints = $scope.gradeMap[gradeText] || 0;

                        console.log(`Processing ${subject.name}: Grade ${gradeText}, Points ${gradePoints}, Credit ${credit}`); // Debugging line

                        weightedSum += gradePoints * credit;
                        totalCredits += credit;
                    });

                    let sgpa = totalCredits > 0 ? (weightedSum / totalCredits).toFixed(2) : '0.00';
                    console.log(`Student: ${student['Student Name']}, SGPA: ${sgpa}`); // Debugging line
                    return { name: student['Student Name'], sgpa: sgpa };
                });
            });
        };

        reader.readAsBinaryString(file);
    };

    // Function to download results as an Excel file
    $scope.downloadResults = function() {
        if ($scope.results.length === 0) {
            alert('No results available to download.');
            return;
        }

        // Filter out $$hashKey and other unwanted properties
        const filteredResults = $scope.results.map(result => {
            const { $$hashKey, ...filteredResult } = result; // Remove $$hashKey
            return filteredResult;
        });

        // Prepare data for the Excel file
        const ws = XLSX.utils.json_to_sheet(filteredResults, {
            header: ['name', 'sgpa'],
            skipHeader: false
        });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'SGPA Results');
        
        // Generate Excel file and trigger download
        XLSX.writeFile(wb, 'SGPA_Results.xlsx');
    };
});
