#!/bin/bash
# RenderLock Workspace - Web Terminal
# ttyd serves renter's shell on port 8080
exec ttyd -p 8080 -c renter:RenderLock2026! su - renter
