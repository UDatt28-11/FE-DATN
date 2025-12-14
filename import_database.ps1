# Script de import database tu file bookstay.sql
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  IMPORT DATABASE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$sqlFile = "C:\laragon\www\datn\BE-DATN\bookstay.sql"
$dbName = "bookstay"
$dbUser = "root"
$dbPass = ""

Write-Host "Thong tin:" -ForegroundColor Yellow
Write-Host "  SQL File: $sqlFile" -ForegroundColor Gray
Write-Host "  Database: $dbName" -ForegroundColor Gray
Write-Host "  User: $dbUser" -ForegroundColor Gray
Write-Host ""

# Kiem tra file SQL
if (-not (Test-Path $sqlFile)) {
    Write-Host "ERROR: Khong tim thay file $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "Buoc 1: Tao database (neu chua co)..." -ForegroundColor Yellow
$createDbCmd = "CREATE DATABASE IF NOT EXISTS `$dbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u $dbUser -e $createDbCmd 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "  OK: Database da san sang" -ForegroundColor Green
} else {
    Write-Host "  WARNING: Co the database da ton tai" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Buoc 2: Dang import du lieu tu SQL file..." -ForegroundColor Yellow
Write-Host "  (Co the mat vai phut, vui long doi...)" -ForegroundColor Gray

mysql -u $dbUser $dbName < $sqlFile 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  IMPORT THANH CONG!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    
    # Kiem tra so luong ban ghi
    Write-Host "Dang kiem tra du lieu..." -ForegroundColor Yellow
    $roomCount = mysql -u $dbUser $dbName -e "SELECT COUNT(*) as count FROM rooms;" -N 2>&1
    $propertyCount = mysql -u $dbUser $dbName -e "SELECT COUNT(*) as count FROM properties;" -N 2>&1
    
    Write-Host "  So luong Properties: $propertyCount" -ForegroundColor Cyan
    Write-Host "  So luong Rooms: $roomCount" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Database da co du lieu! Ban co the chay lai backend." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "ERROR: Co loi khi import database" -ForegroundColor Red
    Write-Host "Vui long kiem tra:" -ForegroundColor Yellow
    Write-Host "  1. MySQL da chay chua?" -ForegroundColor White
    Write-Host "  2. Database 'bookstay' da duoc tao chua?" -ForegroundColor White
    Write-Host "  3. File SQL co hop le khong?" -ForegroundColor White
}

Write-Host ""

