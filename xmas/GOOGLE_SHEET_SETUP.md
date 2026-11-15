# 📊 Google Sheets Cloud Database Setup & Wishlist Sync

Your Google Sheet is already connected to the app at:
👉 **`https://script.google.com/macros/s/AKfycbxjbZpuBkodzz2MudPoO87n1Qn__8RulIK3qUJBUgAl-uLndvjp6DDREhBKxZjxWAW08w/exec`**

---

### 🎁 How the Wishlist Feature Works
1. **Adding Wishes (Up to 5 items)**:
   - When any friend enters their private 4-digit passkey, they can click the **"📝 My Wishlist"** tab in the modal.
   - They can add up to **5 gift ideas** (with delete and save buttons).
   - Once saved, their wishlist is stored in **Column G** of your Google Sheet!

2. **Revealing Friends' Wishlist**:
   - Once a friend scratches and reveals their secret friend, that friend's 5 wishlist items are shown right below their name!
   - This helps every Secret Santa know exactly what gift their friend wants.

3. **Admin Wishlist Overview**:
   - In the **Admin Panel**, a new **"🎁 Wishlists"** tab displays all 13 participants and their listed gift ideas in one place.

4. **Next Year Reset**:
   - When the Admin clicks **"⚠️ Reset Allotment"** for next year, all allotments, secret keys, scratch statuses, and wishlists are wiped clean so the group can start completely fresh!

---

### ⚡ Updating Your Apps Script in Google Sheets (1 Minute)

To ensure your Google Sheet supports **Column G (Wishlists)**:

1. Open your Google Sheet: **`Xmas Friend Finder 2026`**.
2. Click **Extensions** → **Apps Script**.
3. Replace all the code inside `Code.gs` with the updated code from [google-apps-script.js](file:///C:/Users/rajuv/.gemini/antigravity/scratch/xmas/google-apps-script.js).
4. Click the **💾 Save** icon (`Ctrl + S`).
5. At the top right, click **Deploy** → **Manage deployments**.
6. Click the pencil icon ✏️ (Edit) next to your Active deployment.
7. Under **Version**, select **New version**.
8. Click **Deploy** and **Done**.

Your Google Sheet is now fully upgraded with 7 columns including **Wishlist (Max 5)**!
