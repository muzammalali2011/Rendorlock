# ════════════════════════════════════════════════════════════════
#  RenderLock Provider Agent — One-Command Setup (Windows PowerShell)
#  Usage (run as Administrator):
#    Set-ExecutionPolicy Bypass -Scope Process -Force
#    .\start.ps1
# ════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"

function Write-Step  { param($msg) Write-Host "▶ $msg" -ForegroundColor Cyan }
function Write-Ok    { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Warn  { param($msg) Write-Host "⚠️  $msg" -ForegroundColor Yellow }

Clear-Host
Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   RenderLock Provider Agent  v1.0            ║" -ForegroundColor Cyan
Write-Host "║   Decentralized GPU Compute · Avalanche       ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── 1. Check Docker ──────────────────────────────────────────────
Write-Step "Checking Docker..."
try {
    $dockerVer = docker --version 2>&1
    Write-Ok "Docker found: $dockerVer"
} catch {
    Write-Warn "Docker Desktop not found."
    Write-Host "   Please install Docker Desktop from https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    Write-Host "   Then re-run this script." -ForegroundColor Yellow
    Start-Process "https://www.docker.com/products/docker-desktop/"
    Exit 1
}

# ── 2. Check / Install cloudflared ───────────────────────────────
Write-Step "Checking Cloudflare Tunnel..."
$cfPath = "C:\Windows\System32\cloudflared.exe"
if (-Not (Test-Path $cfPath)) {
    Write-Warn "cloudflared not found. Downloading..."
    $cfUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
    Invoke-WebRequest -Uri $cfUrl -OutFile $cfPath -UseBasicParsing
    Write-Ok "cloudflared installed to $cfPath"
} else {
    Write-Ok "cloudflared found"
}

# ── 3. Stop existing containers ──────────────────────────────────
Write-Step "Cleaning up previous sessions..."
try { docker stop renderlock-workspace 2>&1 | Out-Null } catch { }
try { docker rm   renderlock-workspace 2>&1 | Out-Null } catch { }
# Kill old tunnel processes
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force
Write-Ok "Clean slate ready"

# ── 4. Build workspace image ─────────────────────────────────────
Write-Step "Building workspace container image..."
$scriptDir = $PSScriptRoot
docker build -t renderlock-workspace:latest $scriptDir -q
Write-Ok "Image built"

# ── 5. Start workspace container ─────────────────────────────────
Write-Step "Starting web terminal container (port 7681)..."
docker run -d `
    --name renderlock-workspace `
    --restart unless-stopped `
    -p 7681:7681 `
    renderlock-workspace:latest | Out-Null
Write-Ok "Workspace container running"
Start-Sleep -Seconds 2

# ── 6. Start Cloudflare Quick Tunnel ────────────────────────────
Write-Step "Opening Cloudflare Quick Tunnel..."
Write-Host "   (no Cloudflare account required)" -ForegroundColor Gray

$tunnelLog = [System.IO.Path]::GetTempFileName()
$cfProcess = Start-Process -FilePath $cfPath `
    -ArgumentList "tunnel --url http://localhost:7681 --no-autoupdate" `
    -RedirectStandardOutput $tunnelLog `
    -RedirectStandardError $tunnelLog `
    -WindowStyle Hidden -PassThru

# Wait for URL (up to 30 seconds)
Write-Host "   Waiting for tunnel URL" -NoNewline -ForegroundColor Gray
$tunnelUrl = ""
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    Write-Host "." -NoNewline -ForegroundColor Gray
    $logContent = Get-Content $tunnelLog -Raw -ErrorAction SilentlyContinue
    if ($logContent -match 'https://([a-z0-9-]+\.trycloudflare\.com)') {
        $tunnelUrl = $Matches[0]
        break
    }
}
Write-Host ""

if (-Not $tunnelUrl) {
    Write-Warn "Could not auto-detect URL. Check $tunnelLog manually."
    $tunnelUrl = "(check log file: $tunnelLog)"
}

# Save session info
$sessionFile = "$env:USERPROFILE\.renderlock_session.txt"
@"
TUNNEL_URL=$tunnelUrl
CF_PID=$($cfProcess.Id)
STARTED=$(Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")
"@ | Set-Content $sessionFile

# ── 7. Print results ─────────────────────────────────────────────
Write-Host ""
Write-Host "════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "  ✅  RenderLock Provider Agent is LIVE!         " -ForegroundColor Green
Write-Host "════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "  🌐  Tunnel URL:  " -NoNewline; Write-Host $tunnelUrl -ForegroundColor Cyan
Write-Host "  👤  Username:    renter"
Write-Host "  🔑  Password:    RenderLock2026!"
Write-Host ""
Write-Host "  📋  COPY THIS URL into the RenderLock listing form:" -ForegroundColor Yellow
Write-Host "      $tunnelUrl" -ForegroundColor White
Write-Host ""
Write-Host "  💡  To stop:  docker stop renderlock-workspace" -ForegroundColor Gray
Write-Host "  💡  Session:  $sessionFile" -ForegroundColor Gray
Write-Host "════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""

# Copy URL to clipboard
$tunnelUrl | Set-Clipboard
Write-Host "  📎  URL copied to clipboard!" -ForegroundColor Green
Write-Host ""
