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

    $scope.loadData = function() {
        if ($scope.selectedDepartment) {
            let fileName = $scope.selectedDepartment === 'cse' ? 'data1.json' : 'data2.json';

            $http.get(fileName).then(function(response) {
                $scope.sem_data = response.data.semesters;

                let local_data = JSON.parse(window.localStorage.getItem('result'));
                if (local_data) {
                    for (let sem in $scope.sem_data) {
                        for (let sub in $scope.sem_data[sem]) {
                            $scope.sem_data[sem][sub].grade = local_data[$scope.sem_data[sem][sub].course_code] || "";
                        }
                    }
                }

                $scope.calc(); // Recalculate based on loaded data
            });
        } else {
            $scope.sem_data = {};
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
                "sem": sem,
                "sgpa": ((sgpa / points) || 0).toFixed(2),
                "cgpa": ((cgpa / total_points) || 0).toFixed(2)
            });
        }
        $scope.result = data;
        window.localStorage.setItem('result', JSON.stringify(final_data));
    };
});
