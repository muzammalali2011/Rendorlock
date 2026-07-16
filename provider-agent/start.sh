#!/bin/bash
# ════════════════════════════════════════════════════════════════
#  RenderLock Provider Agent — One-Command Setup (Linux / macOS)
#  Usage: curl -sSL https://raw.githubusercontent.com/your-org/renderlock/main/provider-agent/start.sh | bash
#  Or locally: bash start.sh
# ════════════════════════════════════════════════════════════════
set -e

GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m'

banner() {
  echo ""
  echo -e "${CYAN}${BOLD}╔══════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}${BOLD}║   RenderLock Provider Agent  v1.0            ║${NC}"
  echo -e "${CYAN}${BOLD}║   Decentralized GPU Compute · Avalanche       ║${NC}"
  echo -e "${CYAN}${BOLD}╚══════════════════════════════════════════════╝${NC}"
  echo ""
}

step() { echo -e "${CYAN}▶${NC} ${BOLD}$1${NC}"; }
ok()   { echo -e "${GREEN}✅ $1${NC}"; }
warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
err()  { echo -e "${RED}❌ $1${NC}"; exit 1; }

banner

# ── 1. Check Docker ──────────────────────────────────────────────
step "Checking Docker installation..."
if ! command -v docker &>/dev/null; then
    warn "Docker not found. Installing..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker "$USER"
    ok "Docker installed"
else
    ok "Docker found: $(docker --version | cut -d' ' -f3 | tr -d ',')"
fi

# ── 2. Check cloudflared ─────────────────────────────────────────
step "Checking Cloudflare Tunnel (cloudflared)..."
if ! command -v cloudflared &>/dev/null; then
    warn "cloudflared not found. Installing..."
    ARCH=$(uname -m)
    if [[ "$ARCH" == "x86_64" ]]; then CF_ARCH="amd64"; elif [[ "$ARCH" == "aarch64" ]]; then CF_ARCH="arm64"; else CF_ARCH="amd64"; fi
    OS=$(uname -s | tr '[:upper:]' '[:lower:]')
    curl -L "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-${OS}-${CF_ARCH}" -o /tmp/cloudflared
    sudo install /tmp/cloudflared /usr/local/bin/cloudflared
    ok "cloudflared installed"
else
    ok "cloudflared found"
fi

# ── 3. Stop any existing RenderLock containers ───────────────────
step "Cleaning up previous sessions..."
docker stop renderlock-workspace 2>/dev/null && docker rm renderlock-workspace 2>/dev/null || true
pkill -f "cloudflared tunnel" 2>/dev/null || true
ok "Clean slate ready"

# ── 4. Build / pull workspace image ─────────────────────────────
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
step "Building workspace image..."
if [ -f "$SCRIPT_DIR/Dockerfile" ]; then
    docker build -t renderlock-workspace:latest "$SCRIPT_DIR" -q
    ok "Image built from local Dockerfile"
else
    # Pull pre-built image from registry (update this to your actual image)
    docker pull ghcr.io/renderlock/workspace:latest 2>/dev/null || \
    docker pull wettyoss/wetty:latest
    docker tag wettyoss/wetty:latest renderlock-workspace:latest
    ok "Image pulled"
fi

# ── 5. Start workspace container ────────────────────────────────
step "Starting workspace container (web terminal on port 7681)..."
docker run -d \
    --name renderlock-workspace \
    --restart unless-stopped \
    -p 7681:7681 \
    renderlock-workspace:latest
ok "Workspace container running"

# Give the container a moment to start
sleep 2

# ── 6. Start Cloudflare Quick Tunnel ────────────────────────────
step "Opening Cloudflare Quick Tunnel..."
echo "   (no account required — uses trycloudflare.com)"

# Quick tunnel writes URL to stderr — capture it
TUNNEL_LOG=$(mktemp)
cloudflared tunnel --url http://localhost:7681 --no-autoupdate > "$TUNNEL_LOG" 2>&1 &
CF_PID=$!

# Wait up to 30 seconds for the URL to appear
echo -n "   Waiting for tunnel URL"
TUNNEL_URL=""
for i in $(seq 1 30); do
    sleep 1
    echo -n "."
    TUNNEL_URL=$(grep -o 'https://[a-z0-9-]*\.trycloudflare\.com' "$TUNNEL_LOG" 2>/dev/null | head -1 || true)
    [ -n "$TUNNEL_URL" ] && break
done
echo ""

if [ -z "$TUNNEL_URL" ]; then
    warn "Could not auto-detect tunnel URL. Check $TUNNEL_LOG for the URL manually."
    TUNNEL_URL="(check $TUNNEL_LOG)"
fi

# Save session info
SESSION_FILE="$HOME/.renderlock_session"
cat > "$SESSION_FILE" <<EOF
TUNNEL_URL=$TUNNEL_URL
CF_PID=$CF_PID
STARTED=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
EOF

# ── 7. Print credentials ─────────────────────────────────────────
echo ""
echo -e "${GREEN}${BOLD}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  ✅  RenderLock Provider Agent is LIVE!         ${NC}"
echo -e "${GREEN}${BOLD}════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BOLD}  🌐  Tunnel URL:${NC}  ${CYAN}${TUNNEL_URL}${NC}"
echo -e "${BOLD}  👤  Username:  ${NC}  renter"
echo -e "${BOLD}  🔑  Password:  ${NC}  RenderLock2026!"
echo ""
echo -e "${YELLOW}  📋  COPY THIS URL into the RenderLock listing form:${NC}"
echo -e "      ${BOLD}${TUNNEL_URL}${NC}"
echo ""
echo -e "  💡  To stop:   bash stop.sh   (or: docker stop renderlock-workspace)"
echo -e "  💡  Session:   $SESSION_FILE"
echo -e "${GREEN}${BOLD}════════════════════════════════════════════════${NC}"
echo ""
