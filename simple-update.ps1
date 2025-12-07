# Simplified Admin Files Update Script
Write-Host "Updating admin files..." -ForegroundColor Cyan

$files = @(
    "admin-manage-users.html",
    "admin-manage-sessions.html",
    "admin-manage-subjects.html",
    "admin-view-materials.html",
    "admin-view-sessions.html"
)

$base = "c:\xampp\htdocs\mc-tutor\public\html\admin\"

foreach ($file in $files) {
    $path = Join-Path $base $file
    if (Test-Path $path) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        
        $content = Get-Content $path -Raw
        
        # Add Montserrat font
        if ($content -notmatch "Montserrat") {
            $content = $content.Replace(
                '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">',
                '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">' + "`n" + 
                '    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">'
            )
        }
        
        # Add base font CSS
        if ($content -notmatch "font-family: 'Montserrat'") {
            $baseCss = @"
        /* Base font styling */
        * { font-family: 'Montserrat', sans-serif; }
        body { font-family: 'Montserrat', sans-serif; background: #f5f5f5; min-height: 100vh; }

"@
            $content = $content.Replace('<style>', "<style>`n$baseCss")
        }
        
        $content | Set-Content $path -NoNewline
        Write-Host "Updated: $file" -ForegroundColor Green
    }
}

Write-Host "Done! Now manually update navigation structure using ADMIN_UPDATE_GUIDE.md" -ForegroundColor Cyan
