var app = angular.module('myApp', []);
        var scope
        app.controller('myCtrl', function ($scope) {
            $scope.sem_data = {
                "1": [
                    {
                        "name": "Communicative English 1",
                        "course_code": "21ENT11",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Engineering Mathematics 1",
                        "course_code": "21MAT11",
                        "credit": 4,
                        "grade": ""
                    },
                    {
                        "name": "Engineering Physics",
                        "course_code": "21PHT11",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Engineering Chemistry",
                        "course_code": "21CYT11",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Python Programming",
                        "course_code": "21CST13",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Engineering Graphics",
                        "course_code": "21MEC11",
                        "credit": 4,
                        "grade": ""
                    },
                    {
                        "name": "Physics and Chemistry Laboratory 1",
                        "course_code": "21PHL11",
                        "credit": 1,
                        "grade": ""
                    },
                    {
                        "name": "Python Programming",
                        "course_code": "21CSL11",
                        "credit": 1,
                        "grade": ""
                    }
                ],
                "2": [
                    {
                        "name": "Communicative English 2",
                        "course_code": "21ENT21",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Engineering Mathematics 2",
                        "course_code": "21MAT21",
                        "credit": 4,
                        "grade": ""
                    },
                    {
                        "name": "Physics for Information Sciences",
                        "course_code": "21PHT22",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Basics of Electrical and Electronics Engineering",
                        "course_code": "21EET11",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Programming in C",
                        "course_code": "21ITT21",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Physics and Chemistry Laboratory 2",
                        "course_code": "21PHL21",
                        "credit": 1,
                        "grade": ""
                    },
                    {
                        "name": "C Programming Laboratory",
                        "course_code": "21ITL21",
                        "credit": 1,
                        "grade": ""
                    },
                    {
                        "name": "Engineering Practices Laboratory",
                        "course_code": "21EEL22",
                        "credit": 1,
                        "grade": ""
                    }
                ],
                "3": [
                    {
                        "name": "Discrete Mathematics",
                        "course_code": "21MAT32",
                        "credit": 4,
                        "grade": ""
                    },
                    {
                        "name": "Object Oriented Programming using Java",
                        "course_code": "21CST33",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Data Structures",
                        "course_code": "21CST32",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Digital Principles and System Design",
                        "course_code": "21CSC31",
                        "credit": 4,
                        "grade": ""
                    },
                    {
                        "name": "Computer Architecture",
                        "course_code": "21ITT32",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Object Oriented Programming Laboratory",
                        "course_code": "21CSL31",
                        "credit": 1,
                        "grade": ""
                    },
                    {
                        "name": "Data Structures Laboratory",
                        "course_code": "21CSL32",
                        "credit": 1,
                        "grade": ""
                    }
                ],
                "4": [
                    {
                        "name": "Probability and Statistics",
                        "course_code": "21MAT45",
                        "credit": 4,
                        "grade": ""
                    },
                    {
                        "name": "Database Management Systems",
                        "course_code": "21CST41",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Software Engineering",
                        "course_code": "21CST42",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Operating Systems",
                        "course_code": "21ITT41",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Design and Analysis of Algorithms",
                        "course_code": "21ITT42",
                        "credit": 4,
                        "grade": ""
                    },
                    {
                        "name": "Object Oriented Analysis and Design",
                        "course_code": "21CSC41",
                        "credit": 4,
                        "grade": ""
                    },
                    {
                        "name": "Database Management Systems Laboratory",
                        "course_code": "21CSL41",
                        "credit": 1,
                        "grade": ""
                    },
                    {
                        "name": "Operating Systems Laboratory",
                        "course_code": "21ITL41",
                        "credit": 1,
                        "grade": ""
                    }
                ],
                "5": [
                    {
                        "name": "Computer Networks",
                        "course_code": "21CST51",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Web Programming",
                        "course_code": "21CST52",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Theory of Computations",
                        "course_code": "21CST53",
                        "credit": 4,
                        "grade": ""
                    },
                    {
                        "name": "Exploratory Data Analysis",
                        "course_code": "21PET51",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Cloud Computing",
                        "course_code": "21PET52",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Open Elective 1 (POCE / BMA)",
                        "course_code": "21OET51",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Computer Networks Laboratory",
                        "course_code": "21CSL51",
                        "credit": 1,
                        "grade": ""
                    },
                    {
                        "name": "Web Programming Laboratory",
                        "course_code": "21CSL52",
                        "credit": 1,
                        "grade": ""
                    }
                ],
                "6": [
                    {
                        "name": "Artificial Intelligence",
                        "course_code": "21CST61",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Compiler Design",
                        "course_code": "21CST62",
                        "credit": 4,
                        "grade": ""
                    },
                    {
                        "name": "Mobile Application Development",
                        "course_code": "21ITT61",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Professional Elective 3 (DSRE / ISM)",
                        "course_code": "21PET61",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Professional Elective 4 (DL / BTF)",
                        "course_code": "21PET62",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Open Elective 2 (CE / SME / 5G)",
                        "course_code": "21OET61",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Mobile Application Development Laboratory",
                        "course_code": "21ITL61",
                        "credit": 1,
                        "grade": ""
                    },
                    {
                        "name": "Mini Project",
                        "course_code": "21CSL61",
                        "credit": 3,
                        "grade": ""
                    }
                ],
                "7": [
                    {
                        "name": "Economics and Management for Engineers",
                        "course_code": "21ITT71",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Network Security",
                        "course_code": "21CST71",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Machine Learning",
                        "course_code": "21CST71",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Professional Elective 5",
                        "course_code": "21PET71",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Professional Elective 6",
                        "course_code": "21PET72",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Open Elective 3",
                        "course_code": "21OET71",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Human Values and Professional Ethics",
                        "course_code": "21HST71",
                        "credit": 3,
                        "grade": ""
                    },
                    {
                        "name": "Network Security Laboratory",
                        "course_code": "21CSL71",
                        "credit": 1,
                        "grade": ""
                    },
                    {
                        "name": "Professional Readiness for Innovation, Employability and Entrepreneurship",
                        "course_code": "21PRP71",
                        "credit": 3,
                        "grade": ""
                    }
                ],
                "8": [
                    {
                        "name": "Intership",
                        "course_code": "21CSL72",
                        "credit": 2,
                        "grade": ""
                    },
                    {
                        "name": "Project Work",
                        "course_code": "21CSL81",
                        "credit": 10,
                        "grade": ""
                    }
                ]
            }

            $scope.grades = [
                {
                    'value': '',
                    'name': 'Grade'
                },
                {
                    'value': '10',
                    'name': 'O'
                },
                {
                    'value': '9',
                    'name': 'A+'
                },
                {
                    'value': '8',
                    'name': 'A'
                },
                {
                    'value': '7',
                    'name': 'B+'
                },
                {
                    'value': '6',
                    'name': 'B'
                },
                {
                    'value': '5',
                    'name': 'C'
                },
                {
                    'value': '0',
                    'name': 'RA/U/AB'
                }
            ]

            let local_data = JSON.parse(window.localStorage.getItem('result'))
            if(local_data){
                for (sem in $scope.sem_data) {
                    for (sub in $scope.sem_data[sem]) {
                        $scope.sem_data[sem][sub].grade = local_data[$scope.sem_data[sem][sub].course_code] || ""
                    }
                }
            }

            $scope.calc = () => {
                let data = []
                let final_data = {}

                let cgpa = 0
                let total_points = 0
                for (sem in $scope.sem_data) {
                    let sgpa = 0
                    let points = 0
                    for (sub in $scope.sem_data[sem]) {
                        let credit = $scope.sem_data[sem][sub].credit
                        let grade = parseInt($scope.sem_data[sem][sub].grade) || 0

                        if (grade != 0) {
                            sgpa += credit * grade
                            points += credit
                        }
                        final_data[$scope.sem_data[sem][sub].course_code] = $scope.sem_data[sem][sub].grade
                    }

                    cgpa += sgpa
                    total_points += points

                    data.push({
                        "sem": sem,
                        "sgpa": ((sgpa / points) || 0).toFixed(2),
                        "cgpa": ((cgpa / total_points) || 0).toFixed(2)
                    })
                }
                $scope.result = data
                window.localStorage.setItem('result', JSON.stringify(final_data))
            }

            $scope.calc()
        });