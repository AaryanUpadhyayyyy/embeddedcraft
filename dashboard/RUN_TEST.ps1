# 🚀 Complete Integration Test Runner
# Run this script to test the full event → campaign workflow

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🧪 COMPLETE INTEGRATION TEST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Check if backend is running
Write-Host "🔍 Checking backend server..." -ForegroundColor Yellow
$backendRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
    $backendRunning = $true
    Write-Host "✅ Backend is running on port 4000`n" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is NOT running`n" -ForegroundColor Red
}

# Start backend if not running
if (-not $backendRunning) {
    Write-Host "🚀 Starting backend server..." -ForegroundColor Yellow
    
    # Check if node_modules exists
    if (-not (Test-Path "server\node_modules")) {
        Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
        Set-Location server
        npm install
        Set-Location ..
        Write-Host "✅ Dependencies installed`n" -ForegroundColor Green
    }
    
    # Start backend in new window
    Write-Host "🌐 Starting Express server on port 4000..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd server; node index.js"
    
    # Wait for backend to start
    Write-Host "⏳ Waiting for server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    
    # Verify it started
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -Method GET -TimeoutSec 2
        Write-Host "✅ Backend started successfully`n" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to start backend. Please start manually:`n   cd server`n   node index.js`n" -ForegroundColor Red
        exit 1
    }
}

# Verify campaign configuration
Write-Host "🔍 Verifying campaign configuration..." -ForegroundColor Yellow
$dataJson = Get-Content "server\data.json" | ConvertFrom-Json
$campaign = $dataJson.campaigns | Where-Object { $_.trigger -eq "screen_viewed" }

if ($campaign) {
    Write-Host "✅ Found campaign:" -ForegroundColor Green
    Write-Host "   - Name: $($campaign.name)" -ForegroundColor White
    Write-Host "   - Type: $($campaign.type)" -ForegroundColor White
    Write-Host "   - Trigger: $($campaign.trigger)" -ForegroundColor White
    Write-Host "   - Status: $($campaign.status)`n" -ForegroundColor White
    
    if ($campaign.status -ne "active") {
        Write-Host "⚠️  WARNING: Campaign status is '$($campaign.status)'. Should be 'active' for testing.`n" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ No campaign found with trigger 'screen_viewed'`n" -ForegroundColor Red
    Write-Host "   Please verify server/data.json has a campaign with:" -ForegroundColor Yellow
    Write-Host '   "trigger": "screen_viewed"' -ForegroundColor White
    Write-Host '   "status": "active"' -ForegroundColor White
}

# Check Flutter setup
Write-Host "🔍 Checking Flutter environment..." -ForegroundColor Yellow
$flutterInstalled = Get-Command flutter -ErrorAction SilentlyContinue

if ($flutterInstalled) {
    Write-Host "✅ Flutter is installed`n" -ForegroundColor Green
    
    # Check if dependencies are installed
    if (-not (Test-Path "untitled\.dart_tool")) {
        Write-Host "📦 Installing Flutter dependencies..." -ForegroundColor Yellow
        Set-Location untitled
        flutter pub get
        Set-Location ..
        Write-Host "✅ Dependencies installed`n" -ForegroundColor Green
    } else {
        Write-Host "✅ Flutter dependencies already installed`n" -ForegroundColor Green
    }
} else {
    Write-Host "❌ Flutter is NOT installed`n" -ForegroundColor Red
    Write-Host "   Please install Flutter: https://flutter.dev/docs/get-started/install`n" -ForegroundColor Yellow
    exit 1
}

# Check for connected devices
Write-Host "🔍 Checking for connected devices..." -ForegroundColor Yellow
Set-Location untitled
$devices = flutter devices
Write-Host $devices -ForegroundColor White

if ($devices -match "No devices detected") {
    Write-Host "`n⚠️  No devices detected. Please start an emulator or connect a device.`n" -ForegroundColor Yellow
    Write-Host "   To start Android emulator:" -ForegroundColor Cyan
    Write-Host "   1. Open Android Studio" -ForegroundColor White
    Write-Host "   2. Tools > Device Manager" -ForegroundColor White
    Write-Host "   3. Click ▶️ on an emulator`n" -ForegroundColor White
    
    $continue = Read-Host "Start emulator and press Enter to continue (or 'q' to quit)"
    if ($continue -eq 'q') {
        Set-Location ..
        exit 0
    }
}

# Show test plan
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "📋 TEST PLAN" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "When the app starts, you should see:" -ForegroundColor Yellow
Write-Host "1. ✅ App launches successfully" -ForegroundColor White
Write-Host "2. ✅ Backend logs: 'Event tracked: app_opened'" -ForegroundColor White
Write-Host "3. ✅ Home screen loads" -ForegroundColor White
Write-Host "4. ✅ Backend logs: 'Event tracked: screen_viewed - 1 campaigns matched'" -ForegroundColor White
Write-Host "5. ✅ Bottom sheet slides up from bottom" -ForegroundColor White
Write-Host "6. ✅ Shows 'Welcome Message' with blue background" -ForegroundColor White
Write-Host "7. ✅ Backend logs: 'Event tracked: campaign_viewed'" -ForegroundColor White
Write-Host "8. ✅ You can swipe down to dismiss" -ForegroundColor White
Write-Host "9. ✅ Backend logs: 'Event tracked: campaign_dismissed'`n" -ForegroundColor White

Write-Host "Expected Debug Logs in Flutter:" -ForegroundColor Yellow
Write-Host "- 🚀 AppNinja initialized" -ForegroundColor White
Write-Host "- ✅ Auto-render enabled" -ForegroundColor White
Write-Host "- 🎯 Event 'screen_viewed' matched 1 campaign(s)" -ForegroundColor White
Write-Host "- ✅ Real-time campaigns emitted for auto-render" -ForegroundColor White
Write-Host "- 🚀 Auto-showing bottomsheet campaign: Welcome to Home Screen`n" -ForegroundColor White

# Ask to continue
$run = Read-Host "`nReady to run Flutter app? (y/n)"
if ($run -ne 'y') {
    Set-Location ..
    Write-Host "`n✋ Test cancelled. Run this script again when ready.`n" -ForegroundColor Yellow
    exit 0
}

# Run Flutter app
Write-Host "`n🚀 Starting Flutter app...`n" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "📱 FLUTTER APP RUNNING" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

flutter run

# Cleanup message
Set-Location ..
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ TEST COMPLETE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Did the bottom sheet appear on home screen? (y/n): " -ForegroundColor Yellow -NoNewline
$success = Read-Host

if ($success -eq 'y') {
    Write-Host "`n🎉 SUCCESS! Integration is working perfectly!`n" -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. ✅ Add more campaign types (modal, banner, pip)" -ForegroundColor White
    Write-Host "2. ✅ Add targeting rules to campaigns" -ForegroundColor White
    Write-Host "3. ✅ Test with real user data" -ForegroundColor White
    Write-Host "4. ✅ Deploy to production`n" -ForegroundColor White
} else {
    Write-Host "`n🔧 TROUBLESHOOTING`n" -ForegroundColor Yellow
    Write-Host "Check these common issues:" -ForegroundColor Cyan
    Write-Host "1. Backend logs - did it log 'screen_viewed - 1 campaigns matched'?" -ForegroundColor White
    Write-Host "2. Flutter console - any errors or warnings?" -ForegroundColor White
    Write-Host "3. Campaign status in data.json - is it 'active'?" -ForegroundColor White
    Write-Host "4. NinjaApp wrapper - is it wrapping MaterialApp?" -ForegroundColor White
    Write-Host "`nSee TEST_COMPLETE_INTEGRATION.md for detailed debugging steps.`n" -ForegroundColor Yellow
}

Write-Host "📝 Full test guide: TEST_COMPLETE_INTEGRATION.md" -ForegroundColor Cyan
Write-Host "📊 Integration analysis: DEEP_INTEGRATION_ANALYSIS.md`n" -ForegroundColor Cyan
