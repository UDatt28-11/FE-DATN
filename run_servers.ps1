# Script de chay ca Frontend va Backend
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  KHOI DONG FRONTEND VA BACKEND" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiem tra va chay Backend
Write-Host "[1/2] Dang kiem tra Backend (Laravel)..." -ForegroundColor Yellow
Set-Location "C:\laragon\www\datn\BE-DATN"

# Kiem tra autoload.php
if (-not (Test-Path "vendor\autoload.php")) {
    Write-Host "  -> Dang tao autoload.php..." -ForegroundColor Gray
    composer dump-autoload --quiet --no-interaction
    if (-not (Test-Path "vendor\autoload.php")) {
        Write-Host "  ERROR: Khong the tao autoload.php" -ForegroundColor Red
        Write-Host "  Vui long chay: composer install" -ForegroundColor Red
        exit 1
    }
    Write-Host "  OK: autoload.php da duoc tao" -ForegroundColor Green
} else {
    Write-Host "  OK: autoload.php da ton tai" -ForegroundColor Green
}

Write-Host ""
Write-Host "[2/2] Dang kiem tra Frontend (Vite)..." -ForegroundColor Yellow
Set-Location "C:\laragon\www\datn\FE-DATN"

if (-not (Test-Path "node_modules")) {
    Write-Host "  -> Dang cai dat dependencies..." -ForegroundColor Gray
    npm install --legacy-peer-deps
    Write-Host "  OK: Dependencies da duoc cai dat" -ForegroundColor Green
} else {
    Write-Host "  OK: node_modules da ton tai" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DANG KHOI DONG SERVERS..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Khoi dong Backend
Write-Host "Backend server: http://127.0.0.1:8000" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\laragon\www\datn\BE-DATN; Write-Host '=== BACKEND SERVER (Laravel) ===' -ForegroundColor Green; Write-Host 'URL: http://127.0.0.1:8000' -ForegroundColor Cyan; Write-Host 'API: http://127.0.0.1:8000/api' -ForegroundColor Cyan; Write-Host ''; php artisan serve --host=127.0.0.1 --port=8000"

Start-Sleep -Seconds 2

# Khoi dong Frontend  
Write-Host "Frontend server: http://localhost:5173" -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\laragon\www\datn\FE-DATN; Write-Host '=== FRONTEND SERVER (Vite) ===' -ForegroundColor Cyan; Write-Host 'URL: http://localhost:5173' -ForegroundColor Cyan; Write-Host ''; npm run dev"

Write-Host ""
Write-Host "OK: Da khoi dong ca hai server!" -ForegroundColor Green
Write-Host ""
Write-Host "Thong tin truy cap:" -ForegroundColor Yellow
Write-Host "  - Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "  - Backend:  http://127.0.0.1:8000" -ForegroundColor White
Write-Host "  - API:      http://127.0.0.1:8000/api" -ForegroundColor White
Write-Host ""
Write-Host "Luu y: Hai cua so PowerShell se duoc mo de hien thi log" -ForegroundColor Gray
Write-Host "De dung server, dong cac cua so PowerShell do" -ForegroundColor Gray
Write-Host ""
