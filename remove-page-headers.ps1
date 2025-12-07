# PowerShell script to remove page-header sections from all HTML files

$files = Get-ChildItem -Path "c:\xampp\htdocs\mc-tutor\public\html" -Recurse -Filter "*.html" | Where-Object { $_.Name -notlike "login.html" -and $_.Name -notlike "register.html" -and $_.Name -notlike "admin-login.html" -and $_.Name -notlike "forgot-password.html" -and $_.Name -notlike "reset-password.html" -and $_.Name -notlike "index.html" -and $_.Name -notlike "system-status.html" }

$updated = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Pattern to match page-header div with various closing patterns
    # Match from <div class="page-header"> to the next major container div
    $pattern = '(?s)\s*<div class="page-header">.*?</div>\s*(?=\s*<div class="(container|sessions-container|content-container|messenger-container)")'
    
    if ($content -match $pattern) {
        $content = $content -replace $pattern, "`n`n"
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.Name)" -ForegroundColor Green
        $updated++
    }
}

Write-Host ""
Write-Host "Total files updated: $updated" -ForegroundColor Cyan
