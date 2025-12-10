# Cleanup script to remove locked .next directory
Write-Host "🧹 Cleaning up build directories..." -ForegroundColor Yellow

# Try to remove .next directory
if (Test-Path ".next") {
    Write-Host "Attempting to remove .next directory..." -ForegroundColor Yellow
    try {
        Remove-Item ".next" -Recurse -Force -ErrorAction Stop
        Write-Host "✅ Successfully removed .next directory" -ForegroundColor Green
    } catch {
        Write-Host "❌ Could not remove .next directory: $_" -ForegroundColor Red
        Write-Host "Please close any running processes (npm run dev, VS Code, etc.) and try again" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Or manually delete the .next folder and run: npm run build:ipfs" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "✅ No .next directory found" -ForegroundColor Green
}

# Remove out directory if it exists
if (Test-Path "out") {
    Write-Host "Removing old out directory..." -ForegroundColor Yellow
    Remove-Item "out" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Cleaned up out directory" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Cleanup complete! Now run: npm run build:ipfs" -ForegroundColor Green




