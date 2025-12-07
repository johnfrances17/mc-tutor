# PowerShell script to add margin-top to containers and fix spacing

$files = Get-ChildItem -Path "c:\xampp\htdocs\mc-tutor\public\html" -Recurse -Filter "*.html" | Where-Object { 
    $_.Name -notlike "login.html" -and 
    $_.Name -notlike "register.html" -and 
    $_.Name -notlike "admin-login.html" -and 
    $_.Name -notlike "forgot-password.html" -and 
    $_.Name -notlike "reset-password.html" -and 
    $_.Name -notlike "index.html" -and 
    $_.Name -notlike "system-status.html" 
}

$updated = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix 1: Add newline before <div class="container"> and similar containers
    $content = $content -replace '</a><div class="(container|sessions-container|content-container|messenger-container|feedback-form-container|feedback-grid)">', "</a>`n`n    <div class=`"`$1`">"
    
    # Fix 2: Ensure container has margin-top in CSS if not present
    # Look for .container { without margin-top
    if ($content -match '\.container\s*\{[^}]*?(?<!margin-top:)(\s*max-width)') {
        # Add margin-top before max-width
        $content = $content -replace '(\.container\s*\{)(\s*max-width)', "`$1`n            margin-top: 40px;`$2"
    }
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.Name)" -ForegroundColor Green
        $updated++
    }
}

Write-Host ""
Write-Host "Total files updated: $updated" -ForegroundColor Cyan
