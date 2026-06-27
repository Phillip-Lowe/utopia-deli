# Utopia Deli — Pickup Order System

**Last updated:** Sat Jun 27 17:29 CDT 2026
**Deployed at:** https://order.theutopiadeli.com
**GitHub:** https://github.com/Phillip-Lowe/utopia-deli

---

## Architecture

### Pricing Authority (Single Source of Truth)

> **"If backend calculates it, Square must NOT recalculate it"**

| Layer | Responsibility |
|-------|---------------|
| Frontend (`index.html`) | UI + selection + sends RAW data |
| Backend (n8n) | ALL calculations (single authority) |
| Square | Pass-through billing (final numbers only) |

### How It Works

1. **Frontend** sends:
   - `base_price_cents`: Item price only (no modifiers)
   - `modifiers`: Array with `price_cents` and `group`

2. **Backend (n8n)** calculates:
   - `unit_price_cents` = base + modifiers
   - `total_price_cents` = unit × qty
   - `subtotal_cents` = sum of all items
   - `tax_cents` = subtotal × 0.0952

3. **Square** receives:
   - Final `base_price_money` (includes modifiers)
   - Modifiers displayed with `$0` amount (prevents double-charge)

---

## Files

- `pickup-order/index.html` — Main frontend (ONLY active source of truth)
- `pickup-order/order-form.js` — Reference only (NOT loaded by HTML)
- `pickup-order/menu-data.js` — Menu items and prices

---

## Recent Fixes

### 2026-06-27 — Combo Pricing Fix
**Problem:** Double-charging combo modifiers in Square ($23 instead of $18)
**Root Cause:** Split pricing responsibility between frontend and backend
**Solution:** Centralize ALL pricing in backend n8n workflow

**Commits:**
- `fa45e9d` — Frontend sends raw base_price_cents + untouched modifiers
- `cf5c6be` — Confirmation page updates (message, pickup time, footer fix)
- `b9428f9` — Keep customer name on confirmation page

### 2026-06-27 — Confirmation Page Update
- "We've received your order." (was "We're firing up the kitchen")
- Pickup time: "25 - 30 mins" (was "ASAP")
- Footer positioned correctly

---

## Deployment

```bash
git add -A
git commit -m "description"
git push origin main
```

Wait 2-5 minutes for GitHub Pages to rebuild.

---

## Backend (n8n)

**Workflow:** `Utopia-Deli-Simple-Checkout-v4`
**Webhook:** `https://n8n.systack.net/webhook/utopia-deli-order-v4`
**Square Location:** `J4B6A3X6RYA63`

---

## Test Case

**Order:**
- Base: $10 sandwich
- Modifier: +$1.50
- Qty: 2

**Expected:**
```
(10 + 1.50) × 2 = 23.00 + tax
```

---

## Key Lesson

The #1 production-killing bug in custom ordering systems: **"shared pricing responsibility"**

Fix: Centralize ALL pricing in backend. Frontend = display only. Square = pass-through.
