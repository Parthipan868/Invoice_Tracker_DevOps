# MongoDB Atlas Setup & Connection Guide

This is a complete, click-by-click guide to creating a free cloud database on MongoDB Atlas and connecting it to the `invoice-tracker` backend.

> **Before you start:** Make sure your backend is working locally with `npm run dev` inside the `backend/` folder.

---

## Phase 1 — Create a MongoDB Atlas Account

### Step 1 — Open the MongoDB Atlas website

1. Open your browser (Chrome recommended).
2. Go to: `https://www.mongodb.com/atlas/database`
3. Click **"Try Free"** or **"Sign Up"** (top-right corner).

### Step 2 — Sign Up

1. Fill in: Email, First Name, Last Name, Password  
   **OR** click **"Sign up with Google"** for faster setup.
2. If asked about your goal → select **"Build a new application"**.
3. Check your inbox for a verification email from MongoDB → click **"Verify Email"**.

---

## Phase 2 — Create Your Free Cluster

### Step 3 — Deploy a new cluster

1. After logging in, you will land on the Atlas dashboard.
2. Click **"Build a Database"** (or **"+ Create"** if you already have clusters).
3. You will see three pricing tiers. **Select "M0"** (the FREE option).
4. Choose a **Cloud Provider & Region** closest to you:
   - Recommended: **AWS → Mumbai (ap-south-1)** for India
5. Name your cluster: `InvoiceCluster` (or leave the default `Cluster0`).
6. Click **"Create Deployment"** at the bottom.

---

## Phase 3 — Configure Security

*Atlas will take you to a "Security Quickstart" page automatically.*

### Step 4 — Create a Database User

1. Make sure **"Username and Password"** is selected as the auth method.
2. Enter a **Username** — example: `invoiceadmin`
3. Enter a **Password** — example: `Invoice@2024`  
   *(Write this down — you will need it in Step 9)*  
   Or click **"Autogenerate Secure Password"** and copy it.
4. Click **"Create User"**.

### Step 5 — Allow Network Access

1. Scroll down to **"Where would you like to connect from?"**
2. Select **"My Local Environment"**.
3. Click **"Add My Current IP Address"** — this adds your current IP.
4. To also allow Jenkins / CI/CD servers to connect:
   - Click **"Add a different IP address"**
   - Type: `0.0.0.0/0`
   - Description: `Allow all (CI/CD)`
   - Click **"Add IP Address"**

   > **Note:** `0.0.0.0/0` allows connections from any IP. This is fine for development and CI/CD. For production, restrict this to your server's specific IP later.

5. Click **"Finish and Close"** → then **"Go to Databases"**.

---

## Phase 4 — Get the Connection String

### Step 6 — Open the Connect dialog

1. On the **"Database Deployments"** page, wait until your cluster shows **"Active"** (may take 1–3 minutes).
2. Click the **"Connect"** button next to your cluster name.
3. In the popup, click **"Drivers"** (under "Connect to your application").
4. Driver: **Node.js** | Version: **5.5 or later**

### Step 7 — Copy the connection string

1. You will see a string like this:
   ```
   mongodb+srv://invoiceadmin:<password>@invoicecluster.abcde.mongodb.net/?retryWrites=true&w=majority&appName=InvoiceCluster
   ```
2. Click the **copy icon** next to it.

---

## Phase 5 — Update Your Backend

### Step 8 — Open the backend `.env` file

1. Open VS Code.
2. Open the file: `z:\Projects\Working\Invoice\backend\.env`

Your file currently looks like this:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/invoice-tracker
JWT_SECRET=dev_secret_key_123
FRONTEND_ORIGIN=http://localhost:3000
```

### Step 9 — Replace the MONGODB_URI

1. Delete the entire `MONGODB_URI=...` line.
2. Paste the connection string you copied in Step 7.
3. Do **two things** to the pasted string:

   **a) Replace `<password>` with your actual password** (remove the `<` and `>` brackets too):
   ```
   mongodb+srv://invoiceadmin:Invoice@2024@invoicecluster...
   ```

   **b) Add the database name** (`invoice-tracker`) right before the `?`:
   ```
   ...mongodb.net/invoice-tracker?retryWrites=true&w=majority...
   ```

4. Your final `backend/.env` should look like this:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://invoiceadmin:Invoice@2024@invoicecluster.abcde.mongodb.net/invoice-tracker?retryWrites=true&w=majority&appName=InvoiceCluster
   JWT_SECRET=dev_secret_key_123
   FRONTEND_ORIGIN=http://localhost:3000
   ```
   *(Replace `invoiceadmin`, `Invoice@2024`, and `invoicecluster.abcde` with your actual values)*

5. Press **Ctrl + S** to save.

---

## Phase 6 — Test the Connection

### Step 10 — Restart the backend server

1. Open the VS Code terminal (`Terminal → New Terminal`).
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```
3. If the server is already running, stop it: **Ctrl + C**
4. Start it again:
   ```bash
   npm run dev
   ```
5. You should see both of these lines in the terminal:
   ```
   Server running on port 5000
   MongoDB connected successfully
   ```

If you see `MongoDB connected successfully` → **you are done!** ✅

---

## Phase 7 — Verify Data in Atlas (Optional but Recommended)

### Step 11 — Check the database in Atlas UI

1. Go back to https://cloud.mongodb.com
2. Click **"Browse Collections"** on your cluster.
3. After you register/login on the app for the first time, you will see collections like `users`, `invoices`, `clients` appear here automatically.

---

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| `MongoServerSelectionError` | Your IP is not whitelisted | Go to Atlas → Network Access → Add `0.0.0.0/0` |
| `Authentication failed` | Wrong password in the URI | Double-check Step 9 — make sure `<password>` was fully replaced |
| `ENOTFOUND cluster0.xxx.mongodb.net` | Typo in connection string | Re-copy the string from Atlas and redo Step 9 |
| `bad auth: Authentication failed` | Wrong username | The username in the URI must match what you created in Step 4 |
| `URI malformed` | Special characters in password | Avoid `@`, `/`, `:` in your password, or use URL-encoding |
| Connection works but no data | Database name missing | Make sure `/invoice-tracker` is in the URI before the `?` |

---

## What Was Fixed in `server.js`

The connection code in `backend/server.js` has been updated. The old options (`useNewUrlParser`, `useUnifiedTopology`) were **deprecated in Mongoose 7** and caused console warnings. They have been removed.

**Before:**
```js
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/invoice-tracker', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
```

**After (current):**
```js
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/invoice-tracker')
```

This is cleaner and warning-free with Mongoose 7+.
