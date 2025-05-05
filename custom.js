// Angular module for our GPA Calculator
var app = angular.module('myApp', []);

app.controller('customGpaCtrl', function($scope) {
    // Initialize variables
    $scope.step = 1; // Starting with step 1
    $scope.numSubjects = 0;
    $scope.subjects = [];
    $scope.uploadedFile = null;
    $scope.results = [];
    
    // Batch management
    $scope.batches = [];
    $scope.selectedBatch = null;
    $scope.importModal = null;
    
    // Add these variables at the beginning of the controller function
    $scope.userRole = null; // 'teacher' or 'student'
    $scope.showRoleSelector = false;

    // Initialize application
    function init() {
        // Check if user role is stored in local storage
        const savedRole = localStorage.getItem('gpaCalculatorRole');
        if (savedRole) {
            $scope.userRole = savedRole;
        } else {
            // Show role selector on first visit
            $scope.showRoleSelector = true;
        }
        
        // Load saved batches from local storage
        loadBatchesFromStorage();
        
        // Bootstrap modal initialization
        setTimeout(function() {
            $scope.importModal = new bootstrap.Modal(document.getElementById('importModal'));
        }, 500);
    }
    
    // Load batches from local storage
    function loadBatchesFromStorage() {
        const savedBatches = localStorage.getItem('gpaBatches');
        if (savedBatches) {
            try {
                $scope.batches = JSON.parse(savedBatches);
                // Ensure we have all required properties (backward compatibility)
                $scope.batches.forEach(batch => {
                    if (!batch.id) batch.id = generateId();
                    if (!batch.lastModified) batch.lastModified = new Date();
                    
                    // Also ensure semesters have the right structure
                    batch.semesters.forEach(semester => {
                        // Make sure subjects array exists
                        if (!semester.subjects) {
                            semester.subjects = [];
                        }
                        
                        // Update subjects based on numSubjects
                        if (semester.numSubjects) {
                            adjustSemesterSubjects(semester);
                        }
                    });
                });
            } catch (e) {
                console.error('Error loading batches from local storage', e);
                $scope.batches = [];
            }
        }
    }
    
    // Save batches to local storage
    function saveBatchesToStorage() {
        localStorage.setItem('gpaBatches', JSON.stringify($scope.batches));
    }
    
    // Generate unique ID for batches
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Add a new batch
    $scope.addNewBatch = function() {
        $scope.selectedBatch = {
            id: generateId(),
            name: 'New Batch',
            semesters: [],
            lastModified: new Date()
        };
        // Add a default semester
        $scope.addNewSemester();
    };
    
    // Select a batch to edit
    $scope.selectBatch = function(batch) {
        // Clone the batch to avoid direct modification before save
        $scope.selectedBatch = JSON.parse(JSON.stringify(batch));
    };
    
    // Delete a batch
    $scope.deleteBatch = function(batch) {
        if (confirm('Are you sure you want to delete this batch?')) {
            $scope.batches = $scope.batches.filter(b => b.id !== batch.id);
            saveBatchesToStorage();
            
            if ($scope.selectedBatch && $scope.selectedBatch.id === batch.id) {
                $scope.selectedBatch = null;
            }
        }
    };
    
    // Save the current batch
    $scope.saveBatch = function() {
        if (!$scope.selectedBatch.name) {
            alert('Please provide a batch name');
            return;
        }
        
        // Update last modified time
        $scope.selectedBatch.lastModified = new Date();
        
        // Check if this is an edit or a new batch
        const existingIndex = $scope.batches.findIndex(b => b.id === $scope.selectedBatch.id);
        if (existingIndex >= 0) {
            // Update existing batch
            $scope.batches[existingIndex] = $scope.selectedBatch;
        } else {
            // Add as new batch
            $scope.batches.push($scope.selectedBatch);
        }
        
        // Save to storage
        saveBatchesToStorage();
        
        // Clear selection
        $scope.selectedBatch = null;
    };
    
    // Cancel batch editing
    $scope.cancelBatchEdit = function() {
        $scope.selectedBatch = null;
    };
    
    // Add a new semester to the selected batch
    $scope.addNewSemester = function() {
        if (!$scope.selectedBatch) return;
        
        const semesterNumber = $scope.selectedBatch.semesters.length + 1;
        
        $scope.selectedBatch.semesters.push({
            name: 'Semester ' + semesterNumber,
            numSubjects: 0,
            subjects: [],
            isOpen: true // To auto-expand the new semester
        });
    };
    
    // Delete a semester from the selected batch
    $scope.deleteSemester = function(index) {
        if (confirm('Are you sure you want to delete this semester?')) {
            $scope.selectedBatch.semesters.splice(index, 1);
        }
    };
    
    // Adjust the subjects array when numSubjects changes
    function adjustSemesterSubjects(semester) {
        // Make sure numSubjects is at least 0
        if (isNaN(semester.numSubjects) || semester.numSubjects < 0) {
            semester.numSubjects = 0;
        }
    
        // Initialize subjects array if needed
        if (!semester.subjects) {
            semester.subjects = [];
        }
    
        // Adjust array size
        if (semester.subjects.length > semester.numSubjects) {
            // Remove extra subjects
            semester.subjects.splice(semester.numSubjects);
        } else if (semester.subjects.length < semester.numSubjects) {
            // Add new subjects
            for (let i = semester.subjects.length; i < semester.numSubjects; i++) {
                semester.subjects.push({
                    code: '',              // Initialize with empty code
                    name: '',
                    credits: 3,
                    gradeType: '10point'  // Default to 10-point scale
                });
            }
        }
    }
    
    // Watch for changes in semester numSubjects
    $scope.$watch('selectedBatch.semesters', function(newVal, oldVal) {
        if (newVal && newVal.forEach) {
            newVal.forEach(semester => {
                adjustSemesterSubjects(semester);
            });
        }
    }, true);
    
    // Export batches to file
    $scope.exportBatches = function() {
        if ($scope.batches.length === 0) {
            alert('No batches to export.');
            return;
        }
        
        // Prepare the data
        const dataStr = JSON.stringify($scope.batches, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        // Create a download link and trigger it
        const exportFileDefaultName = 'gpa_batches.json';
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };
    
    // Open import modal
    $scope.openImportModal = function() {
        $scope.importModal.show();
    };
    
    // Import batches from file
    $scope.importBatches = function() {
        const fileInput = document.getElementById('importFile');
        
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Please select a file to import.');
            return;
        }
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const importedBatches = JSON.parse(e.target.result);
                
                if (!Array.isArray(importedBatches)) {
                    throw new Error('Invalid file format. Expected an array of batches.');
                }
                
                // Validate the imported data structure
                for (const batch of importedBatches) {
                    if (!batch.name || !Array.isArray(batch.semesters)) {
                        throw new Error('Invalid batch format. Each batch must have a name and semesters array.');
                    }
                    
                    // Ensure each batch has a unique ID
                    if (!batch.id) batch.id = generateId();
                }
                
                // Replace current batches
                $scope.batches = importedBatches;
                saveBatchesToStorage();
                $scope.importModal.hide();
                $scope.$apply();
                
                alert('Batches imported successfully!');
            } catch (error) {
                alert('Error importing batches: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };

    // Function to generate array for ng-repeat
    $scope.getNumberArray = function(num) {
        return new Array(parseInt(num || 0));
    };

    // Watch for changes in number of subjects (original behavior)
    $scope.$watch('numSubjects', function(newVal, oldVal) {
        // Skip if no change or invalid values
        if (newVal === oldVal || isNaN(newVal) || newVal < 0) return;

        // Adjust array size
        if ($scope.subjects.length > newVal) {
            // Remove extra subjects
            $scope.subjects.splice(newVal);
        } else if ($scope.subjects.length < newVal) {
            // Add new subjects
            for (let i = $scope.subjects.length; i < newVal; i++) {
                $scope.subjects.push({
                    name: '',
                    credits: 3,
                    gradeType: '10point'  // Default to 10-point scale
                });
            }
        }
    });

    // Navigation between steps (from original)
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

    // Use a batch for GPA/CGPA calculation
    $scope.useBatchForCalculation = function(batch) {
        // Create a deep copy to avoid modifying the original batch
        $scope.calculationBatch = JSON.parse(JSON.stringify(batch));
        
        // Initialize calculation properties for each semester
        $scope.calculationBatch.semesters.forEach(semester => {
            semester.includeInCalculation = false;
            semester.hasSubjects = semester.subjects && semester.subjects.length > 0;
            
            // Make sure every subject has a grade property (might be empty)
            if (semester.subjects) {
                semester.subjects.forEach(subject => {
                    if (!subject.grade) {
                        subject.grade = "";
                    }
                });
            }
        });
        
        // Reset calculation state
        $scope.cgpa = null;
        $scope.semesterGPAs = [];
        $scope.templateGenerated = false;
        $scope.batchUploadedFile = null;
        $scope.batchResults = [];
        $scope.allSemestersSelected = false;
    };

    // Cancel batch calculation and return to main view
    $scope.cancelBatchCalculation = function() {
        $scope.calculationBatch = null;
        $scope.cgpa = null;
        $scope.semesterGPAs = [];
    };

    // Calculate GPA for a specific semester
    $scope.updateSemesterGPA = function(semester) {
        let totalPoints = 0;
        let totalCredits = 0;
        let hasGrades = false;
        
        if (semester.subjects) {
            semester.subjects.forEach(subject => {
                if (subject.grade && subject.grade !== "") {
                    const credits = parseFloat(subject.credits) || 0;
                    let points = 0;
                    
                    // Calculate points based on grade type
                    if (subject.gradeType === 'standard') {
                        points = convertStandardGrade(subject.grade);
                    } else if (subject.gradeType === '10point') {
                        points = convert10PointGrade(subject.grade);
                    } else if (subject.gradeType === 'custom') {
                        points = convertCustomGrade(subject.grade);
                    }
                    
                    totalPoints += points * credits;
                    totalCredits += credits;
                    hasGrades = true;
                }
            });
        }
        
        semester.hasGrades = hasGrades;
        if (hasGrades && totalCredits > 0) {
            semester.gpa = ((totalPoints / totalCredits) * 10 / 4).toFixed(2);
            semester.includeInCalculation = true;
        } else {
            semester.gpa = null;
            semester.includeInCalculation = false;
        }
    };

    // Calculate CGPA across selected semesters
    $scope.calculateCGPA = function() {
        // This function is now only for the manual grade entry mode, which we've removed
        // For batch processing, CGPA is calculated directly in the processBatchUpload function
        
        // Keep the function as a fallback, but we won't be using it in the batch workflow
        if (!$scope.batchResults || $scope.batchResults.length === 0) {
            alert('Please upload and process the template file first');
            return;
        }
        
        // With batch results already calculated, just download them
        $scope.downloadBatchResults();
    };

    // Export CGPA results
    $scope.exportCGPAResults = function() {
        // Redirect to downloadBatchResults since we're focusing on the batch workflow
        $scope.downloadBatchResults();
    };

    // Export CGPA results
    $scope.exportCGPAResults = function() {
        if (!$scope.cgpa) {
            alert('Please calculate CGPA first.');
            return;
        }
        
        // Create a new workbook
        const wb = XLSX.utils.book_new();
        
        // Create data for summary sheet
        const summaryData = [
            ['Batch', $scope.calculationBatch.name],
            ['CGPA', $scope.cgpa],
            [],
            ['Semester', 'GPA']
        ];
        
        $scope.semesterGPAs.forEach(sgpa => {
            summaryData.push([sgpa.name, sgpa.gpa]);
        });
        
        // Add summary sheet
        const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWS, 'CGPA Summary');
        
        // Add detailed sheets for each semester with grades
        $scope.calculationBatch.semesters.forEach((semester, index) => {
            if (semester.includeInCalculation && semester.hasGrades) {
                const semesterData = [
                    ['Roll No', 'Student Name', 'Subject', 'Credits', 'Grade']
                ];
                
                // Add a placeholder row since we don't have individual student data in manual mode
                const studentRow = ['N/A', 'Manual Entry'];
                
                semester.subjects.forEach(subject => {
                    if (subject.grade) {
                        semesterData.push([
                            'N/A', 'Manual Entry', subject.name, subject.credits, subject.grade
                        ]);
                    }
                });
                
                semesterData.push([]);
                semesterData.push(['', '', 'Semester GPA', '', semester.gpa]);
                
                const semesterWS = XLSX.utils.aoa_to_sheet(semesterData);
                XLSX.utils.book_append_sheet(wb, semesterWS, `${semester.name}`);
            }
        });
        
        // Save the file
        XLSX.writeFile(wb, `${$scope.calculationBatch.name}_CGPA.xlsx`);
    };

    // Use the current semester subjects for the standard calculator
    $scope.useSemesterInMainCalculator = function(semester) {
        if (!semester || !semester.subjects || semester.subjects.length === 0) {
            alert('This semester has no subjects.');
            return;
        }
        
        // Copy the subjects to the main calculator
        $scope.numSubjects = semester.subjects.length;
        $scope.subjects = JSON.parse(JSON.stringify(semester.subjects));
        
        // Close the batch calculation view
        $scope.calculationBatch = null;
        
        // Go to step 2 of the main calculator
        $scope.goToStep(2);
    };

    // Add these functions to your controller:

    // Track if all semesters are selected
    $scope.allSemestersSelected = false;
    $scope.templateGenerated = false;
    $scope.batchUploadedFile = null;
    $scope.batchResults = [];

    // Toggle selection of all semesters
    $scope.toggleAllSemesters = function() {
        $scope.allSemestersSelected = !$scope.allSemestersSelected;
        
        $scope.calculationBatch.semesters.forEach(semester => {
            if (semester.hasSubjects) {
                semester.includeInCalculation = $scope.allSemestersSelected;
            }
        });
    };

    // Get selected semesters
    $scope.getSelectedSemesters = function() {
        if (!$scope.calculationBatch) return [];
        return $scope.calculationBatch.semesters.filter(sem => sem.includeInCalculation && sem.hasSubjects);
    };

    // Update the generateBatchTemplate function to include subject codes

    $scope.generateBatchTemplate = function() {
        const selectedSemesters = $scope.getSelectedSemesters();
        
        if (selectedSemesters.length === 0) {
            alert('Please select at least one semester.');
            return;
        }
        
        // Create new workbook
        const wb = XLSX.utils.book_new();
        
        // Check if there are subjects in the selected semesters
        let hasSubjects = false;
        
        // For each selected semester, create a worksheet
        selectedSemesters.forEach((semester, semIndex) => {
            // Create headers for the template
            const headers = ['Roll No', 'Student Name'];
            
            // Skip semesters with no subjects
            if (!semester.subjects || semester.subjects.length === 0) {
                return;
            }
            
            hasSubjects = true;
            
            // Add subject names to headers with codes if available
            semester.subjects.forEach(subject => {
                const subjectCode = subject.code || '';
                const subjectName = subject.name || 'Unnamed Subject';
                headers.push(subjectCode ? `${subjectCode} - ${subjectName}` : subjectName);
            });
            
            // Create worksheet with headers and example row
            const wsData = [
                headers, 
                ['R001', 'Example Student', ...Array(semester.subjects.length).fill('')]
            ];
            
            const ws = XLSX.utils.aoa_to_sheet(wsData);
            XLSX.utils.book_append_sheet(wb, ws, semester.name || `Semester ${semIndex + 1}`);
        });
        
        if (!hasSubjects) {
            alert('Selected semesters have no subjects configured.');
            return;
        }
        
        // Create a summary sheet for quick reference
        const summaryData = [
            ['Batch', $scope.calculationBatch.name],
            ['Generated', new Date().toLocaleString()],
            [''],
            ['Selected Semesters']
        ];
        
        selectedSemesters.forEach(semester => {
            summaryData.push([semester.name]);
        });
        
        const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(wb, summaryWS, 'Info');
        
        // Save the file
        XLSX.writeFile(wb, `${$scope.calculationBatch.name}_template.xlsx`);
        
        // Mark template as generated
        $scope.templateGenerated = true;
    };

    // Handle file upload for batch calculation
    $scope.handleBatchFileUpload = function(fileInput) {
        if (fileInput.files && fileInput.files[0]) {
            $scope.batchUploadedFile = fileInput.files[0];
            $scope.$apply();
        }
    };

    // Process the uploaded batch file
    $scope.processBatchUpload = function() {
        if (!$scope.batchUploadedFile) {
            alert('Please upload a file first.');
            return;
        }
        
        const selectedSemesters = $scope.getSelectedSemesters();
        if (selectedSemesters.length === 0) {
            alert('Please select at least one semester.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const wb = XLSX.read(data, { type: 'array' });
            
            // Check if the workbook has all required sheets
            const selectedSemNames = selectedSemesters.map(s => s.name || 'Unnamed');
            const availableSheets = wb.SheetNames;
            
            const missingSemesters = [];
            selectedSemNames.forEach(semName => {
                if (!availableSheets.includes(semName)) {
                    missingSemesters.push(semName);
                }
            });
            
            if (missingSemesters.length > 0) {
                alert(`Missing worksheets for semesters: ${missingSemesters.join(', ')}. Please use the generated template.`);
                return;
            }
            
            // Reset results
            $scope.batchResults = [];
            
            // Create a mapping of semester name to index in the selected semesters array
            const semesterIndexMap = {};
            selectedSemesters.forEach((sem, index) => {
                semesterIndexMap[sem.name] = index;
            });
            
            // Process each semester's sheet and build student data
            const studentData = {};
            
            selectedSemesters.forEach((semester, semIndex) => {
                // Get sheet for this semester
                const wsname = semester.name || `Semester ${semIndex + 1}`;
                const ws = wb.Sheets[wsname];
                
                // Convert sheet to JSON
                const jsonData = XLSX.utils.sheet_to_json(ws, { header: 1 });
                
                if (jsonData.length < 2) {
                    alert(`Sheet for ${wsname} does not contain enough data.`);
                    return;
                }
                
                // Process each row (student) starting from row 1 (skipping headers)
                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (row.length < semester.subjects.length + 2) continue; // Skip incomplete rows
                    
                    const rollNo = row[0];
                    const studentName = row[1];
                    const grades = row.slice(2, semester.subjects.length + 2);
                    
                    // Use roll number as unique identifier
                    if (!rollNo) continue; // Skip rows without roll numbers
                    
                    // Initialize student data if not exists
                    if (!studentData[rollNo]) {
                        studentData[rollNo] = {
                            rollNo: rollNo,
                            studentName: studentName,
                            semesterGrades: {},
                            semesterGPAs: {},
                            cgpa: null
                        };
                        
                        // Initialize arrays for each semester
                        selectedSemesters.forEach((s, idx) => {
                            studentData[rollNo].semesterGrades[idx] = [];
                            studentData[rollNo].semesterGPAs[idx] = null;
                        });
                    }
                    
                    // Calculate GPA for this student in this semester
                    const gpaResult = calculateSemesterGPA(semester.subjects, grades);
                    
                    // Store grades and GPA
                    studentData[rollNo].semesterGrades[semIndex] = grades;
                    studentData[rollNo].semesterGPAs[semIndex] = gpaResult.gpa.toFixed(2);
                }
            });
            
            // Calculate CGPA for each student and convert to array format
            for (const rollNo in studentData) {
                const student = studentData[rollNo];
                
                // Calculate CGPA
                let totalWeightedPoints = 0;
                let totalCredits = 0;
                
                selectedSemesters.forEach((semester, semIndex) => {
                    const grades = student.semesterGrades[semIndex];
                    if (!grades || grades.length === 0) return;
                    
                    // Calculate points for this semester
                    let semesterPoints = 0;
                    let semesterCredits = 0;
                    
                    semester.subjects.forEach((subject, subIndex) => {
                        if (subIndex >= grades.length) return;
                        
                        const grade = grades[subIndex];
                        if (!grade) return;
                        
                        const credits = parseFloat(subject.credits) || 0;
                        let points = 0;
                        
                        // Calculate points based on grade type
                        if (subject.gradeType === 'standard') {
                            points = convertStandardGrade(grade);
                        } else if (subject.gradeType === '10point') {
                            points = convert10PointGrade(grade);
                        } else if (subject.gradeType === 'custom') {
                            points = convertCustomGrade(grade);
                        }
                        
                        semesterPoints += points * credits;
                        semesterCredits += credits;
                    });
                    
                    // Add to total
                    totalWeightedPoints += semesterPoints;
                    totalCredits += semesterCredits;
                });
                
                // Calculate CGPA
                if (totalCredits > 0) {
                    student.cgpa = ((totalWeightedPoints / totalCredits) * 10 / 4).toFixed(2);
                }
                
                // Convert the object format to arrays for easier display in Angular
                const finalStudent = {
                    rollNo: student.rollNo,
                    studentName: student.studentName,
                    semesterGrades: [],
                    semesterGPAs: [],
                    cgpa: student.cgpa
                };
                
                // Fill the arrays in the correct order
                for (let i = 0; i < selectedSemesters.length; i++) {
                    finalStudent.semesterGrades[i] = student.semesterGrades[i] || [];
                    finalStudent.semesterGPAs[i] = student.semesterGPAs[i] || null;
                }
                
                // Add to results array
                $scope.batchResults.push(finalStudent);
            }
            
            if ($scope.batchResults.length === 0) {
                alert('No student data found in the uploaded file.');
            } else {
                // Sort results by roll number
                $scope.batchResults.sort((a, b) => a.rollNo.localeCompare(b.rollNo));
            }
            
            $scope.$apply();
        };
        
        reader.readAsArrayBuffer($scope.batchUploadedFile);
    };

    // Calculate GPA for a specific semester based on subjects and grades
    function calculateSemesterGPA(subjects, grades) {
        let totalPoints = 0;
        let totalCredits = 0;
        
        for (let i = 0; i < Math.min(subjects.length, grades.length); i++) {
            const subject = subjects[i];
            const grade = grades[i];
            
            if (!grade) continue;
            
            const credits = parseFloat(subject.credits) || 0;
            let points = 0;
            
            // Calculate points based on grade type
            if (subject.gradeType === 'standard') {
                points = convertStandardGrade(grade);
            } else if (subject.gradeType === '10point') {
                points = convert10PointGrade(grade);
            } else if (subject.gradeType === 'custom') {
                points = convertCustomGrade(grade);
            }
            
            totalPoints += points * credits;
            totalCredits += credits;
        }
        
        return {
            gpa: totalCredits > 0 ? (totalPoints / totalCredits) * 10 / 4 : 0,
            totalCredits: totalCredits
        };
    }

    // Download batch results as Excel
    $scope.downloadBatchResults = function() {
        if ($scope.batchResults.length === 0) {
            alert('No results to download.');
            return;
        }
        
        const selectedSemesters = $scope.getSelectedSemesters();
        
        // Create new workbook
        const wb = XLSX.utils.book_new();
        
        // Create CGPA summary sheet
        const cgpaHeaders = ['Roll No', 'Student Name'];
        selectedSemesters.forEach(sem => {
            cgpaHeaders.push(`${sem.name} GPA`);
        });
        cgpaHeaders.push('CGPA');
        
        const cgpaRows = [cgpaHeaders];
        
        $scope.batchResults.forEach(result => {
            const row = [result.rollNo, result.studentName];
            for (let i = 0; i < selectedSemesters.length; i++) {
                row.push(result.semesterGPAs[i] || 'N/A');
            }
            row.push(result.cgpa);
            cgpaRows.push(row);
        });
        
        const cgpaWS = XLSX.utils.aoa_to_sheet(cgpaRows);
        XLSX.utils.book_append_sheet(wb, cgpaWS, 'CGPA Summary');
        
        // Create individual semester sheets with detailed grades
        selectedSemesters.forEach((semester, semIndex) => {
            const semHeaders = ['Roll No', 'Student Name'];
            semester.subjects.forEach(subject => {
                const subjectCode = subject.code || '';
                const subjectName = subject.name || 'Unnamed Subject';
                semHeaders.push(subjectCode ? `${subjectCode} - ${subjectName}` : subjectName);
            });
            semHeaders.push('GPA');
            
            const semRows = [semHeaders];
            
            $scope.batchResults.forEach(result => {
                const grades = result.semesterGrades[semIndex];
                if (!grades || grades.length === 0) {
                    // Add a row with N/A for all subjects
                    const row = [result.rollNo, result.studentName];
                    for (let i = 0; i < semester.subjects.length; i++) {
                        row.push('N/A');
                    }
                    row.push('N/A');
                    semRows.push(row);
                } else {
                    const row = [result.rollNo, result.studentName];
                    for (let i = 0; i < semester.subjects.length; i++) {
                        row.push(grades[i] || 'N/A');
                    }
                    row.push(result.semesterGPAs[semIndex]);
                    semRows.push(row);
                }
            });
            
            const semWS = XLSX.utils.aoa_to_sheet(semRows);
            XLSX.utils.book_append_sheet(wb, semWS, semester.name || `Semester ${semIndex + 1}`);
        });
        
        // Save the file
        XLSX.writeFile(wb, `${$scope.calculationBatch.name}_results.xlsx`);
    };

    // Update the useBatchForCalculation function to check for subject availability
    $scope.useBatchForCalculation = function(batch) {
        // Create a deep copy to avoid modifying the original batch
        $scope.calculationBatch = JSON.parse(JSON.stringify(batch));
        
        // Initialize calculation properties for each semester
        $scope.calculationBatch.semesters.forEach(semester => {
            semester.includeInCalculation = false;
            semester.hasSubjects = semester.subjects && semester.subjects.length > 0;
            
            // Make sure every subject has a grade property (might be empty)
            if (semester.subjects) {
                semester.subjects.forEach(subject => {
                    if (!subject.grade) {
                        subject.grade = "";
                    }
                });
            }
        });
        
        // Reset calculation state
        $scope.cgpa = null;
        $scope.semesterGPAs = [];
        $scope.templateGenerated = false;
        $scope.batchUploadedFile = null;
        $scope.batchResults = [];
        $scope.allSemestersSelected = false;
    };

    // Add this function to help with debugging

    function logDataStructure(data, label) {
        console.log('--- ' + label + ' ---');
        try {
            console.log(JSON.stringify(data, null, 2));
        } catch (e) {
            console.log('Error stringifying data:', e);
            console.log(data);
        }
    }

    // Select user role function
    $scope.rememberRoleChoice = false;

    // Select user role function
    $scope.selectRole = function(role, remember) {
        // If no role was passed, use the selected card
        role = role || $scope.selectedRoleCard;
        
        if (!role) return;
        
        $scope.userRole = role;
        $scope.showRoleSelector = false;
        
        // Reset UI state when switching modes
        if (role === 'teacher') {
            // Reset student mode states
            $scope.step = 1;
            $scope.numSubjects = 0;
            $scope.subjects = [];
            $scope.uploadedFile = null;
            $scope.results = [];
        } else {
            // Reset teacher mode states
            $scope.calculationBatch = null;
            $scope.selectedBatch = null;
        }
        
        if (remember || $scope.rememberRoleChoice) {
            // Save role preference to local storage
            localStorage.setItem('gpaCalculatorRole', role);
        }
    };

    // Switch user role function
    $scope.switchRole = function() {
        // Clear the saved role if it exists
        localStorage.removeItem('gpaCalculatorRole');
        $scope.showRoleSelector = true;
        $scope.rememberRoleChoice = false;
    };

    // Add these functions to make the role selection cards more interactive

    $scope.selectedRoleCard = null;

    $scope.selectRoleCard = function(role) {
        $scope.selectedRoleCard = role;
    };

    // Initialize the application
    init();
});