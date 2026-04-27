# Product Stock Fix — Complete Analysis & Guide
### Invoice Tracker — React + Express + MongoDB Atlas

---

## PART 1 — Analysis

### 1. Product Schema (`backend/models/Product.js`)

The schema has this field:

```js
quantity: { type: Number, default: 0, min: 0 }
```

**Key facts:**
- The field is called `quantity` (not `stock`)
- It defaults to `0` if not provided
- It accepts whole numbers >= 0
- It is already defined — no schema changes needed

### 2. Product Create Route (`backend/routes/products.js`)

```js
body('quantity').optional().isInt({ min: 0 }).withMessage('Quantity must be an integer >= 0'),
...
const product = await Product.create({ userId: req.user.id, ...req.body });
```

**Key facts:**
- The backend already accepts `quantity` as an optional field
- It uses `...req.body` to spread all fields directly into the document
- If `quantity` is sent → it is saved. If not sent → default 0 is used.
- **No backend changes are needed**

### 3. Frontend Form — What Was Missing (`src/pages/Settings/ProductsPage.js`)

The form state before the fix:
```js
{ id: null, name: '', sku: '', rate: 0, taxRate: 0, unit: 'unit', description: '' }
//                                                   ↑ quantity was ABSENT
```

The payload sent to the API before the fix:
```js
const payload = { name, sku, description, rate, taxRate, unit };
// quantity was NEVER included → backend got nothing → default 0 was used
```

There was also no input field in the UI for the user to enter stock.

---

## PART 2 — Root Cause

**Why stock showed as 0:**

When you created a product from the frontend, the `quantity` field was never sent in the API request. The backend received this:

```json
{ "name": "Pen", "rate": 10, "taxRate": 5, "unit": "pcs" }
```

Since `quantity` was not in the payload, Mongoose used the schema default: `0`.

So MongoDB stored `quantity: 0` — not because the backend is wrong, but because the frontend never sent a value.

**This was a frontend-only issue.** The backend schema, route, and MongoDB connection were all correct.

---

## PART 3 — Main Question: Will Stock Save Automatically After the Fix?

### ✅ YES — Automatically, No Extra Work Needed

Here is exactly why:

**Step 1 — Frontend now sends `quantity`:**
```js
const payload = { name, sku, description, rate, taxRate, quantity: 10, unit };
```

**Step 2 — Backend receives it and spreads it:**
```js
const product = await Product.create({ userId: req.user.id, ...req.body });
// This becomes:
// Product.create({ userId: "...", name: "Pen", rate: 10, quantity: 10, ... })
```

**Step 3 — Mongoose validates it against the schema:**
```js
quantity: { type: Number, default: 0, min: 0 }
// 10 is a valid Number >= 0 → passes validation
```

**Step 4 — MongoDB Atlas stores it:**
```json
{ "name": "Pen", "rate": 10, "quantity": 10, ... }
```

**Why this is automatic:** MongoDB is schema-less by nature. As long as Mongoose validates the value and the `Product.create()` call includes the field, it is stored in Atlas with zero additional configuration. You do not need to migrate old data, create indexes, or run any commands.

---

## PART 4 — Fix Implementation (Already Applied)

All changes were made to `src/pages/Settings/ProductsPage.js`. Here is a summary of every change:

### Change 1 — Form state now includes `quantity`

```js
// BEFORE
useState({ id: null, name: '', sku: '', rate: 0, taxRate: 0, unit: 'unit', description: '' })

// AFTER
useState({ id: null, name: '', sku: '', rate: 0, taxRate: 0, quantity: 0, unit: 'unit', description: '' })
```

### Change 2 — Quantity validation in `save()`

```js
const qtyNum = Number(form.quantity);
if (!Number.isInteger(qtyNum) || qtyNum < 0) {
  setQtyError('Quantity must be a whole number >= 0');
  setSaving(false);
  return;
}
```

### Change 3 — `quantity` is now included in the payload

```js
// BEFORE
const payload = { name, sku, description, rate: rateNum, taxRate: taxNum, unit };

// AFTER
const payload = { name, sku, description, rate: rateNum, taxRate: taxNum, quantity: qtyNum, unit };
```

### Change 4 — Edit existing product now populates `quantity`

```js
// BEFORE
setForm({ id: p._id, name: p.name, ..., unit: p.unit || 'unit' })

// AFTER
setForm({ id: p._id, name: p.name, ..., quantity: p.quantity ?? 0, unit: p.unit || 'unit' })
```

### Change 5 — Stock Qty input field added to UI

A new input field appears in the form between "Tax %" and "Unit":
```jsx
<input
  placeholder="Stock Qty"
  inputMode="numeric"
  value={form.quantity}
  onChange={...filters non-digits...}
/>
```

### Change 6 — Table now shows a "Stock" column

```jsx
// Table header
<th className="py-2">Stock</th>

// Table row
<td className="py-2">{p.quantity ?? 0}</td>
```

### No backend changes required
- Schema already has `quantity: { type: Number, default: 0 }`
- Route already accepts `quantity` as optional
- Route already uses `...req.body` so any field sent is saved

---

## PART 5 — Verification

### Step 1 — Test in the browser

1. Make sure both servers are running:
   - Terminal 1: `cd backend && npm run dev`
   - Terminal 2 (root): `npm start`
2. Go to `http://localhost:3000/settings/products`
3. You will now see a new **"Stock Qty"** input between Tax % and Unit
4. Fill in: Name = `Test Product`, Rate = `100`, Stock Qty = `25`, Unit = `pcs`
5. Click **"Add"**
6. The table below will immediately update and show `25` in the **Stock** column

### Step 2 — Verify in MongoDB Atlas

1. Go to `https://cloud.mongodb.com`
2. Click your cluster → **"Browse Collections"**
3. Click the `invoice-tracker` database → click `products` collection
4. Click **Refresh** (if needed)
5. Find the product you just created

The document should look like this:
```json
{
  "_id": "...",
  "userId": "...",
  "name": "Test Product",
  "rate": 100,
  "taxRate": 0,
  "quantity": 25,
  "unit": "pcs",
  "sku": null,
  "description": "",
  "active": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

**Success criteria:** `"quantity": 25` appears in the document (not `0`).

### What About Old Products?

Products you created before this fix will still have `quantity: 0` in Atlas — because that's what was stored when you created them. To update them:
1. Go to `http://localhost:3000/settings/products`
2. Click the **Edit (pencil)** button on an old product
3. The form will open — type the correct stock number in "Stock Qty"
4. Click **"Update"**
5. The `quantity` field in Atlas will be updated immediately

---

## Summary Table

| Layer | Had `quantity`? | Action Taken |
|---|---|---|
| MongoDB Atlas | ✅ Always stored it | No change needed |
| Mongoose schema (`Product.js`) | ✅ `quantity: { default: 0 }` | No change needed |
| Express route (`products.js`) | ✅ Accepts it via `...req.body` | No change needed |
| API utility (`api.js`) | ✅ Passes body as-is | No change needed |
| Form state (`ProductsPage.js`) | ❌ Was missing | ✅ Fixed — `quantity: 0` added |
| API payload (`ProductsPage.js`) | ❌ Was not sent | ✅ Fixed — `quantity: qtyNum` added |
| Edit handler (`ProductsPage.js`) | ❌ Was missing | ✅ Fixed — `quantity: p.quantity ?? 0` added |
| UI input field (`ProductsPage.js`) | ❌ No input existed | ✅ Fixed — "Stock Qty" input added |
| Table column (`ProductsPage.js`) | ❌ Not displayed | ✅ Fixed — "Stock" column added |
