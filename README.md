# KSEB Solar & Net-Metering Dashboard

A static web dashboard and monthly bill entry interface for tracking KSEB solar generation, Time-of-Day (ToD) imports, net exports, banked solar credits (including the annual May settlement reset), and monthly bills — designed to be hosted free on **GitHub Pages** with **Google Sheets** as the database.

## Features
- **Pre-loaded History**: Includes all 22 months (`Jan-25` to `Oct-26`) from your KSEB sheet out of the box.
- **Interactive Dashboard**:
  - KPI cards for Total Solar Generation, Net Export vs Import, Direct Solar Usage, Current Cumulative Credit, Total Bills Paid, and Average Export Efficiency.
  - 4 interactive Chart.js charts (Energy Balance, ToD Import Breakdown, Banked Credit & May Reset, Efficiency vs Bill Amount).
- **Smart Monthly Bill Entry**:
  - Enter only raw bill readings (`Normal`, `Off-Peak`, `Peak` imports, `Current Export`, `Solar Generation`, `Bill Amount`).
  - Auto-fills `Previous Export` from the last recorded month and auto-calculates `Net Import`, `Net Export`, `Direct Used`, `% Export Efficiency`, `% Direct Usage Efficiency`, `Monthly Credit`, and `Cumulative Credit`.
- **Google Sheets Database**: Syncs read/write via a free Google Apps Script Web App (`google-apps-script/Code.gs`).

## 1. Host on GitHub Pages
1. Create a new GitHub repository (e.g., `kseb-solar-dashboard`).
2. Push all files in this folder (`index.html`, `styles.css`, `data.js`, `app.js`, `README.md`, `google-apps-script/Code.gs`) to the `main` branch.
3. In your GitHub repo, go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to `Deploy from a branch`, select `main` and `/ (root)`, and click **Save**.
5. Your dashboard will be live at `https://<your-username>.github.io/kseb-solar-dashboard/`.

## 2. Connect Google Sheets as the Database (Private Setup)
1. Open [sheets.new](https://sheets.new) to create a new Google Sheet.
2. Go to **Extensions → Apps Script**.
3. Replace the default code with `google-apps-script/Code.gs`.
4. (Recommended for public hosting) Set `const WRITE_SECRET = 'your-secret-passphrase';` in `Code.gs` so only you can add/edit/delete records.
5. Click **Deploy → New deployment → Web app** (**Execute as**: `Me`, **Who has access**: `Anyone`), and copy the `/exec` URL.
6. Paste that URL into `config.js` (`SHEETS_WEB_APP_URL`) before pushing to GitHub. No setup UI or instructions are shown on the public website.
