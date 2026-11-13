# RKdash — Google Apps Script (GAS) Applications & Subdomains Hub

A modern, high-performance, responsive web portal and application dashboard designed for hosting, launching, and managing **Google Apps Script (GAS) Web Applications**, webhooks, subdomains, and external portal links.

Designed with the exact modern aesthetic, viewport optimization, and administrative capabilities of enterprise portals: clean categorization, real-time search, deployment stage indicators (**Live**, **In Testing**, and **Restricted**), and a full-featured **Admin Console** for link updates, order management, and JSON backup/restore.

---

## 🌟 Key Features

1. **Enterprise RKdash Branding**:
   - Sleek, modern tech aesthetic built with Tailwind CSS, Plus Jakarta Sans, and JetBrains Mono.
   - Designed specifically for **Google Apps Script** workflows, external portals, and internal subdomains.
   - Clean slate, indigo, sky, and emerald security accents with ambient background gradients.

2. **No Long Scroll (Compact Viewport Optimization)**:
   - Carefully structured 4-column responsive grid with compact, elegant cards.
   - Subheader controls with quick filters: **All Applications**, **Live**, **In Testing**, and **Restricted**.
   - Category filtering and real-time search across titles, descriptions, subdomains, and URLs.

3. **Deployment Stage Indicators & Access Security**:
   - **`● Live`**: Highlights verified production-ready services with green pulsing indicator.
   - **`◐ In Testing`**: Clearly marks pilot, trial, or beta stage applications with an amber indicator.
   - **`🔒 Restricted`**: Marks confidential, administrative, or vigilance portals with purple lock badge. **Requires the Administrator Passcode to unlock and launch the target URL**.

4. **Integrated RKdash Admin Console**:
   - **Passcode Protected**: Secure admin modal with default passcode (`admin123`) and a **Quick Demo** button for rapid inspection.
   - **Update Target URL & Subdomain**: Point cards to any GAS Exec URL (`https://script.google.com/macros/s/.../exec`), subdomain, or external link with an in-modal **Test URL** button.
   - **Update Title & One-Sentence Description**: Keep metadata concise and readable.
   - **Display Order Management**: Set custom numeric priorities or use the **`▲ Move Up` / `▼ Move Down`** buttons.
   - **Tri-State Stage Toggle**: Cycle an application between *Live*, *Testing*, and *Restricted* with a single click.
   - **Add / Remove Applications**: Dynamically register new GAS tools or remove obsolete ones.
   - **JSON Backup & Restore**: One-click **Export JSON** and **Import JSON** to back up, restore, or migrate application catalogs.

5. **Client-Side Persistence & Portability**:
   - Changes made in the Admin Console save directly to browser `localStorage` under `rkdash_catalog_v1`.
   - 100% standalone — can run directly by opening `index.html` in any modern web browser or served via internal intranet.
   - Includes optional **`Code.gs`** script to deploy directly within Google Apps Script as a native cloud web app!

---

## 🚀 Quick Start

### Method 1: Direct Browser Launch (Easiest)
1. Navigate to:
   ```
   C:\Users\Director\.gemini\antigravity\scratch\rkdash\
   ```
2. Double-click **`index.html`** to open it in Chrome, Edge, Brave, or any modern browser.

### Method 2: Local HTTP Server (PowerShell)
Right-click on **`start-server.ps1`** and choose **Run with PowerShell**, or open PowerShell in the directory and run:
```powershell
powershell -ExecutionPolicy Bypass -File .\start-server.ps1
```
This serves the application on `http://localhost:8080/` and automatically opens your browser.

### Method 3: Deploy Directly to Google Apps Script (Cloud)
1. Visit [script.google.com](https://script.google.com) and create a new project named **RKdash**.
2. Paste the contents of `Code.gs` into the script editor.
3. Create an HTML file named `index.html` and paste the contents of `index.html`.
4. Click **Deploy > New deployment > Web app**:
   - Execute as: *Me*
   - Who has access: *Anyone with Google Account* (or *Anyone*)
5. Your RKdash portal will run on Google's cloud infrastructure at zero cost!

---

## 🔐 Security & Access Management

### Launching a Restricted Application:
1. When a user clicks **`🔒 Unlock`** on any Restricted application card:
2. The portal presents a security authentication dialog requesting the administrator passcode.
3. Once verified (`admin123`), the browser automatically opens the target application URL in a secure new tab.
4. If an administrator is already logged into the Admin Console within the current session, access is granted automatically without re-prompting.

### Accessing the Admin Console:
1. Click the **`Admin Console`** button in the top right of the header.
2. Enter the administrator passcode:
   - **Default Passcode**: `admin123`
   - *(A **Quick Demo** button is also available for rapid inspection).*
3. In the Admin Console:
   - Use the **Application Registry** table to re-order apps (`▲` / `▼`), cycle deployment stages (Live / Testing / Restricted), edit details, or delete entries.
   - Click **`+ Add New Application`** or **`Edit`** to update titles, subdomains, descriptions, target URLs, and icons.
   - Use **`Export JSON`** to generate a timestamped catalog file for backup or deployment.

---

## 📁 Project Structure

```
rkdash/
├── index.html         # Main standalone SPA web application with embedded UI & Admin Console (React 18)
├── apps-data.json     # Pre-configured baseline Google Apps Script applications catalog
├── start-server.ps1   # Zero-dependency PowerShell HTTP server script (auto-launches on localhost:8080)
├── Code.gs            # Ready-to-paste Google Apps Script backend for native cloud deployment
└── README.md          # Documentation & operational guide
```
