$sourcePath = "c:\Users\AYUSHMAN NANDA\OneDrive\Desktop\GDC\src"
$fileList = @(
    "components\admin\BulkAssignmentDialog.js",
    "components\admin\CourseAllocationDashboard.js", 
    "components\auth\UnifiedEmailLogin.js",
    "components\faculty\AttendanceManagement.js",
    "components\faculty\CourseAttendance.js",
    "components\faculty\FacultyFeedback.js",
    "components\faculty\GradeAssignments.js",
    "components\faculty\QuizCreation.js",
    "components\faculty\StudentList.js",
    "components\parent\ChildAssignments.js",
    "components\parent\ChildAttendance.js",
    "components\parent\StudentQuizzes.js",
    "components\parent\TeacherCommunication.js",
    "components\student\Quizzes.js",
    "components\student\StudentAttendance.js",
    "pages\AdminDashboard.js",
    "pages\AdminLogin.js",
    "pages\FacultyDashboard.js",
    "pages\FacultyLogin.js",
    "pages\Login.js",
    "pages\ParentDashboard.js",
    "pages\ParentLogin.js",
    "pages\SetupPassword.js",
    "pages\StudentDashboard.js",
    "pages\StudentLogin.js"
)

foreach ($file in $fileList) {
    $filePath = Join-Path -Path $sourcePath -ChildPath $file
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        # Check if the file has makeStyles but not the makeStyles import
        if ($content -match "makeStyles" -and -not ($content -match "import makeStyles from")) {
            Write-Host "Processing $filePath"
            
            # Remove any duplicate makeStyles imports first
            $content = $content -replace "import makeStyles from '.*?';\s*", ""
            
            # Determine the proper import path based on file location
            $importPath = "../utils/makeStylesCompat"
            if ($file -like "components\*\*") {
                $importPath = "../../utils/makeStylesCompat"
            }
            
            # Add the import after the first import statement
            $updatedContent = $content -replace "(?sm)(import .+?;.*?)(?=import|\r\n|\n|$)", "`$1`nimport makeStyles from '$importPath';`n"
            
            # Write the updated content back to the file
            Set-Content -Path $filePath -Value $updatedContent
            
            Write-Host "Added makeStyles import to $file"
        }
        else {
            Write-Host "Skipping $file - already has makeStyles import or does not use makeStyles"
        }
    }
    else {
        Write-Host "File not found: $filePath"
    }
}

Write-Host "All files processed!"
