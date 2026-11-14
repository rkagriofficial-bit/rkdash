# 🎄 Xmas Friend Finder (Secret Santa Scratch & Find) 🎁

A festive, interactive holiday gift exchange web application featuring a real-time **Scratch and Find** foil card mechanic, mathematically verified derangement (no self-assignments), WhatsApp number integration, individual secret passkeys, and an Admin dashboard to seal, finish, and reset allotments.

Built with **pure Vanilla HTML5, CSS3, and JavaScript** — zero build step, zero dependencies, and 100% compatible with **GitHub Pages in any subdirectory** (e.g. `https://<username>.github.io/<repo-name>/` or `https://<username>.github.io/<repo-name>/<subfolder>/`).

---

## ✨ Features & Upgrades

- 👥 **13+ Flexible Members**:
  - Configured with 13 members by default.
  - Dynamically add more members (`➕ Add Member`) or remove members (`🗑️`) right inside the Admin panel.
- 🛡️ **Admin Exclusivity (Organizer-Only Mode)**:
  - Toggle `[x] Exclude Admin from Draw (Organizer Only)`.
  - When checked, the Admin is strictly the organizer/moderator and does not participate in the gift exchange.
- 🪙 **Interactive "Scratch & Find"**:
  - Realistic metallic holiday foil card with canvas touch/mouse scratching physics.
  - **Foil Scratch Progress Meter (%)**: Tracks how much foil has been rubbed off. Once 40% is cleared, the card automatically finishes clearing with holiday chimes and confetti!
- 💬 **WhatsApp Number Integration**:
  - Enter WhatsApp numbers for each member (e.g. `+919876543210`).
  - Direct 1-click **"💬 WhatsApp"** button opens a direct chat with that person, containing their secret key and personal scratch link.
- 🎲 **Maximum Randomization & Fresh Keys per Allotment**:
  - Every time allotments are sealed, **all secret passkeys are regenerated fresh**.
  - Derangement uses a two-stage shuffle (Fisher-Yates + Sattolo's cycle) guaranteeing that nobody can ever draw themselves ($P[i] \neq i$).
- 🗝️ **Dynamic Unlock Actions ("Unlock & Scratch" vs "Unlock & View")**:
  - If a friend has not yet scratched their card: Prompt displays **"✨ Unlock & Scratch"**.
  - If a friend has already scratched and wants to view their friend again: Prompt displays **"✨ Unlock & View"**.
- 🏁 **Admin "Finish Game" Mode (No Key Needed)**:
  - Once the gift party is complete, Admin clicks **"🏁 Finish Game"**. Key requirements are immediately disabled so everyone can tap any card to view matches openly.
- 🔑 **Custom Admin PIN Facility**:
  - Easily update the Admin PIN in the **⚙️ PIN & Settings** tab. Default PIN: `1225`.

---

## 🚀 How to Host as a Subdirectory in GitHub

You can host this project on GitHub Pages in either of the following ways:

### Method A: As a Dedicated Repository (e.g., `https://<username>.github.io/xmas-friend-finder/`)

1. Create a new repository on GitHub named `xmas-friend-finder`.
2. In your terminal, navigate to this project folder:
   ```bash
   cd "C:\Users\rajuv\.gemini\antigravity\scratch\xmas-friend-finder"
   ```
3. Initialize git, commit the files, and push:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Xmas Friend Finder"
   git branch -M main
   git remote add origin https://github.com/<your-username>/xmas-friend-finder.git
   git push -u origin main
   ```
4. On GitHub, go to your repository **Settings** → **Pages**.
5. Under **Build and deployment** > **Branch**, select `main` and root `/`, then click **Save**.
6. Within 1–2 minutes, your site will be live at:
   `https://<your-username>.github.io/xmas-friend-finder/`

---

### Method B: As a Subdirectory inside an Existing Repository (e.g., `https://<username>.github.io/my-portfolio/xmas/`)

1. Copy the `xmas-friend-finder` folder (or its contents) into a subfolder of your existing repository, e.g. `my-repo/xmas/`.
2. Commit and push:
   ```bash
   git add xmas/
   git commit -m "Add Xmas Friend Finder in subfolder"
   git push
   ```
3. Because all script, style, and asset links in `index.html` use relative paths (`./style.css`, `./app.js`, `./confetti.js`), the application works out of the box at `https://<your-username>.github.io/my-repo/xmas/`!
