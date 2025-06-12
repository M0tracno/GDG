$sourcePath = "c:\Users\AYUSHMAN NANDA\OneDrive\Desktop\GDC\src"
$fileList = @(
    "pages\AdminLogin.js",
    "pages\FacultyLogin.js",
    "pages\Login.js",
    "pages\ParentLogin.js"
)

foreach ($file in $fileList) {
    $filePath = Join-Path -Path $sourcePath -ChildPath $file
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        # Count occurrences of makeStyles imports
        $matches = [regex]::Matches($content, "import makeStyles from")
        
        if ($matches.Count -gt 1) {
            Write-Host "Found $($matches.Count) makeStyles imports in $file - fixing..."
            
            # Get the path correctly
            $importPath = "../utils/makeStylesCompat"
            if ($file -like "components\*\*") {
                $importPath = "../../utils/makeStylesCompat"
            }
            
            # Replace all makeStyles imports with nothing
            $content = [regex]::Replace($content, "import makeStyles from '.*?';", "")
            
            # Add a single import at the top, after the first import
            $content = [regex]::Replace($content, "(?ms)(import .+?;\r?\n)", "`$1import makeStyles from '$importPath';\r\n")
            
            # Write the updated content back to the file
            Set-Content -Path $filePath -Value $content
            
            Write-Host "Fixed duplicates in $file"
        }
        else {
            Write-Host "No duplicates found in $file"
        }
    }
    else {
        Write-Host "File not found: $filePath"
    }
}

Write-Host "Duplicate imports removed!"
