# Script để chạy cả Frontend và Cloudflared cùng lúc
# Cách dùng: .\start_both.ps1

Write-Host "`n=== KHOI DONG FRONTEND VA CLOUDFLARED ===" -ForegroundColor Cyan
Write-Host ""

# Kiểm tra cloudflared.exe
$cloudflaredPath = Join-Path $PSScriptRoot "cloudflared.exe"
if (-not (Test-Path $cloudflaredPath)) {
    Write-Host "❌ Không tìm thấy cloudflared.exe" -ForegroundColor Red
    Write-Host "Vui lòng tải từ: https://github.com/cloudflare/cloudflared/releases/latest" -ForegroundColor Yellow
    exit 1
}

# Kiểm tra node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules chưa được cài đặt" -ForegroundColor Yellow
    Write-Host "Đang cài đặt dependencies..." -ForegroundColor Cyan
    npm install
    Write-Host ""
}

Write-Host "📋 Checklist:" -ForegroundColor Yellow
Write-Host "   [ ] Frontend server sẽ chạy trên port 5173" -ForegroundColor Gray
Write-Host "   [ ] Cloudflared tunnel sẽ tạo public URL" -ForegroundColor Gray
Write-Host "   [ ] Giữ cả 2 terminal mở để hoạt động" -ForegroundColor Gray
Write-Host ""

$start = Read-Host "Bạn có muốn tiếp tục? (y/n)"
if ($start -ne 'y' -and $start -ne 'Y') {
    Write-Host "Đã hủy." -ForegroundColor Yellow
    exit 0
}

Write-Host "`n🚀 Đang khởi động Frontend server..." -ForegroundColor Cyan
Write-Host "   Port: 5173" -ForegroundColor Gray
Write-Host "   URL: http://localhost:5173" -ForegroundColor Gray
Write-Host ""

# Start Frontend trong background
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PSScriptRoot
    npm run dev
}

Write-Host "⏳ Đợi frontend khởi động (5 giây)..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Kiểm tra frontend có chạy không
$portCheck = netstat -ano | Select-String ":5173"
if (-not $portCheck) {
    Write-Host "⚠️  Frontend có thể chưa khởi động xong" -ForegroundColor Yellow
    Write-Host "   Kiểm tra terminal frontend để xem lỗi" -ForegroundColor Gray
} else {
    Write-Host "✅ Frontend đang chạy trên port 5173" -ForegroundColor Green
}

Write-Host "`n🚀 Đang khởi động Cloudflared tunnel..." -ForegroundColor Cyan
Write-Host "   URL sẽ hiển thị bên dưới" -ForegroundColor Gray
Write-Host ""

# Start Cloudflared
& $cloudflaredPath tunnel --url http://localhost:5173

# Cleanup khi exit
Write-Host "`n🛑 Đang dừng..." -ForegroundColor Yellow
Stop-Job $frontendJob -ErrorAction SilentlyContinue
Remove-Job $frontendJob -ErrorAction SilentlyContinue


