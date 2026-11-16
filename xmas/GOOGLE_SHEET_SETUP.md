# 📊 Google Sheets Cloud Database Setup & Features

Your Google Sheet is already connected to the app at:
👉 **`https://script.google.com/macros/s/AKfycbxjbZpuBkodzz2MudPoO87n1Qn__8RulIK3qUJBUgAl-uLndvjp6DDREhBKxZjxWAW08w/exec`**

---

### 📦 Postal Address & 🎁 Wishlist Features
1. **Capturing Postal Address**:
   - Every participant can unlock their card and click **"📦 My Address"** to enter and save their postal shipping address (House/Flat No, Landmark, City, State, PIN code, Contact phone).
   - Saved addresses are automatically written to **Column H** in your Google Sheet!
2. **Confidential Reveal**:
   - Only the Secret Santa allotted to that member can view their postal address (and copy it with one click) to ship or courier gifts!
3. **Admin Overview**:
   - In the **Admin Panel**, the **"🎁 Wishes & Addresses"** tab lists all members, their wishlists, and their postal addresses with instant **"📋 Copy Address"** buttons.

---

### 🔄 Resetting for Next Year: Keeping Members, Addresses & Wishes
When the Admin clicks **"🔄 Reset / New Year Draw"**, a reset options modal appears:
* **Option 1 (Recommended): ⭐ Keep Members, Addresses & Wishes**
  - Resets all pairings and scratch statuses.
  - Automatically generates **brand new 4-digit secret keys** for all members.
  - **Preserves all member names, phone numbers, postal addresses, and wishlists!**
* **Option 2: 📝 Keep Members & Addresses (Clear Old Wishes)**
  - Preserves members and addresses, but clears old wishes so everyone can enter new gift ideas for the new year.
* **Option 3: ⚠️ Factory Reset**
  - Full wipe back to sample default data.

---

### ⚡ Updating Your Apps Script in Google Sheets (1 Minute)

To ensure your Google Sheet supports **Column H (Postal Address)** and smart annual resets:

1. Open your Google Sheet: **`Xmas Friend Finder 2026`**.
2. Click **Extensions** → **Apps Script**.
3. Replace all the code inside `Code.gs` with the updated code from [google-apps-script.js](file:///C:/Users/rajuv\.gemini\antigravity\scratch\xmas\google-apps-script.js).
4. Click the **💾 Save** icon (`Ctrl + S`).
5. At the top right, click **Deploy** → **Manage deployments**.
6. Click the pencil icon ✏️ (**Edit**) next to your active deployment.
7. Under **Version**, select **New version**.
8. Click **Deploy** and **Done**.

Your Google Sheet is now fully upgraded with 8 columns including **Column H: Postal Address**!
