# ════════════════════════════════════════════════════════════════
#  RenderLock Provider Agent — One-Command Setup (Windows PowerShell)
#
#  Run as Administrator:
#    Set-ExecutionPolicy Bypass -Scope Process -Force
#    irm https://raw.githubusercontent.com/muzammalali2011/Rendorlock/refs/heads/main/provider-agent/start.ps1 | iex
# ════════════════════════════════════════════════════════════════

# Continue so cleanup steps never abort the script
$ErrorActionPreference = "Continue"

function Write-Step { param($msg) Write-Host "`n▶ $msg" -ForegroundColor Cyan }
function Write-Ok   { param($msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "  [WARN] $msg" -ForegroundColor Yellow }
function Write-Info { param($msg) Write-Host "  [i] $msg" -ForegroundColor Gray }
function Fail       { param($msg) Write-Host "`n  [ERROR] $msg" -ForegroundColor Red; Exit 1 }

Clear-Host
Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   RenderLock Provider Agent  v1.0            ║" -ForegroundColor Cyan
Write-Host "║   Decentralized GPU Compute · Avalanche       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── GitHub raw base URL ───────────────────────────────────────────
$GH_BASE = "https://raw.githubusercontent.com/muzammalali2011/Rendorlock/refs/heads/main/provider-agent"

# ── 1. Check Docker ───────────────────────────────────────────────
Write-Step "Checking Docker..."
$dockerVer = docker --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Start-Process "https://www.docker.com/products/docker-desktop/"
    Fail "Docker not found. Install Docker Desktop and re-run."
}
Write-Ok "Docker found: $dockerVer"

docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Fail "Docker daemon not running. Start Docker Desktop and try again."
}

# ── 2. Check / Install cloudflared ────────────────────────────────
Write-Step "Checking Cloudflare Tunnel (cloudflared)..."
$cfPath = "C:\Windows\System32\cloudflared.exe"
if (-Not (Test-Path $cfPath)) {
    Write-Warn "cloudflared not found. Downloading..."
    Invoke-WebRequest -Uri "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe" `
        -OutFile $cfPath -UseBasicParsing
    if (-Not (Test-Path $cfPath)) { Fail "Failed to download cloudflared." }
    Write-Ok "cloudflared installed"
} else {
    Write-Ok "cloudflared found"
}

# ── 3. Clean up any previous session ──────────────────────────────
Write-Step "Cleaning up previous sessions..."
docker stop renderlock-workspace 2>&1 | Out-Null
docker rm   renderlock-workspace 2>&1 | Out-Null
taskkill /F /IM cloudflared.exe 2>&1 | Out-Null
Start-Sleep -Seconds 1
Write-Ok "Clean slate ready"

# ── 4. Download Dockerfile + start.sh from GitHub ─────────────────
Write-Step "Downloading workspace files from GitHub..."
$buildDir = "$env:TEMP\renderlock-build"
New-Item -ItemType Directory -Force -Path $buildDir | Out-Null

Invoke-WebRequest -Uri "$GH_BASE/Dockerfile" -OutFile "$buildDir\Dockerfile" -UseBasicParsing
Invoke-WebRequest -Uri "$GH_BASE/start.sh"   -OutFile "$buildDir\start.sh"   -UseBasicParsing

if (-Not (Test-Path "$buildDir\Dockerfile")) { Fail "Failed to download Dockerfile from GitHub." }

# Fix line endings: ensure start.sh uses Unix LF (required by bash inside Linux container)
$bytes = [System.IO.File]::ReadAllBytes("$buildDir\start.sh")
$text  = [System.Text.Encoding]::UTF8.GetString($bytes) -replace "`r`n","`n" -replace "`r","`n"
[System.IO.File]::WriteAllBytes("$buildDir\start.sh", [System.Text.Encoding]::UTF8.GetBytes($text))

Write-Ok "Files ready in $buildDir"

# ── 5. Build workspace Docker image ───────────────────────────────
Write-Step "Building workspace image (first run ~2 min, cached after)..."
docker build -t renderlock-workspace:latest $buildDir
if ($LASTEXITCODE -ne 0) { Fail "Docker build failed." }
Write-Ok "Image built successfully"

# ── 6. Start workspace container ──────────────────────────────────
Write-Step "Starting workspace container (port 8080)..."
docker run -d `
    --name renderlock-workspace `
    --restart unless-stopped `
    -p 8080:8080 `
    renderlock-workspace:latest | Out-Null

Start-Sleep -Seconds 3
$containerStatus = docker ps --filter "name=renderlock-workspace" --format "{{.Status}}"
if (-Not $containerStatus) {
    docker logs renderlock-workspace 2>&1
    Fail "Container failed to start."
}
Write-Ok "Container running: $containerStatus"

# ── 7. Start Cloudflare Tunnel on Windows host ────────────────────
Write-Step "Opening Cloudflare Quick Tunnel..."
Write-Info "No Cloudflare account required"

$tunnelLog = "$env:TEMP\renderlock_tunnel.log"
Remove-Item $tunnelLog -ErrorAction SilentlyContinue

Start-Process -FilePath $cfPath `
    -ArgumentList "tunnel --url http://localhost:8080 --no-autoupdate" `
    -RedirectStandardError $tunnelLog `
    -WindowStyle Hidden

Write-Host "  Waiting for tunnel URL" -NoNewline -ForegroundColor Gray
$tunnelUrl = ""
for ($i = 0; $i -lt 35; $i++) {
    Start-Sleep -Seconds 1
    Write-Host "." -NoNewline -ForegroundColor Gray
    $logContent = Get-Content $tunnelLog -Raw -ErrorAction SilentlyContinue
    if ($logContent -match 'https://[a-z0-9-]+\.trycloudflare\.com') {
        $tunnelUrl = $Matches[0]; break
    }
}
Write-Host ""

if (-Not $tunnelUrl) { Fail "Tunnel URL not detected. Check: $tunnelLog" }

# ── 8. Save session ───────────────────────────────────────────────
$sessionFile = "$env:USERPROFILE\.renderlock_session.txt"
"TUNNEL_URL=$tunnelUrl`nSTARTED=$(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')" | Set-Content $sessionFile

# ── 9. Done! ──────────────────────────────────────────────────────
Write-Host ""
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅  RenderLock Provider Agent is LIVE!             " -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "  Tunnel URL  : " -NoNewline; Write-Host $tunnelUrl -ForegroundColor Cyan
Write-Host "  Username    : renter"
Write-Host "  Password    : RenderLock2026!"
Write-Host ""
Write-Host "  ★ COPY THIS URL into the RenderLock listing form:" -ForegroundColor Yellow
Write-Host "    $tunnelUrl" -ForegroundColor White
Write-Host ""
Write-Host "  To stop  : docker stop renderlock-workspace" -ForegroundColor Gray
Write-Host "  Session  : $sessionFile" -ForegroundColor Gray
Write-Host "════════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

try { $tunnelUrl | Set-Clipboard; Write-Host "  Copied to clipboard!" -ForegroundColor Green } catch { }
Write-Host ""
