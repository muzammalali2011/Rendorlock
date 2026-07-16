FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive

# ── System tools + ttyd (web terminal) ──
RUN apt-get update && apt-get install -y \
    ttyd sudo curl wget git vim nano htop \
    python3 python3-pip build-essential unzip \
    && rm -rf /var/lib/apt/lists/*

# ── Create renter user ──
RUN useradd -m -s /bin/bash renter && \
    echo 'renter:RenderLock2026!' | chpasswd && \
    echo 'renter ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

# ── Welcome banner ──
RUN echo 'echo ""' >> /home/renter/.bashrc && \
    echo 'echo "╔══════════════════════════════════════╗"' >> /home/renter/.bashrc && \
    echo 'echo "║  RenderLock Cloud Workspace          ║"' >> /home/renter/.bashrc && \
    echo 'echo "║  Powered by Avalanche DePIN          ║"' >> /home/renter/.bashrc && \
    echo 'echo "╚══════════════════════════════════════╝"' >> /home/renter/.bashrc && \
    echo 'echo ""' >> /home/renter/.bashrc

WORKDIR /home/renter
USER renter

# ttyd serves a web terminal on port 7681
# --credential adds HTTP basic auth (user: renter, pass: RenderLock2026!)
EXPOSE 7681
CMD ["ttyd", "--port", "7681", "--credential", "renter:RenderLock2026!", "--title", "RenderLock Workspace", "bash"]
