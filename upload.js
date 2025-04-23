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
    $http.get($scope.selectedDepartment + '.json').then(function (res) {
      $scope.subjectData = res.data;
    });
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
});
