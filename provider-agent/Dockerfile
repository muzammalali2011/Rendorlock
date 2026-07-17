FROM ubuntu:22.04
ENV DEBIAN_FRONTEND=noninteractive

# Install dependencies
RUN apt-get update && apt-get install -y curl wget sudo

# Install Web Terminal (ttyd 1.7.3 - proven working version)
RUN wget -qO /usr/local/bin/ttyd \
    https://github.com/tsl0922/ttyd/releases/download/1.7.3/ttyd.x86_64 \
    && chmod +x /usr/local/bin/ttyd

# Create a secure renter profile
RUN useradd -m -s /bin/bash renter \
    && echo 'renter:RenderLock2026!' | chpasswd \
    && adduser renter sudo

# Copy startup script (COPY avoids echo \n corruption bug)
COPY start.sh /start.sh
RUN chmod +x /start.sh

CMD ["/start.sh"]
