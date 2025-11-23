# API Key Generation Script

# Generate Admin API Key
$adminKey = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
Write-Host "ADMIN_API_KEY=" -NoNewline
Write-Host $adminKey -ForegroundColor Green

# Generate Client API Key
$clientKey = [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
Write-Host "CLIENT_API_KEY=" -NoNewline
Write-Host $clientKey -ForegroundColor Green

Write-Host "`nCopy these keys to your .env file" -ForegroundColor Yellow
Write-Host "Keep them secure and never commit to version control!" -ForegroundColor Red
