# Frontend ↔ Backend Connection Guide
### Invoice Tracker — React + Express + MongoDB Atlas

---

## PART 1 — Current State Analysis

### What Your Stack Looks Like Right Now

| Layer | Technology | Status |
|---|---|---|
| Frontend Framework | React 18 (Create React App) | ✅ Running |
| HTTP Client | Axios (`src/utils/api.js`) | ✅ Configured |
| Auth State | React Context (`AuthContext.js`) | ✅ Wired |
| Register Form | `src/pages/Auth/Register.js` | ✅ Built |
| Login Form | `src/pages/Auth/Login.js` | ✅ Built |
| Backend | Node.js + Express (`backend/server.js`) | ✅ Running on port 5000 |
| Auth Route | `POST /api/auth/register` | ✅ Exists |
| Database | MongoDB Atlas | ✅ Connected (after Phase 5 of Atlas guide) |

---

### What Is Already Correct ✅

**1. The API URL is correctly configured**
- Frontend `.env` file says: `REACT_APP_API_URL=http://localhost:5000/api`
- `src/utils/api.js` reads this and sets it as the axios `baseURL`
- All API calls will hit `http://localhost:5000/api/...`

**2. The register API call is fully wired**
- `AuthContext.js` calls `authAPI.register(userData)` → `api.js` sends `POST /auth/register`
- `Register.js` calls `registerUser(...)` from `useAuth()` → which is `AuthContext.register`
- The chain is complete: Form → AuthContext → api.js → Backend

**3. The payload shape is correct**
- Register.js builds the `businessInfo` object properly and passes it nested
- Backend `auth.js` destructures `{ name, email, password, userType, businessInfo }` from `req.body`
- Field names match exactly

**4. CORS is configured on the backend**
- `server.js` allows `http://localhost:3000` (default CRA dev port) via `FRONTEND_ORIGIN` env var
- `express.json()` middleware is present — backend can parse JSON body

**5. Token handling is correct**
- On successful register, backend returns `{ token, user }`
- `AuthContext` saves both to `localStorage` and sets React state
- Axios request interceptor automatically attaches the token on future requests

---

### What Is Missing / Needs Attention ⚠️

**Issue 1 — Both servers must be running at the same time**
- The backend (`npm run dev` in `backend/`) serves the API on port 5000
- The frontend (`npm start` in root `/`) serves React on port 3000
- If either is not running, the connection will fail

**Issue 2 — The `businessName` field is required but easy to miss**
- Backend enforces: if `userType === 'business'`, then `businessInfo.businessName` MUST be provided
- The form has the Company Name field — it is required (`required: 'Company name is required'`)
- This is correct, but if a user skips it, the backend will return 400 with:
  `"Company name is required for business signup"`

**Issue 3 — Password minimum length mismatch (minor)**
- Frontend `Register.js` requires password `minLength: 8`
- Backend `auth.js` validates `isLength({ min: 6 })`
- This is NOT a bug — frontend is stricter, which is fine. Just know that passwords 6-7 chars will fail frontend validation but would pass backend validation.

**Issue 4 — `confirmPassword` is NOT sent to the backend**
- Register.js builds the payload and sends `{ ...data, userType, businessInfo }`
- `data` includes `confirmPassword` from the form
- The backend ignores unknown fields, so this is harmless — but it's sent unnecessarily

---

### No Mismatches Found ✅

| Backend expects | Frontend sends | Match? |
|---|---|---|
| `name` | `data.name` | ✅ |
| `email` | `data.email` | ✅ |
| `password` | `data.password` | ✅ |
| `userType` | hardcoded `'business'` | ✅ |
| `businessInfo.businessName` | `data.businessName` nested into `businessInfo` | ✅ |
| `businessInfo.businessEmail` | `data.businessEmail` or falls back to `data.email` | ✅ |
| `businessInfo.businessPhone` | `data.businessPhone` | ✅ |
| `businessInfo.taxId` | `data.taxId` | ✅ |
| `businessInfo.website` | `data.website` | ✅ |
| `businessInfo.businessAddress.street` | `data.businessStreet` | ✅ |
| `businessInfo.businessAddress.city` | `data.businessCity` | ✅ |
| `businessInfo.businessAddress.state` | `data.businessState` | ✅ |
| `businessInfo.businessAddress.zipCode` | `data.businessZip` | ✅ |
| `businessInfo.businessAddress.country` | `data.businessCountry` | ✅ |

---

## PART 2 — Exact Fixes Required

**No code changes are required.** Your frontend and backend are already correctly connected.

The only thing you need to do is make sure both servers are running at the same time and MongoDB Atlas is connected. Those are runtime requirements, not code bugs.

---

## PART 3 — Step-by-Step: Register a User Right Now

### Step 1 — Confirm MongoDB Atlas is connected

Open your terminal where `npm run dev` is running inside `backend/`.
You should see these two lines printed when the server started:
```
Server running on port 5000
MongoDB connected successfully
```

If you see `MongoDB connection error` instead → your `MONGODB_URI` in `backend/.env` is wrong.
Fix it by following the `MONGODB_ATLAS_SETUP_GUIDE.md` in the `docs/` folder.

---

### Step 2 — Start the backend server (if not already running)

Open Terminal 1:
```bash
cd z:\Projects\Working\Invoice\backend
npm run dev
```

Wait until you see:
```
Server running on port 5000
MongoDB connected successfully
```

---

### Step 3 — Start the React frontend

Open Terminal 2 (a NEW terminal window):
```bash
cd z:\Projects\Working\Invoice
npm start
```

Wait until your browser opens at: `http://localhost:3000`

---

### Step 4 — Open the Register page

1. In the browser, go to: `http://localhost:3000/register`
2. You should see the "Create Account" form

---

### Step 5 — Fill in the form

Fill every field carefully:

| Field | Example Value | Notes |
|---|---|---|
| Full Name | `John Business` | Required |
| Email | `john@mybusiness.com` | Must be unique in DB |
| Password | `Pass1234` | Must be 8+ chars with letters AND numbers |
| Confirm Password | `Pass1234` | Must match Password |
| Company Name | `My Business Pvt Ltd` | **Required** — backend will reject if empty |
| Business Email | `billing@mybusiness.com` | Optional |
| Business Phone | `9876543210` | Optional, must be 10 digits |
| GSTIN / Tax ID | `27ABCDE1234F1Z5` | Optional, must be exactly 15 alphanumeric chars |
| Website | `https://mybusiness.com` | Optional |
| Street | `123 Main Street` | Optional |
| City | `Mumbai` | Optional |
| State | `Maharashtra` | Optional |
| PIN / ZIP | `400001` | Optional, digits only |
| Country | `India` | Pre-filled |

---

### Step 6 — Click "Create Account"

1. Click the blue **"Create Account"** button
2. Watch for a green toast notification (top-right corner): **"Registration successful!"**
3. You will be automatically redirected to `/dashboard`

---

### Step 7 — Verify in MongoDB Atlas

1. Open your browser and go to: `https://cloud.mongodb.com`
2. Log in to your Atlas account
3. Click your cluster name (`InvoiceCluster` or `Cluster0`)
4. Click **"Browse Collections"**
5. Click the **`invoice-tracker`** database (left sidebar)
6. Click the **`users`** collection
7. You should see a new document with all the fields you entered

The document will look like this:
```json
{
  "_id": "...",
  "name": "John Business",
  "email": "john@mybusiness.com",
  "password": "$2a$12$...",
  "userType": "business",
  "businessInfo": {
    "businessName": "My Business Pvt Ltd",
    "businessEmail": "billing@mybusiness.com",
    "businessPhone": "9876543210",
    "businessAddress": {
      "street": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400001",
      "country": "India"
    }
  },
  "settings": { "currency": "INR", "timezone": "Asia/Kolkata", ... },
  "createdAt": "...",
  "updatedAt": "..."
}
```

> Note: The `password` field will appear as a hashed string (starting with `$2a$12$...`) — this is correct. Bcrypt hashes it automatically before saving.

---

## PART 4 — Final Working Code Reference

Your code is already correct. Here is the complete data flow for reference:

### The Exact JSON Sent to the Backend (POST /api/auth/register)

```json
{
  "name": "John Business",
  "email": "john@mybusiness.com",
  "password": "Pass1234",
  "confirmPassword": "Pass1234",
  "userType": "business",
  "businessInfo": {
    "businessName": "My Business Pvt Ltd",
    "businessEmail": "billing@mybusiness.com",
    "businessPhone": "9876543210",
    "taxId": "27ABCDE1234F1Z5",
    "website": "https://mybusiness.com",
    "businessAddress": {
      "street": "123 Main Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "zipCode": "400001",
      "country": "India"
    }
  }
}
```

### The Success Response from the Backend (HTTP 201)

```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "6630ab12cd34ef...",
    "name": "John Business",
    "email": "john@mybusiness.com",
    "userType": "business",
    "businessInfo": {
      "businessName": "My Business Pvt Ltd",
      ...
    }
  }
}
```

### The Error Responses to Know About

| Scenario | HTTP Status | Message |
|---|---|---|
| Email already registered | 400 | `"User already exists with this email"` |
| Company name missing | 400 | `"Company name is required for business signup"` |
| Invalid GSTIN format | 400 | `"GST / Tax ID must be 15 alphanumeric characters"` |
| GSTIN already in use | 400 | `"GST / Tax ID already in use by another account"` |
| Same company name exists | 400 | `"A business with the same name is already registered"` |
| Backend server is down | Network Error | Toast: `"Something went wrong!"` |

---

## PART 5 — Testing & Verification

### How to Test from the Browser (No Postman Needed)

#### Option A — Using the Register Form (Recommended)
Follow PART 3 Steps 4–7 above.

#### Option B — Using Browser DevTools to Watch the API Call

1. Open `http://localhost:3000/register`
2. Press **F12** to open DevTools
3. Click the **"Network"** tab
4. Fill in the form and click **"Create Account"**
5. In the Network tab, look for a request called **`register`**
6. Click on it and check:
   - **Status:** `201 Created` = success
   - **Payload tab:** shows the JSON body that was sent
   - **Response tab:** shows `{ message, token, user }`

#### What Each Result Means

| What you see | What it means |
|---|---|
| Green toast: "Registration successful!" | ✅ User created in MongoDB |
| Redirected to `/dashboard` | ✅ Token saved, user logged in |
| Red toast with a message | ❌ Backend rejected the request — read the message |
| Red toast: "Something went wrong!" | ❌ Backend server is not running |
| No reaction after clicking button | ❌ Frontend validation failed — check red text under fields |

### Where to Check in MongoDB Atlas

Path: **Atlas Dashboard → Your Cluster → Browse Collections → invoice-tracker → users**

After a successful registration, click the **Refresh** button in Atlas Collections view.
A new document will appear immediately.

---

## Quick Checklist Before Testing

- [ ] `backend/.env` has the Atlas `MONGODB_URI` (not localhost)
- [ ] Terminal 1: `cd backend && npm run dev` → shows "MongoDB connected successfully"
- [ ] Terminal 2: `cd ..` (root) → `npm start` → browser opens at `http://localhost:3000`
- [ ] Browser: go to `http://localhost:3000/register`
- [ ] Fill ALL required fields (especially Company Name)
- [ ] Password: minimum 8 characters with at least one letter and one number
- [ ] Click "Create Account" → green toast appears → redirected to dashboard
- [ ] Atlas: browse `users` collection → new document visible
