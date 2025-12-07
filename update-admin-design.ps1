# Update Admin Navigation Design Script
# This script updates all admin HTML files with the new modern navigation design

Write-Host "Updating admin files with modern navigation..." -ForegroundColor Cyan

# Admin files to update
$adminFiles = @(
    "c:\xampp\htdocs\mc-tutor\public\html\admin\admin-dashboard.html",
    "c:\xampp\htdocs\mc-tutor\public\html\admin\admin-manage-users.html",
    "c:\xampp\htdocs\mc-tutor\public\html\admin\admin-manage-sessions.html",
    "c:\xampp\htdocs\mc-tutor\public\html\admin\admin-manage-subjects.html",
    "c:\xampp\htdocs\mc-tutor\public\html\admin\admin-view-materials.html",
    "c:\xampp\htdocs\mc-tutor\public\html\admin\admin-view-sessions.html"
)

foreach ($file in $adminFiles) {
    if (Test-Path $file) {
        Write-Host "Processing: $file" -ForegroundColor Yellow
        
        # Read content
        $content = Get-Content $file -Raw
        
        # 1. Add Montserrat font if not exists
        if ($content -notmatch "Montserrat") {
            $content = $content -replace '(<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">)', 
                '$1`n    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet">'
        }
        
        # 2. Add Montserrat base styles after <style> tag
        if ($content -notmatch "\* \{[\s\S]*?font-family: 'Montserrat'") {
            $content = $content -replace '(<style>)', 
                '$1`n        /* Base font styling - Montserrat for all elements */`n        * {`n            font-family: ''Montserrat'', sans-serif;`n        }`n`n        body {`n            font-family: ''Montserrat'', sans-serif;`n            background: #f5f5f5;`n            min-height: 100vh;`n        }'
        }
        
        # Save
        $content | Set-Content $file -NoNewline
        Write-Host "✓ Updated $file" -ForegroundColor Green
    } else {
        Write-Host "✗ File not found: $file" -ForegroundColor Red
    }
}

Write-Host "`n✅ Admin files updated successfully!" -ForegroundColor Green
Write-Host "Note: Full navigation structure needs manual review for each page's specific content." -ForegroundColor Yellow
