# PowerShell script to move dashboard files
$sourceDir = "src/app/dashboard"
$roles = @("parent", "teacher", "student")

# Create [role] directory if it doesn't exist
New-Item -ItemType Directory -Force -Path "$sourceDir/[role]"

foreach ($role in $roles) {
    # Get all subdirectories in the role directory
    $subdirs = Get-ChildItem "$sourceDir/$role" -Directory

    foreach ($dir in $subdirs) {
        # Create corresponding directory in [role]
        $targetDir = "$sourceDir/[role]/$($dir.Name)"
        New-Item -ItemType Directory -Force -Path $targetDir

        # Copy files
        Copy-Item "$sourceDir/$role/$($dir.Name)/*" -Destination $targetDir -Recurse -Force
    }

    # Copy page.tsx if it exists
    if (Test-Path "$sourceDir/$role/page.tsx") {
        Copy-Item "$sourceDir/$role/page.tsx" -Destination "$sourceDir/[role]/$role.page.tsx" -Force
    }
}
