# RKdash — Enterprise Gateway & Applications Portal

A modern, high-performance, responsive web application gateway and services dashboard for **rkdash.in**.

Designed as a centralized, zero-trust gateway launchpad for internal tools, microservices, cloud consoles, webhooks, and executive dashboards. Built with React 18, Tailwind CSS, Plus Jakarta Sans, and client-side SHA-256 cryptographic security.

---

## 🌟 Key Features

1. **Enterprise Gateway Architecture**:
   - Centralized access point for all company subdomains, APIs, webhooks, and dashboards under `rkdash.in`.
   - Compact viewport optimization with 4-column responsive grid and instant telemetry.
   - Real-time search across titles, subdomains, endpoints, and tags (`Ctrl+K` / `⌘K`).

2. **Security & Zero-Trust Access Control**:
   - **Production (`● Live`)**: Highlights production services with real-time health indicator.
   - **Staging / Beta (`◐ Testing`)**: Clearly marks preview and pilot-stage services.
   - **Restricted (`🔒 Restricted`)**: High-security services requiring administrator authentication before launching.
   - **Brute-Force Lockout**: 5 failed password attempts triggers an automatic 30-second security cooldown.

3. **Production Administrator Console**:
   - **Credential Management**: Update administrator username and password with live validation.
   - **Password Recovery**: Dual recovery system using a **Master Recovery Key** or **Security Question & Answer**.
   - **Emergency Key Generator**: One-click generation of randomized 16-character Master Recovery Keys.
   - **Client-Side SHA-256 Cryptography**: Passwords and secrets are never stored in plaintext—only salted SHA-256 digests are stored locally.
   - **Active Session Sign Out**: Session persists across tab refreshes during your browser session and can be signed out at any time.

4. **Service Lifecycle & Registry**:
   - Dynamically register, edit, or remove services.
   - Priority re-ordering (`▲` / `▼`) and one-click stage cycling.
   - Card gradient themes and SVG icon selections.
   - Integrated endpoint tester (`Test Endpoint`).

5. **Backup, Migration & Portability**:
   - **Export JSON**: Download a complete timestamped backup of your service catalog.
   - **Import JSON**: Restore or migrate services across environments.
   - **Factory Reset**: Revert back to the baseline catalog with 1 click.

---

## 🔐 Default Credentials (Initial Setup)

On first run, the gateway initializes with these default credentials:

* **Username**: `admin`
* **Default Password**: `admin`
* **Default Master Recovery Key**: `RKDASH-RECOVER-2026-KEY`
* **Default Security Question**: *"What is your primary gateway domain?"* &rarr; **Answer**: `rkdash.in`

> [!IMPORTANT]
> Immediately upon logging in, open **Admin Console &rarr; Admin & Security** to set your personal password and copy or generate your personal Master Recovery Key.

---

## 🚀 How to Deploy Updates to GitHub Pages (`rkdash.in`)

Because your domain `rkdash.in` is already hooked up to your GitHub repository and GitHub Pages, updating your live website takes less than 1 minute:

### Option A: Upload via GitHub Web (Easiest)
1. Go to your repository on [github.com](https://github.com/) (e.g. `github.com/<your-username>/rkdash`).
2. Click **Add file &rarr; Upload files**.
3. Drag and drop the updated files from your desktop folder:
   - `index.html`
   - `apps-data.json`
   - `README.md`
4. Enter commit message: `Update: Enterprise gateway with auth and password recovery`.
5. Click **Commit changes**.
6. GitHub Pages will build and deploy the update automatically within 30–60 seconds!

---

## 📁 Repository Structure

```
rkdash/
├── index.html         # Standalone SPA gateway portal with embedded auth & admin console (React 18)
├── apps-data.json     # Baseline enterprise service catalog
├── CNAME              # Custom domain configuration for GitHub Pages (rkdash.in)
├── start-server.ps1   # Local PowerShell HTTP testing server
└── README.md          # Gateway operational documentation & security guide
```
