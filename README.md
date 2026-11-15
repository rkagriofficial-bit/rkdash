# RKdash — Enterprise Gateway & Applications Portal

A modern, high-performance, responsive web application gateway and services dashboard for **rkdash.in**.

Designed as a centralized, zero-trust gateway launchpad for internal tools, microservices, cloud consoles, webhooks, and executive dashboards. Built with React 18, Tailwind CSS, Plus Jakarta Sans, client-side SHA-256 cryptographic security, and a **real-time Google Sheets cloud database backend**.

---

## 🌟 Key Features

1. **Centralized Google Sheets Cloud Database**:
   - **Persistent & Global**: All cards added, edited, reordered, or deleted in the Admin Console save live to a central Google Spreadsheet via Google Apps Script (`Code.gs`).
   - **Universal Visibility**: Every visitor, browser session, and device automatically loads the latest real-time catalog from your Google Sheet.
   - **Offline-Resilient**: Cached locally in browser `localStorage` for instant zero-latency loading, then seamlessly refreshes from the cloud in the background.

2. **Security & Zero-Trust Access Control**:
   - **Production (`● Live`)**: Highlights production services with real-time health indicator.
   - **Staging / Beta (`◐ Testing`)**: Clearly marks preview and pilot-stage services.
   - **Restricted (`🔒 Restricted`)**: High-security services requiring administrator authentication before launching.
   - **Brute-Force Lockout**: 5 failed password attempts triggers an automatic 30-second security cooldown.

3. **Production Administrator Console**:
   - **Database & Cloud Sync Tab**: Easily configure and test your Google Sheets Web App URL, with one-click **"Push All to Sheet"** and **"Pull Fresh from Sheet"** controls.
   - **Credential Management**: Update administrator username and password with live validation.
   - **Password Recovery**: Dual recovery system using a **Master Recovery Key** or **Security Question & Answer**.
   - **Emergency Key Generator**: One-click generation of randomized 16-character Master Recovery Keys.
   - **Client-Side SHA-256 Cryptography**: Passwords and secrets are never stored in plaintext—only salted SHA-256 digests are stored.

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

## ☁️ How to Set Up Your Google Sheets Database (2 Minutes)

1. Open **[sheets.new](https://sheets.new)** in your browser to create a new Google Spreadsheet.
   - Name it: **`RKdash Database`**
2. In Google Sheets, click: **Extensions &rarr; Apps Script**.
3. Delete any default code in `Code.gs` and paste the entire contents of **`Code.gs`** from this repository.
4. Click the blue **Deploy** button (top right) &rarr; **New deployment**:
   - Click the gear icon next to "Select type" &rarr; select **Web app**.
   - Description: `RKdash Gateway API`
   - Execute as: **Me**
   - Who has access: **Anyone** *(CRITICAL: Do not choose "Only myself" or "Anyone with Google account")*.
5. Click **Deploy**, review & authorize permissions when prompted.
6. Copy the resulting **Web app URL** (ends in `/exec`).
7. Open your RKdash portal (**https://rkdash.in**), log into the **Admin Console** &rarr; open **Cloud Database** tab, paste the Web app URL, and click **Save & Connect**!

---

## 🔐 Default Admin Credentials

On first run, the gateway initializes with these default credentials:

* **Username**: `admin`
* **Default Password**: `admin`
* **Default Master Recovery Key**: `RKDASH-RECOVER-2026-KEY`
* **Default Security Question**: *"What is your primary gateway domain?"* &rarr; **Answer**: `rkdash.in`

---

## 🚀 How to Deploy Updates to GitHub Pages (`rkdash.in`)

1. Open your repository on **[github.com](https://github.com/)**.
2. Click **Add file &rarr; Upload files**.
3. Drag and drop the updated files from your desktop folder:
   * `index.html`
   * `Code.gs`
   * `apps-data.json`
   * `README.md`
4. Enter commit message: `Add Google Sheets cloud database backend for multi-user sync`.
5. Click **Commit changes**.
6. GitHub Pages will update your live site at **`https://rkdash.in`** automatically within 30–60 seconds.
