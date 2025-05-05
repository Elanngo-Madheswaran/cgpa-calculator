var app = angular.module('sgpaApp', []);

app.directive('fileReader', function () {
    return {
      scope: {
        fileReader: "&"
      },
      link: function (scope, element) {
        element.on('change', function (changeEvent) {
          var reader = new FileReader();
          reader.onload = function (e) {
            scope.$apply(function () {
              scope.fileReader({ $fileContent: e.target.result });
            });
          };
          // Use ArrayBuffer to support binary Excel parsing
          reader.readAsArrayBuffer(changeEvent.target.files[0]);
        });
      }
    };
  });
  

app.controller('SGPAController', function ($scope, $http) {
  $scope.subjectData = {};
  $scope.templateHeaders = [];
  $scope.templateSample = { name: "John Doe" };
  $scope.results = [];

  $scope.loadJSON = function () {
    if ($scope.selectedDepartment === 'custom') {
        const storedCustomData = window.localStorage.getItem('customDepartmentData');
        if (storedCustomData) {
            try {
                $scope.subjectData = JSON.parse(storedCustomData);
            } catch (error) {
                console.error("Error loading stored custom JSON:", error);
                $scope.subjectData = {};
            }
        } else {
            // No stored data, need to upload
            $scope.subjectData = {};
        }
    } else {
        $http.get($scope.selectedDepartment + '.json').then(function(res) {
            $scope.subjectData = res.data;
        });
    }
  };

  $scope.generateTemplate = function () {
    const subjects = $scope.subjectData.semesters[$scope.selectedSemester];
    $scope.templateHeaders = subjects.map(s => s.name);
    $scope.templateSample = { name: "John Doe" };
    $scope.templateHeaders.forEach(name => {
      $scope.templateSample[name] = '';
    });
  };

  $scope.downloadTemplate = function () {
    const headers = ['Student Name', ...$scope.templateHeaders];
    const sampleRow = ['John Doe', ...$scope.templateHeaders.map(() => '')];
    
    const worksheetData = [headers, sampleRow];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');

    XLSX.writeFile(workbook, 'SGPA_Template.xlsx');
  };

  $scope.processExcel = function (content) {
    const workbook = XLSX.read(content, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  
    const subjects = $scope.subjectData.semesters[$scope.selectedSemester];
  
    $scope.results = jsonData.map(row => {
      let name = row['Student Name'] || row['Name'];
      let totalCredits = 0;
      let weightedSum = 0;
  
      subjects.forEach((subject, i) => {
        const grade = row[subject.name];
        const credit = subject.credit;
        const gradePoint = convertGradeToPoint(grade);
        weightedSum += gradePoint * credit;
        totalCredits += credit;
      });
  
      return {
        name,
        sgpa: (weightedSum / totalCredits).toFixed(2)
      };
    });
  };
  

  $scope.downloadResults = function () {
    const headers = ['Student Name', 'SGPA'];
    const rows = $scope.results.map(r => [r.name, r.sgpa]);

    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SGPA Results');

    XLSX.writeFile(workbook, 'SGPA_Results.xlsx');
  };

  function convertGradeToPoint(grade) {
    const map = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'RA': 0, 'SA': 0, 'WH': 0 };
    return map[grade.trim().toUpperCase()] || 0;
  }

  // Add these functions to the SGPAController

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
              $scope.subjectData = jsonData;
              
              $scope.$apply(); // Apply changes to update the UI
              
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
                  !subject.hasOwnProperty('credit')) {
                  return false;
              }
          }
      }
      
      return true;
  }
});
