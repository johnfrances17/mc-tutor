# PowerShell script to add margin-top to all container types

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
    
    # Fix margin for .sessions-container
    $content = $content -replace '(\.sessions-container\s*\{[^}]*?max-width[^}]*?)margin:\s*0\s+auto;', '$1margin: 40px auto 0;'
    
    # Fix margin for .content-container  
    $content = $content -replace '(\.content-container\s*\{[^}]*?)margin:\s*0\s+auto;', '$1margin: 40px auto 0;'
    
    # Fix margin for .messenger-container
    $content = $content -replace '(\.messenger-container\s*\{[^}]*?)margin:\s*0\s+auto;', '$1margin: 40px auto 0;'
    
    # Fix margin for .feedback-form-container
    $content = $content -replace '(\.feedback-form-container\s*\{[^}]*?)margin:\s*0\s+auto;', '$1margin: 40px auto 0;'
    
    # Fix margin for .feedback-grid
    $content = $content -replace '(\.feedback-grid\s*\{[^}]*?)margin:\s*0\s+auto;', '$1margin: 40px auto 0;'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.Name)" -ForegroundColor Green
        $updated++
    }
}

Write-Host ""
Write-Host "Total files updated: $updated" -ForegroundColor Cyan
