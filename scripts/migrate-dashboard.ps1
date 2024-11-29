# PowerShell script to migrate dashboard files
$roles = @("parent", "teacher", "student")
$sourceDir = "src/app/dashboard"
$targetDir = "src/app/dashboard/[role]"

foreach ($role in $roles) {
    $rolePath = "$sourceDir/$role"
    if (Test-Path $rolePath) {
        # Get all subdirectories
        Get-ChildItem $rolePath -Directory | ForEach-Object {
            $subdir = $_.Name
            $sourcePath = "$rolePath/$subdir"
            $targetPath = "$targetDir/$subdir"
            
            # Create target directory if it doesn't exist
            if (-not (Test-Path $targetPath)) {
                New-Item -ItemType Directory -Force -Path $targetPath
            }
            
            # Copy files
            Copy-Item "$sourcePath/*" -Destination $targetPath -Recurse -Force
        }
        
        # Handle page.tsx
        if (Test-Path "$rolePath/page.tsx") {
            Copy-Item "$rolePath/page.tsx" -Destination "$targetDir/$role.page.tsx" -Force
        }
    }
}

Write-Host "Migration completed. Please verify the files before deleting the old directories."
