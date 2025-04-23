// Angular module for our GPA Calculator
var app = angular.module('myApp', []);

app.controller('customGpaCtrl', function($scope) {
    // Initialize variables
    $scope.step = 1; // Starting with step 1
    $scope.numSubjects = 0;
    $scope.subjects = [];
    $scope.uploadedFile = null;
    $scope.results = [];

    // Function to generate array for ng-repeat
    $scope.getNumberArray = function(num) {
        return new Array(parseInt(num || 0));
    };

    // Watch for changes in number of subjects
    $scope.$watch('numSubjects', function(newVal, oldVal) {
        if (newVal !== oldVal) {
            // Resize the subjects array
            if (newVal > oldVal) {
                // Add new subjects
                for (let i = oldVal; i < newVal; i++) {
                    $scope.subjects.push({
                        name: 'Subject ' + (i + 1),
                        credits: 3,
                        gradeType: '10point' // Changed default to 10point
                    });
                }
            } else if (newVal < oldVal) {
                // Remove excess subjects
                $scope.subjects = $scope.subjects.slice(0, newVal);
            }
        }
    });

    // Navigation between steps
    $scope.goToStep = function(stepNumber) {
        // Validation before proceeding
        if (stepNumber === 2 && $scope.step === 1) {
            // Validate all subjects have names and credits
            for (let i = 0; i < $scope.subjects.length; i++) {
                if (!$scope.subjects[i].name || !$scope.subjects[i].credits) {
                    alert('Please fill in all subject names and credit hours.');
                    return;
                }
            }
        }
        $scope.step = stepNumber;
    };

    // Generate Excel template for users to fill in
    $scope.generateTemplate = function() {
        // Create new workbook
        const wb = XLSX.utils.book_new();
        
        // Create headers for the template
        const headers = ['Student Name'];
        $scope.subjects.forEach(subject => {
            headers.push(subject.name);
        });
        
        // Create worksheet with headers
        const wsData = [headers, ['Example Student', ...Array($scope.subjects.length).fill('')]];
        
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, 'Grades Template');
        
        // Save the file
        XLSX.writeFile(wb, 'gpa_template.xlsx');
    };

    // Handle file upload
    $scope.handleFileUpload = function(fileInput) {
        if (fileInput.files && fileInput.files[0]) {
            $scope.uploadedFile = fileInput.files[0];
            $scope.$apply();
        }
    };

    // Process uploaded file and calculate GPA
    $scope.processUploadedFile = function() {
        if (!$scope.uploadedFile) {
            alert('Please upload a file first.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const wb = XLSX.read(data, { type: 'array' });
            
            // Get the first sheet
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            
            // Convert sheet to JSON
            const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
            
            // Process the data
            processData(jsonData);
        };
        reader.readAsArrayBuffer($scope.uploadedFile);
    };

    // Process data from Excel and calculate GPA
    function processData(data) {
        if (data.length < 2) {
            alert('The uploaded file does not contain enough data.');
            return;
        }

        // Reset results
        $scope.results = [];
        
        // Process each row (student) starting from row 1 (skipping headers)
        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (row.length < $scope.subjects.length + 1) continue; // Skip incomplete rows
            
            const studentName = row[0];
            const grades = row.slice(1, $scope.subjects.length + 1);
            
            // Calculate GPA
            const gpaResult = calculateGPA(grades);
            
            // Add to results with individual subject grades
            $scope.results.push({
                name: studentName,
                grades: grades,
                subjectPoints: gpaResult.subjectPoints,
                gpa: gpaResult.gpa.toFixed(2)
            });
        }
        
        // Move to results step
        $scope.goToStep(4);
        $scope.$apply();
    }

    // Calculate GPA based on grades and subject configurations
    function calculateGPA(grades) {
        let totalPoints = 0;
        let totalCredits = 0;
        const subjectPoints = [];
        
        for (let i = 0; i < grades.length; i++) {
            const grade = grades[i];
            const subject = $scope.subjects[i];
            const credits = subject.credits;
            let points = 0;
            
            // Calculate points based on grade type
            if (subject.gradeType === 'standard') {
                points = convertStandardGrade(grade);
            } else if (subject.gradeType === '10point') {
                points = convert10PointGrade(grade);
            } else if (subject.gradeType === 'custom') {
                points = convertCustomGrade(grade);
            }
            
            subjectPoints.push(points);
            totalPoints += points * credits;
            totalCredits += credits;
        }
        
        return {
            gpa: totalCredits > 0 ? (totalPoints / totalCredits) * 10 / 4 : 0, // Scale to 10-point system
            subjectPoints: subjectPoints
        };
    }

    // Convert standard letter grades to points
    function convertStandardGrade(grade) {
        const gradeMap = {
            'A+': 4.0, 'A': 4.0, 'A-': 3.7,
            'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7,
            'D+': 1.3, 'D': 1.0, 'D-': 0.7,
            'F': 0.0
        };
        
        return gradeMap[grade.toUpperCase()] || 0;
    }

    // Convert 10-point grade system (O, A+, A, B+, B, C+, C, RA)
    function convert10PointGrade(grade) {
        const gradeMap = {
            'O': 10.0,
            'A+': 9.0,
            'A': 8.0,
            'B+': 7.0,
            'B': 6.0,
            'C+': 5.0,
            'C': 4.0,
            'RA': 0.0
        };
        
        return gradeMap[grade.toUpperCase()] ? gradeMap[grade.toUpperCase()] / 10 * 4 : 0;
    }

    // Simple custom grade conversion (for future expansion)
    function convertCustomGrade(grade) {
        // Default to 10-point conversion
        return convert10PointGrade(grade);
    }

    // Download results as Excel file
    $scope.downloadResults = function() {
        if ($scope.results.length === 0) {
            alert('No results to download.');
            return;
        }
        
        // Create new workbook
        const wb = XLSX.utils.book_new();
        
        // Create headers
        const headers = ['Student Name'];
        $scope.subjects.forEach(subject => {
            headers.push(subject.name);
        });
        headers.push('GPA');
        
        // Create data rows
        const rows = [];
        rows.push(headers);
        
        $scope.results.forEach(result => {
            const row = [result.name];
            result.grades.forEach(grade => {
                row.push(grade);
            });
            row.push(result.gpa);
            rows.push(row);
        });
        
        const ws = XLSX.utils.aoa_to_sheet(rows);
        XLSX.utils.book_append_sheet(wb, ws, 'GPA Results');
        
        // Save the file
        XLSX.writeFile(wb, 'gpa_results.xlsx');
    };
});