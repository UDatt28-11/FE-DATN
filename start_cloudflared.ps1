# Script để chạy Cloudflared cho Frontend
# Cách dùng: .\start_cloudflared.ps1

$cloudflaredPath = Join-Path $PSScriptRoot "cloudflared.exe"

if (-not (Test-Path $cloudflaredPath)) {
    Write-Host "`n❌ Không tìm thấy cloudflared.exe" -ForegroundColor Red
    Write-Host "`nVui lòng:" -ForegroundColor Yellow
    Write-Host "1. Truy cập: https://github.com/cloudflare/cloudflared/releases/latest" -ForegroundColor White
    Write-Host "2. Tải file: cloudflared-windows-amd64.exe" -ForegroundColor White
    Write-Host "3. Đổi tên thành: cloudflared.exe" -ForegroundColor White
    Write-Host "4. Lưu vào thư mục: $PSScriptRoot" -ForegroundColor White
    Write-Host "`nSau đó chạy lại script này." -ForegroundColor Yellow
    exit 1
}

Write-Host "`n🚀 Đang khởi động Cloudflared tunnel cho Frontend..." -ForegroundColor Cyan
Write-Host "Port: 5173" -ForegroundColor Gray
Write-Host "`n⚠️  Giữ terminal này mở để tunnel hoạt động!" -ForegroundColor Yellow
Write-Host "⚠️  Đảm bảo 'npm run dev' đang chạy trên port 5173" -ForegroundColor Yellow
Write-Host "`n"

& $cloudflaredPath tunnel --url http://localhost:5173

