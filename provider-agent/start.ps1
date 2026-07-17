# ════════════════════════════════════════════════════════════════
#  RenderLock Provider Agent — One-Command Setup (Windows PowerShell)
#
#  Run as Administrator:
#    Set-ExecutionPolicy Bypass -Scope Process -Force
#    irm https://raw.githubusercontent.com/muzammalali2011/Rendorlock/refs/heads/main/provider-agent/start.ps1 | iex
# ════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"

function Write-Step { param($msg) Write-Host "`n▶ $msg" -ForegroundColor Cyan }
function Write-Ok   { param($msg) Write-Host "  [OK] $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "  [WARN] $msg" -ForegroundColor Yellow }
function Write-Info { param($msg) Write-Host "  [i] $msg" -ForegroundColor Gray }

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
try {
    $dockerVer = docker --version 2>&1
    Write-Ok "Docker found: $dockerVer"
} catch {
    Write-Warn "Docker Desktop not found. Opening download page..."
    Start-Process "https://www.docker.com/products/docker-desktop/"
    Write-Host "  Please install Docker Desktop, then re-run this script." -ForegroundColor Yellow
    Exit 1
}

# Make sure Docker daemon is running
try {
    docker info 2>&1 | Out-Null
} catch {
    Write-Warn "Docker daemon is not running. Please start Docker Desktop and try again."
    Exit 1
}

# ── 2. Check / Install cloudflared ────────────────────────────────
Write-Step "Checking Cloudflare Tunnel (cloudflared)..."
$cfPath = "C:\Windows\System32\cloudflared.exe"
if (-Not (Test-Path $cfPath)) {
    Write-Warn "cloudflared not found. Downloading..."
    $cfUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
    Invoke-WebRequest -Uri $cfUrl -OutFile $cfPath -UseBasicParsing
    Write-Ok "cloudflared installed to $cfPath"
} else {
    Write-Ok "cloudflared found: $cfPath"
}

# ── 3. Clean up any previous session ──────────────────────────────
Write-Step "Cleaning up previous sessions..."
docker stop renderlock-workspace 2>&1 | Out-Null
docker rm   renderlock-workspace 2>&1 | Out-Null
& taskkill /F /IM cloudflared.exe 2>&1 | Out-Null
Write-Ok "Clean slate ready"

# ── 4. Download Dockerfile + start.sh from GitHub ─────────────────
Write-Step "Downloading workspace files from GitHub..."
$buildDir = "$env:TEMP\renderlock-build"
New-Item -ItemType Directory -Force -Path $buildDir | Out-Null

Invoke-WebRequest -Uri "$GH_BASE/Dockerfile" -OutFile "$buildDir\Dockerfile" -UseBasicParsing
Invoke-WebRequest -Uri "$GH_BASE/start.sh"   -OutFile "$buildDir\start.sh"   -UseBasicParsing

# Ensure start.sh has Unix line endings (LF) so bash can execute it in the container
$content = [System.IO.File]::ReadAllText("$buildDir\start.sh") -replace "`r`n", "`n" -replace "`r", "`n"
[System.IO.File]::WriteAllText("$buildDir\start.sh", $content, [System.Text.UTF8Encoding]::new($false))

Write-Ok "Files downloaded to $buildDir"

# ── 5. Build workspace Docker image ───────────────────────────────
Write-Step "Building workspace image (first run takes ~2 min, cached after)..."
docker build -t renderlock-workspace:latest $buildDir
Write-Ok "Image built successfully"

# ── 6. Start workspace container (ttyd on port 8080) ──────────────
Write-Step "Starting workspace container..."
docker run -d `
    --name renderlock-workspace `
    --restart unless-stopped `
    -p 8080:8080 `
    renderlock-workspace:latest | Out-Null

Start-Sleep -Seconds 3

# Verify container is running
$containerStatus = docker ps --filter "name=renderlock-workspace" --format "{{.Status}}"
if (-Not $containerStatus) {
    Write-Warn "Container failed to start. Checking logs..."
    docker logs renderlock-workspace 2>&1
    Exit 1
}
Write-Ok "Container running: $containerStatus"

# ── 7. Start Cloudflare Quick Tunnel (on Windows host) ────────────
Write-Step "Opening Cloudflare Quick Tunnel..."
Write-Info "No Cloudflare account required"

$tunnelLog = "$env:TEMP\renderlock_tunnel.log"
if (Test-Path $tunnelLog) { Remove-Item $tunnelLog }

Start-Process -FilePath $cfPath `
    -ArgumentList "tunnel --url http://localhost:8080 --no-autoupdate" `
    -RedirectStandardError $tunnelLog `
    -WindowStyle Hidden

# Wait for URL (up to 30 seconds)
Write-Host "  Waiting for tunnel URL" -NoNewline -ForegroundColor Gray
$tunnelUrl = ""
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    Write-Host "." -NoNewline -ForegroundColor Gray
    $logContent = Get-Content $tunnelLog -Raw -ErrorAction SilentlyContinue
    if ($logContent -match 'https://[a-z0-9-]+\.trycloudflare\.com') {
        $tunnelUrl = $Matches[0]
        break
    }
}
Write-Host ""

if (-Not $tunnelUrl) {
    Write-Warn "Could not detect tunnel URL automatically."
    Write-Host "  Check log manually: $tunnelLog" -ForegroundColor Yellow
    Exit 1
}

# ── 8. Save session info ───────────────────────────────────────────
$sessionFile = "$env:USERPROFILE\.renderlock_session.txt"
@"
TUNNEL_URL=$tunnelUrl
CONTAINER=renderlock-workspace
STARTED=$(Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
STOP_CMD=docker stop renderlock-workspace
"@ | Set-Content $sessionFile

# ── 9. Print results ───────────────────────────────────────────────
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

# Copy URL to clipboard
try {
    $tunnelUrl | Set-Clipboard
    Write-Host "  📋 URL copied to clipboard!" -ForegroundColor Green
} catch { }
Write-Host ""
