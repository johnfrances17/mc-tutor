# Run Database Migrations
Write-Host "MC Tutor - Database Migration Script" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

$migrationsDir = $PSScriptRoot

$migrations = @(
    "001_create_courses_table.sql",
    "002_update_users_table.sql",
    "003_update_subjects_table.sql",
    "004_create_tutor_availability.sql",
    "005_create_tutor_stats.sql",
    "006_update_sessions_table.sql",
    "007_update_materials_table.sql",
    "008_update_feedback_table.sql",
    "009_update_notifications_table.sql",
    "010_update_chats_table.sql",
    "011_update_tutor_subjects_table.sql"
)

Write-Host "Migration Files Ready:" -ForegroundColor Yellow
foreach ($migration in $migrations) {
    $filePath = Join-Path $migrationsDir $migration
    if (Test-Path $filePath) {
        Write-Host "  [OK] $migration" -ForegroundColor Green
    } else {
        Write-Host "  [MISSING] $migration" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "MANUAL EXECUTION REQUIRED:" -ForegroundColor Yellow
Write-Host "  Since Supabase requires SQL execution through dashboard:" -ForegroundColor Gray
Write-Host ""
Write-Host "  1. Open Supabase Dashboard: https://app.supabase.com" -ForegroundColor White
Write-Host "  2. Select your project" -ForegroundColor White
Write-Host "  3. Go to SQL Editor" -ForegroundColor White
Write-Host "  4. Copy and paste each migration file content" -ForegroundColor White
Write-Host "  5. Execute them in order (001 to 011)" -ForegroundColor White
Write-Host ""

Write-Host "Migration Files Location:" -ForegroundColor Cyan
Write-Host "  $migrationsDir" -ForegroundColor Gray
Write-Host ""

Write-Host "OR use the combined file:" -ForegroundColor Yellow
$combinedFile = Join-Path $migrationsDir "combined_migration.sql"

if (Test-Path $combinedFile) {
    Write-Host "  Found: combined_migration.sql" -ForegroundColor Green
} else {
    Write-Host "  Creating combined migration file..." -ForegroundColor Yellow
    
    $combinedContent = "-- ===================================`n"
    $combinedContent += "-- MC TUTOR - COMBINED MIGRATION FILE`n"
    $combinedContent += "-- Date: $(Get-Date -Format 'yyyy-MM-dd')`n"
    $combinedContent += "-- Execute this in Supabase SQL Editor`n"
    $combinedContent += "-- ===================================`n`n"
    
    foreach ($migration in $migrations) {
        $filePath = Join-Path $migrationsDir $migration
        if (Test-Path $filePath) {
            $combinedContent += "`n`n-- ========== $migration ==========`n"
            $combinedContent += Get-Content $filePath -Raw
            $combinedContent += "`n"
        }
    }
    
    Set-Content -Path $combinedFile -Value $combinedContent -Encoding UTF8
    Write-Host "  [CREATED] combined_migration.sql" -ForegroundColor Green
}

Write-Host ""
Write-Host "You can now copy the entire combined_migration.sql file" -ForegroundColor Cyan
Write-Host "and paste it into Supabase SQL Editor for one-click execution!" -ForegroundColor Cyan
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
