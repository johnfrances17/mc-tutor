# PowerShell script to update .user-info-inline CSS in all HTML files

$files = Get-ChildItem -Path "c:\xampp\htdocs\mc-tutor\public\html" -Recurse -Filter "*.html"

$updated = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Pattern 1: Multi-line .user-info-inline with border-radius: 8px
    $content = $content -replace '(\.user-info-inline\s*\{[^}]*?)border-radius:\s*8px;', '$1border-radius: 0px;'
    
    # Pattern 2: Multi-line .user-info-inline with max-width: 200px
    $content = $content -replace '(\.user-info-inline\s*\{[^}]*?)max-width:\s*200px;', '$1max-width: 180px;'
    
    # Pattern 3: Inline .user-info-inline (single line)
    $content = $content -replace '(\.user-info-inline\s*\{[^}]*?)border-radius:\s*8px;([^}]*?\})', '$1border-radius: 0px;$2'
    $content = $content -replace '(\.user-info-inline\s*\{[^}]*?)max-width:\s*200px;([^}]*?\})', '$1max-width: 180px;$2'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Updated: $($file.Name)" -ForegroundColor Green
        $updated++
    }
}

Write-Host ""
Write-Host "Total files updated: $updated" -ForegroundColor Cyan
