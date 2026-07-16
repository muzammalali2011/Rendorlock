#!/bin/bash
# Stop script
pkill -f "cloudflared tunnel" 2>/dev/null || true
docker stop renderlock-workspace 2>/dev/null || true
docker rm renderlock-workspace 2>/dev/null || true
echo "✅ RenderLock Provider Agent stopped."
