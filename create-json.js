// Department JSON Creator App - Legacy Format Only
var app = angular.module('depCreatorApp', []);

app.controller('departmentCreatorCtrl', function($scope, $timeout) {
    // Initialize variables
    $scope.departments = [];
    $scope.selectedDepartment = null;
    $scope.importModal = null;
    $scope.contactModal = null;
    $scope.showSaveIndicator = false;
    $scope.previewModal = null;
    $scope.jsonPreview = '';
    
    // Initialize application
    function init() {
        // Load saved departments from local storage
        loadDepartmentsFromStorage();
        
        // Initialize Bootstrap modals
        $timeout(function() {
            $scope.importModal = new bootstrap.Modal(document.getElementById('importModal'));
            $scope.contactModal = new bootstrap.Modal(document.getElementById('contactModal'));
            $scope.previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
        }, 500);
        
        // Set up autosave
        setInterval(function() {
            saveDepartmentsToStorage();
        }, 60000); // Save every minute
    }
    
    // Load departments from local storage
    function loadDepartmentsFromStorage() {
        const savedDepartments = localStorage.getItem('departments');
        if (savedDepartments) {
            try {
                $scope.departments = JSON.parse(savedDepartments);
                console.log('Loaded departments from storage:', $scope.departments.length);
            } catch (e) {
                console.error('Error loading departments from local storage', e);
                $scope.departments = [];
            }
        }
    }
    
    // Save departments to local storage
    function saveDepartmentsToStorage() {
        if ($scope.departments && $scope.departments.length > 0) {
            localStorage.setItem('departments', JSON.stringify($scope.departments));
            console.log('Saved departments to storage:', $scope.departments.length);
        }
    }
    
    // Create new department
    $scope.createNewDepartment = function() {
        const newDepartment = {
            id: generateId(),
            name: 'New Department',
            code: '',
            description: '',
            programs: [],
            lastModified: new Date()
        };
        
        $scope.departments.push(newDepartment);
        $scope.selectDepartment(newDepartment);
    };
    
    // Select department for editing
    $scope.selectDepartment = function(department) {
        $scope.selectedDepartment = JSON.parse(JSON.stringify(department));
    };
    
    // Delete department
    $scope.deleteDepartment = function() {
        if (!$scope.selectedDepartment) return;
        
        if (confirm('Are you sure you want to delete this department?')) {
            $scope.departments = $scope.departments.filter(d => d.id !== $scope.selectedDepartment.id);
            saveDepartmentsToStorage();
            $scope.selectedDepartment = null;
        }
    };
    
    // Save department changes
    $scope.saveDepartment = function() {
        if (!$scope.selectedDepartment) return;
        
        // Update last modified timestamp
        $scope.selectedDepartment.lastModified = new Date();
        
        // Find and update the department in the array
        const index = $scope.departments.findIndex(d => d.id === $scope.selectedDepartment.id);
        if (index !== -1) {
            $scope.departments[index] = JSON.parse(JSON.stringify($scope.selectedDepartment));
        }
        
        // Save changes to storage
        saveDepartmentsToStorage();
        
        // Show save indicator
        $scope.showSaveIndicator = true;
        $timeout(function() {
            $scope.showSaveIndicator = false;
        }, 2000);
    };
    
    // Add a program to the selected department
    $scope.addProgram = function() {
        if (!$scope.selectedDepartment) return;
        
        $scope.selectedDepartment.programs.push({
            name: 'New Program',
            degree: '',
            duration: 4,
            totalSemesters: 8,
            semesters: []
        });
    };
    
    // Remove a program from the selected department
    $scope.removeProgram = function(index) {
        if (!$scope.selectedDepartment) return;
        
        if (confirm('Are you sure you want to remove this program?')) {
            $scope.selectedDepartment.programs.splice(index, 1);
        }
    };
    
    // Generate semesters for a program based on totalSemesters
    $scope.generateSemesters = function(program) {
        if (!program.totalSemesters || program.totalSemesters <= 0) {
            alert('Please enter a valid number of semesters.');
            return;
        }
        
        if (program.semesters && program.semesters.length > 0) {
            if (!confirm('This will replace existing semesters. Continue?')) {
                return;
            }
        }
        
        const semesters = [];
        for (let i = 0; i < program.totalSemesters; i++) {
            semesters.push({
                name: `Semester ${i + 1}`,
                subjects: []
            });
        }
        
        program.semesters = semesters;
    };
    
    // Add a subject to a semester
    $scope.addSubject = function(semester) {
        if (!semester.subjects) {
            semester.subjects = [];
        }
        
        semester.subjects.push({
            code: '',
            name: '',
            credits: 3,
            gradeType: '10point'
        });
    };
    
    // Remove a subject from a semester
    $scope.removeSubject = function(semester, index) {
        semester.subjects.splice(index, 1);
    };
    
    // Get total semesters for a department
    $scope.getTotalSemesters = function(department) {
        let count = 0;
        if (department.programs) {
            department.programs.forEach(program => {
                if (program.semesters) {
                    count += program.semesters.length;
                }
            });
        }
        return count;
    };
    
    // Convert department to legacy format
    $scope.convertToLegacyFormat = function(department) {
        if (!department || !department.programs || department.programs.length === 0) {
            alert('Invalid department structure');
            return null;
        }
        
        // We'll use the first program for the legacy format
        const program = department.programs[0];
        
        const legacyData = {
            semesters: {}
        };
        
        // Convert each semester to legacy format
        program.semesters.forEach((semester, index) => {
            const semNum = (index + 1).toString();
            
            legacyData.semesters[semNum] = semester.subjects.map(subject => ({
                name: subject.name || '',
                course_code: subject.code || '',
                credit: parseFloat(subject.credits) || 0,
                grade: ''
            }));
        });
        
        return legacyData;
    };
    
    // Export department to legacy JSON format
    $scope.exportDepartment = function() {
        if (!$scope.selectedDepartment) {
            alert('Please select a department to export');
            return;
        }
        
        const legacyData = $scope.convertToLegacyFormat($scope.selectedDepartment);
        if (!legacyData) return;
        
        // Prepare the data
        const dataStr = JSON.stringify(legacyData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        // Create a download link and trigger it
        const exportFileName = `${$scope.selectedDepartment.code || 'department'}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
    };
    
    // Open import modal
    $scope.openImportModal = function() {
        $scope.importModal.show();
    };
    
    // Import JSON file (legacy format only)
    $scope.importJSON = function() {
        const fileInput = document.getElementById('importFile');
        
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Please select a file to import.');
            return;
        }
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                
                if (!data.semesters) {
                    throw new Error('Invalid format: Missing semesters object');
                }
                
                // Create a new department from the legacy format
                const department = {
                    id: generateId(),
                    name: 'Imported Department', // Default name, can be changed later
                    code: '',
                    description: 'Imported from JSON',
                    programs: [
                        {
                            name: 'Program',
                            degree: '',
                            duration: 4,
                            totalSemesters: Object.keys(data.semesters).length,
                            semesters: []
                        }
                    ],
                    lastModified: new Date()
                };
                
                // Convert each semester
                Object.keys(data.semesters).forEach(semNum => {
                    const semSubjects = data.semesters[semNum];
                    
                    const semester = {
                        name: `Semester ${semNum}`,
                        subjects: semSubjects.map(subject => ({
                            code: subject.course_code || '',
                            name: subject.name || '',
                            credits: subject.credit || 0,
                            gradeType: '10point' // Default to 10-point scale
                        }))
                    };
                    
                    department.programs[0].semesters.push(semester);
                });
                
                // Add the imported department
                $scope.departments.push(department);
                $scope.selectDepartment(department);
                
                saveDepartmentsToStorage();
                $scope.importModal.hide();
                $scope.$apply();
                
                // Reset file input
                fileInput.value = '';
                
                alert('Department imported successfully!');
                
            } catch (error) {
                alert('Error importing JSON: ' + error.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    // Open contact owner modal
    $scope.contactOwner = function() {
        $scope.contactModal.show();
    };
    
    // Send email to owner
    $scope.sendEmail = function() {
        // First export the current department data as legacy format
        if (!$scope.selectedDepartment) {
            alert('Please select a department to submit');
            return;
        }
        
        const legacyData = $scope.convertToLegacyFormat($scope.selectedDepartment);
        if (!legacyData) return;
        
        // Create mail subject and body
        const subject = "Department JSON Structure Submission";
        const body = "Hello,\n\nI have created a department JSON structure that I would like to have included in the GPA Calculator app. The department details are:\n\n" +
            "Name: " + $scope.selectedDepartment.name + "\n" +
            "Code: " + $scope.selectedDepartment.code + "\n\n" +
            "Please find the JSON data attached.\n\nThank you!";
        
        // Close the modal
        $scope.contactModal.hide();
        
        // Open mailto link (this will open the default email client)
        window.location.href = `mailto:elanngo@disroot.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        // Show popup asking to attach the exported JSON
        $timeout(function() {
            alert("Please attach the exported JSON file to your email. You can export it using the 'Export JSON' button in the top menu.");
        }, 500);
    };
    
    // Preview department structure in legacy format
    $scope.previewJSON = function() {
        if (!$scope.selectedDepartment) {
            alert('No department selected');
            return;
        }
        
        // Legacy format preview
        const legacyData = $scope.convertToLegacyFormat($scope.selectedDepartment);
        $scope.jsonPreview = JSON.stringify(legacyData, null, 2);
        
        // Initialize and show the modal
        if (!$scope.previewModal) {
            $scope.previewModal = new bootstrap.Modal(document.getElementById('previewModal'));
        }
        $scope.previewModal.show();
    };
    
    // Copy to clipboard
    $scope.copyToClipboard = function() {
        navigator.clipboard.writeText($scope.jsonPreview).then(function() {
            alert('Copied to clipboard!');
        }, function(err) {
            console.error('Could not copy text: ', err);
            
            // Fallback method
            const textarea = document.createElement('textarea');
            textarea.value = $scope.jsonPreview;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            alert('Copied to clipboard!');
        });
    };
    
    // Generate unique ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    // Initialize the application
    init();
});