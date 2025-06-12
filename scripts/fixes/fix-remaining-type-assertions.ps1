# PowerShell script to fix remaining type assertion issues
# This script will find and fix TypeScript-style type assertions in JavaScript files

Write-Host "Fixing remaining type assertion issues in JavaScript files..." -ForegroundColor Green

# Function to fix type assertions in a file
function Fix-TypeAssertions {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        $content = Get-Content $FilePath -Raw
        $originalContent = $content
        
        # Fix common type assertion patterns
        $content = $content -replace '<Add as AddIcon', '<AddIcon'
        $content = $content -replace '<Edit as EditIcon', '<EditIcon'
        $content = $content -replace '<Delete as DeleteIcon', '<DeleteIcon'
        $content = $content -replace '<Save as SaveIcon', '<SaveIcon'
        $content = $content -replace '<Check as CheckIcon', '<CheckIcon'
        $content = $content -replace '<Warning as WarningIcon', '<WarningIcon'
        $content = $content -replace '<Backup as BackupIcon', '<BackupIcon'
        $content = $content -replace '<Restore as RestoreIcon', '<RestoreIcon'
        $content = $content -replace '<Storage as StorageIcon', '<StorageIcon'
        $content = $content -replace '<Notifications as NotificationsIcon', '<NotificationsIcon'
        $content = $content -replace '<Schedule as ScheduleIcon', '<ScheduleIcon'
        $content = $content -replace '<School as SchoolIcon', '<SchoolIcon'
        $content = $content -replace '<Assignment as AssignmentIcon', '<AssignmentIcon'
        $content = $content -replace '<Quiz as QuizIcon', '<QuizIcon'
        $content = $content -replace '<TrendingUp as TrendingUpIcon', '<TrendingUpIcon'
        $content = $content -replace '<Person as PersonIcon', '<PersonIcon'
        $content = $content -replace '<People as PeopleIcon', '<PeopleIcon'
        
        # Fix icon usage patterns that don't include the Icon suffix
        $content = $content -replace '<Add as Add([^I])', '<AddIcon $1'
        $content = $content -replace '<Edit as Edit([^I])', '<EditIcon $1'
        $content = $content -replace '<Delete as Delete([^I])', '<DeleteIcon $1'
        
        if ($content -ne $originalContent) {
            Set-Content $FilePath $content -NoNewline
            Write-Host "Fixed: $FilePath" -ForegroundColor Yellow
        }
    }
}

# List of component directories to check
$directories = @(
    "src\components\admin",
    "src\components\faculty", 
    "src\components\student",
    "src\components\parent",
    "src\components\security",
    "src\components\settings",
    "src\components\assessment",
    "src\components\immersive",
    "src\components\layout",
    "src\components\notifications",
    "src\contexts",
    "src\pages"
)

foreach ($dir in $directories) {
    $fullPath = Join-Path (Get-Location) $dir
    if (Test-Path $fullPath) {
        Write-Host "Checking directory: $dir" -ForegroundColor Cyan
        Get-ChildItem "$fullPath\*.js" -Recurse | ForEach-Object {
            Fix-TypeAssertions $_.FullName
        }
    }
}

Write-Host "Type assertion fixes completed!" -ForegroundColor Green
