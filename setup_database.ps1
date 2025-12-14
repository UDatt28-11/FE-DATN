# Script de kiem tra va setup database
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SETUP DATABASE VA DU LIEU" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "C:\laragon\www\datn\BE-DATN"

# Buoc 1: Kiem tra file .env
Write-Host "[1/4] Kiem tra file .env..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "  -> Tao file .env tu .env.example..." -ForegroundColor Gray
    Copy-Item ".env.example" ".env"
    Write-Host "  ✓ File .env da duoc tao" -ForegroundColor Green
    Write-Host "  ⚠️  QUAN TRONG: Vui long mo file .env va cau hinh:" -ForegroundColor Red
    Write-Host "     - DB_DATABASE=ten_database" -ForegroundColor White
    Write-Host "     - DB_USERNAME=root" -ForegroundColor White
    Write-Host "     - DB_PASSWORD=(de trong neu dung Laragon)" -ForegroundColor White
    Write-Host ""
    $continue = Read-Host "Ban da cau hinh .env chua? (y/n)"
    if ($continue -ne 'y' -and $continue -ne 'Y') {
        Write-Host "Vui long cau hinh .env truoc khi tiep tuc!" -ForegroundColor Red
        exit
    }
} else {
    Write-Host "  ✓ File .env da ton tai" -ForegroundColor Green
}

# Buoc 2: Kiem tra key
Write-Host ""
Write-Host "[2/4] Kiem tra APP_KEY..." -ForegroundColor Yellow
$envContent = Get-Content ".env" -Raw
if ($envContent -notmatch "APP_KEY=.{32,}") {
    Write-Host "  -> Dang tao APP_KEY..." -ForegroundColor Gray
    php artisan key:generate
    Write-Host "  ✓ APP_KEY da duoc tao" -ForegroundColor Green
} else {
    Write-Host "  ✓ APP_KEY da co" -ForegroundColor Green
}

# Buoc 3: Chay migrations
Write-Host ""
Write-Host "[3/4] Dang chay migrations (tao cac bang)..." -ForegroundColor Yellow
Write-Host "  (Neu co loi, vui long kiem tra lai cau hinh database trong .env)" -ForegroundColor Gray
php artisan migrate --force

# Buoc 4: Chay seeders
Write-Host ""
Write-Host "[4/4] Dang chay seeders (do du lieu mau)..." -ForegroundColor Yellow
Write-Host "  Dang tao du lieu: Users, Properties, Rooms, Bookings, etc..." -ForegroundColor Gray
php artisan db:seed --force

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HOAN THANH!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Database da duoc tao va do du lieu mau thanh cong!" -ForegroundColor Green
Write-Host ""
Write-Host "Ban co the:" -ForegroundColor Yellow
Write-Host "  - Chay backend: php artisan serve" -ForegroundColor White
Write-Host "  - Kiem tra API: http://127.0.0.1:8000/api" -ForegroundColor White
Write-Host ""


