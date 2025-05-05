var app = angular.module('myApp', []);

app.controller('myCtrl', function($scope, $http) {
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

    // Load the selected department from local storage if it exists
    $scope.selectedDepartment = window.localStorage.getItem('selectedDepartment') || '';

    // Function to load department-specific data
    $scope.loadDepartmentData = function() {
        if ($scope.selectedDepartment) {
            // Save the selected department to local storage
            window.localStorage.setItem('selectedDepartment', $scope.selectedDepartment);

            // If custom department is selected, check if we have stored data
            if ($scope.selectedDepartment === 'custom') {
                const storedCustomData = window.localStorage.getItem('customDepartmentData');
                if (storedCustomData) {
                    try {
                        const jsonData = JSON.parse(storedCustomData);
                        $scope.sem_data = jsonData.semesters;
                        console.log("Data loaded from stored custom JSON:", $scope.sem_data);
                        
                        let local_data = JSON.parse(window.localStorage.getItem('result'));
                        if (local_data) {
                            for (let sem in $scope.sem_data) {
                                for (let sub in $scope.sem_data[sem]) {
                                    $scope.sem_data[sem][sub].grade = local_data[$scope.sem_data[sem][sub].course_code] || "";
                                }
                            }
                        }
                        
                        $scope.calc(); // Recalculate based on loaded data
                        return;
                    } catch (error) {
                        console.error("Error loading stored custom JSON:", error);
                    }
                }
                // If we don't have stored data or loading fails, we wait for the user to upload a file
                $scope.sem_data = {};
                return;
            }

            let departmentFile = ''; // Initialize the variable for the file name

            // Determine the JSON file based on the selected department
            if ($scope.selectedDepartment === 'cse') {
                departmentFile = 'cse.json';
            } else if ($scope.selectedDepartment === 'ece') {
                departmentFile = 'ece.json';
            } else if ($scope.selectedDepartment === 'eee') {
                departmentFile = 'eee.json';
            }
            // Add more conditions if you have more departments

            if (departmentFile) {
                $http.get(departmentFile).then(function(response) {
                    $scope.sem_data = response.data.semesters;
                    console.log("Data loaded from JSON:", $scope.sem_data);

                    let local_data = JSON.parse(window.localStorage.getItem('result'));
                    if (local_data) {
                        for (let sem in $scope.sem_data) {
                            for (let sub in $scope.sem_data[sem]) {
                                $scope.sem_data[sem][sub].grade = local_data[$scope.sem_data[sem][sub].course_code] || "";
                            }
                        }
                    }

                    $scope.calc(); // Recalculate based on loaded data
                }).catch(function(error) {
                    console.error("Error loading JSON data:", error);
                });
            } else {
                console.error("Invalid department selected or no file available for this department.");
            }
        }
    };

    $scope.calc = function() {
        let data = [];
        let final_data = {};

        let cgpa = 0;
        let total_points = 0;
        for (let sem in $scope.sem_data) {
            let sgpa = 0;
            let points = 0;
            for (let sub in $scope.sem_data[sem]) {
                let credit = $scope.sem_data[sem][sub].credit;
                let grade = parseInt($scope.sem_data[sem][sub].grade) || 0;

                if (grade != 0) {
                    sgpa += credit * grade;
                    points += credit;
                }
                final_data[$scope.sem_data[sem][sub].course_code] = $scope.sem_data[sem][sub].grade;
            }

            cgpa += sgpa;
            total_points += points;

            data.push({
                "sem": parseInt(sem) + 1, // Display semester number starting from 1
                "sgpa": ((sgpa / points) || 0).toFixed(2),
                "cgpa": ((cgpa / total_points) || 0).toFixed(2)
            });
        }
        $scope.result = data;
        window.localStorage.setItem('result', JSON.stringify(final_data));
    };

    // Automatically load data for the stored department when the page loads
    if ($scope.selectedDepartment) {
        // Call the loadDepartmentData function explicitly to update the data and title
        $scope.loadDepartmentData();
    }

    // Add these functions to the myCtrl controller

    // Function to upload and process custom JSON
    $scope.uploadCustomJSON = function() {
        const fileInput = document.getElementById('jsonFileInput');
        
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Please select a JSON file to upload.');
            return;
        }
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const jsonData = JSON.parse(e.target.result);
                
                // Validate the JSON structure
                if (!validateDepartmentJSON(jsonData)) {
                    alert('Invalid JSON format. Please ensure it follows the required structure or create a proper JSON file using the Department Creator.');
                    return;
                }
                
                // Store the custom data in local storage for future use
                window.localStorage.setItem('customDepartmentData', e.target.result);
                
                // Process the custom department data
                $scope.sem_data = jsonData.semesters;
                console.log("Data loaded from custom JSON:", $scope.sem_data);
                
                // Apply any saved grades from local storage
                let local_data = JSON.parse(window.localStorage.getItem('result'));
                if (local_data) {
                    for (let sem in $scope.sem_data) {
                        for (let sub in $scope.sem_data[sem]) {
                            $scope.sem_data[sem][sub].grade = local_data[$scope.sem_data[sem][sub].course_code] || "";
                        }
                    }
                }
                
                $scope.$apply(); // Apply changes to update the UI
                $scope.calc(); // Recalculate based on loaded data
                
                // Notify the user
                alert('Custom department data loaded successfully!');
                
            } catch (error) {
                console.error("Error processing JSON:", error);
                alert('Error processing JSON file: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };

    // Function to validate the department JSON structure
    function validateDepartmentJSON(json) {
        // Check if the JSON has a semesters object
        if (!json.semesters) {
            return false;
        }
        
        // Check if there's at least one semester
        if (Object.keys(json.semesters).length === 0) {
            return false;
        }
        
        // Check the structure of each semester
        for (let semKey in json.semesters) {
            const semester = json.semesters[semKey];
            
            // Ensure the semester is an array
            if (!Array.isArray(semester)) {
                return false;
            }
            
            // Ensure each subject has the required properties
            for (let subject of semester) {
                if (!subject.hasOwnProperty('name') || 
                    !subject.hasOwnProperty('course_code') || 
                    !subject.hasOwnProperty('credit') || 
                    !subject.hasOwnProperty('grade')) {
                    return false;
                }
            }
        }
        
        return true;
    }
});
