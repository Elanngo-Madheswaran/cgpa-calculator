var app = angular.module('myApp', []);

app.controller('myCtrl', function($scope) {
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

    $scope.semesters = {
        "1": [
            { "name": "Communicative English", "course_code": "22ENT11", "credit": 3 },
            { "name": "Engineering Physics", "course_code": "22PHT11", "credit": 3 },
            // Add more subjects as necessary
        ],
        "2": [
            { "name": "Professional English", "course_code": "22ENT21", "credit": 3 },
            { "name": "Probability and Statistics", "course_code": "22MAT22", "credit": 4 },
            // Add more subjects as necessary
        ],
        // Add more semesters as necessary
    };

    $scope.displayTemplate = function() {
        const semester = $scope.selectedSemester;
        const subjects = $scope.semesters[semester];

        $scope.templateHeaders = subjects.map(sub => sub.name);
        $scope.templateData = []; // Reset template data

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
                $scope.results = jsonData.map(student => {
                    let totalCredits = 0;
                    let weightedSum = 0;

                    $scope.semesters[$scope.selectedSemester].forEach(subject => {
                        const gradeText = (student[subject.name] || '').toLowerCase();
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
});
