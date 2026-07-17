<div align="center">
  
# 🚀 RenderLock
**Decentralized GPU Compute Marketplace on Avalanche**

![RenderLock Banner](https://img.shields.io/badge/Status-Live-success?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Web3](https://img.shields.io/badge/Web3-AVAX-E84142?style=for-the-badge&logo=avalanche&logoColor=white)

</div>

RenderLock is a Web3-powered platform where anyone can rent out their unused computing power (GPUs/CPUs) to others, or rent affordable compute resources globally. Payments are handled securely using AVAX on the Avalanche blockchain.

🌐 **Live Marketplace:** [https://rendorlock.vercel.app](https://rendorlock.vercel.app)

---

## ✨ Key Features
- **Web3 Wallet Connect:** Integrated with Wagmi + RainbowKit for seamless wallet connections.
- **Decentralized Marketplace:** Renters and Providers connect directly in a trustless environment.
- **Single-Command Setup:** Providers can turn their PC into a cloud node with exactly 1 command.
- **Secure Web Terminal:** Renters get full bash access securely over HTTPS via Cloudflare Tunnels.
- **Zero Port Forwarding Required:** Works behind NATs and Firewalls automatically.

---

## 📁 Repository Structure

* **`/renderlock-frontend`** — The Next.js web application (Marketplace & Dashboard).
* **`/provider-agent`** — The Docker environment and background scripts that turn a user's machine into a rentable cloud node.

---

## 🖥️ How to Use: For Renters

1. Visit the live platform: [RenderLock](https://rendorlock.vercel.app).
2. Connect your Web3 Wallet (e.g., MetaMask).
3. Browse the marketplace for available compute nodes.
4. Rent a node using AVAX testnet funds.
5. Click the provided URL to instantly access your secure, web-based bash terminal.
    * **Username:** `renter`
    * **Password:** `RenderLock2026!`

---

## ⚡ How to Use: For Providers

If you have a Windows PC and want to list your machine's compute power on the marketplace, you can do it in seconds. 

Open **Windows PowerShell (as Administrator)** and paste this single command:

```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
irm https://raw.githubusercontent.com/muzammalali2011/Rendorlock/refs/heads/main/provider-agent/start.ps1 | iex
```

**What this command does automatically:**
1. Checks for Docker and downloads Cloudflare Tunnel if needed.
2. Pulls the RenderLock environment from GitHub.
3. Builds an isolated Docker workspace on your machine.
4. Generates a secure public URL (e.g., `https://random-words.trycloudflare.com`).
5. Copies the URL to your clipboard.

Paste this URL into the **"Provide Compute"** tab on the website to list your node! 
*(Note: Your PC must stay awake while a renter is connected).*

---

## ☁️ Option B: 24/7 Cloud Provider (Free)
If you want to list a permanent machine on the marketplace without keeping your laptop on, you can deploy the provider agent for free using Render.com:
1. Create a free account at [Render.com](https://render.com).
2. Create a new **Web Service** linked to your fork of this GitHub repository.
3. Set the **Root Directory** to `provider-agent`.
4. Set the Environment Variable: `PORT = 8080`.
5. Render will give you a permanent `https://your-node.onrender.com` URL to list on the marketplace!

---

## 🛠️ Technology Stack
- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Web3:** Viem, Wagmi, RainbowKit
- **Agent:** Docker, Windows PowerShell, Bash, `ttyd` (Web Terminal)
- **Networking:** Cloudflare Quick Tunnels

---

<div align="center">
  <i>Built for the Future of Decentralized Compute.</i>
</div>
