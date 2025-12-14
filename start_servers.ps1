# Script để chạy cả Frontend và Backend
Write-Host "`n=== KHOI DONG FRONTEND VA BACKEND ===" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra và chạy Backend
Write-Host "🚀 Dang khoi dong Backend (Laravel)..." -ForegroundColor Yellow
$backendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\laragon\www\datn\BE-DATN; php artisan serve --host=127.0.0.1 --port=8000" -PassThru

Start-Sleep -Seconds 3

# Kiểm tra và chạy Frontend
Write-Host "🚀 Dang khoi dong Frontend (Vite)..." -ForegroundColor Yellow
$frontendJob = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd C:\laragon\www\datn\FE-DATN; npm run dev" -PassThru

Start-Sleep -Seconds 5

Write-Host "`n✅ Da khoi dong ca hai server!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Thong tin truy cap:" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:5173" -ForegroundColor White
Write-Host "   - Backend API: http://127.0.0.1:8000/api" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Luu y: Hai cua so PowerShell se duoc mo de hien thi log cua cac server" -ForegroundColor Yellow
Write-Host "   De dung server, dong cac cua so PowerShell do" -ForegroundColor Yellow
Write-Host ""


