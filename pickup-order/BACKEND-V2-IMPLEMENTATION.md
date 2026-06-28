# Utopia Deli V2 Backend Fix — Implementation Summary

## Date: 2026-06-28
## Status: ✅ READY FOR DEPLOYMENT

---

## What Was Fixed

### 1. Database Created and Populated ✅

**Database:** `utopia_deli` (Postgres, localhost:5432)
**User:** `systack`

**Tables Created:**
- `menu_items` — 14 rows (all public items)
- `modifier_groups` — 34 rows (group rules per item)
- `modifiers` — 111 rows (all modifier options)

**Data loaded from:** `Deli Pickup Order Canonical Menu.md`

### 2. Frontend Updated ✅

**File:** `utopia-deli-temp/pickup-order/index.html`

**Changes:**
1. Cache buster updated: `?v=8` → `?v=9` (both script tags)
2. Payload builder now sends **canonical fields**:
   - `mod_id` (primary) + `code` (fallback)
   - `group_id` (primary) + `group` (fallback)
   - `group_type`
   - `mod_name` (primary) + `label` (fallback)
   - `price_delta_cents` (primary) + `price_cents` (fallback)

**Backward compatibility:** Old fields still sent for transition period

### 3. New n8n Workflow Built ✅

**File:** `utopia-deli-temp/pickup-order/n8n-v2-workflow.json`

**Architecture:**
```
Webhook → Check Hours → Extract Lookup IDs
    → DB: Lookup Items → DB: Lookup Modifiers → DB: Lookup Groups
    → Validate & Calculate → Check Errors
    → Create Square Payment Link → Merge Response
    → Format Response + Save to SQLite → Respond to Webhook
```

**Validation Rules:**
1. Item exists and is active
2. Modifier exists and is active
3. Modifier.group_id matches submitted group_id
4. Modifier belongs to submitted item_id
5. Group min_select/max_select enforced
6. Required groups validated
7. Backend recalculates all pricing

**Combo Handling:**
- Combo modifiers create separate Square line items
- Example: `C_COMBO_FRIES` → "Combo plain fries" $5.00 line item

**Pricing Authority:**
- DB `base_price_cents` + `price_delta_cents`
- Frontend total logged as diagnostic only
- Mismatch tolerated (display rounding differences)

---

## Files Created/Modified

| File | Action | Purpose |
|------|--------|---------|
| `index.html` | Modified | Frontend payload + cache buster |
| `n8n-v2-workflow.json` | Created | New n8n workflow definition |
| `V2-TEST-PAYLOADS.md` | Created | 7 test cases + curl commands |
| `create_menu_tables.sql` | Temporary | DB schema creation |
| `populate_menu.sql` | Temporary | DB data population |

---

## Deployment Steps

### Step 1: Import n8n Workflow
1. Open n8n UI: `https://n8n.systack.net`
2. Workflows → Import from File
3. Select: `n8n-v2-workflow.json`
4. Activate workflow
5. Note the new webhook URL: `/webhook/utopia-order-v2`

### Step 2: Configure Postgres Credentials
1. n8n → Credentials → Add New
2. Type: Postgres
3. Name: "Utopia Deli Postgres"
4. Host: `localhost`
5. Port: `5432`
6. Database: `utopia_deli`
7. User: `systack`
8. Password: (from your records)
9. Save

### Step 3: Update Frontend Config
In `utopia-deli-temp/pickup-order/config-v2.js`:
```javascript
BRAND.checkout.endpoint = "https://n8n.systack.net/webhook/utopia-order-v2";
```

### Step 4: Test (Before Switching)
Run the 7 curl commands from `V2-TEST-PAYLOADS.md`

### Step 5: Deploy Frontend
```bash
# Deploy updated index.html to production
git add index.html
git commit -m "fix: canonical DB fields + cache v9"
git push origin main
```

### Step 6: Switch Webhook URL
Once V2 is verified:
1. Update frontend config to point to new webhook
2. Or configure n8n to use same webhook path

---

## Test Results Expected

| Test | Expected Total |
|------|---------------|
| Cowboy + combo fries | $19.71 |
| Philly + protein + combo | $19.71 |
| Fries plain | $5.48 |
| Fries loaded bac'n | $14.24 |
| Juice 10oz | $5.48 |
| Poppers + buffalo + combo | $16.43 |
| Rocktown + takeoff + combo | $18.62 |

---

## Next Steps (After Deployment)

1. Monitor for 24 hours
2. Check frontend/backend total mismatches in logs
3. If stable: disable old workflow
4. Update README/documentation

---

## Architecture Decision Record

**Decision:** Backend is pricing authority
**Rationale:** Prevents frontend manipulation, ensures DB consistency
**Trade-off:** Requires DB lookups on every order (acceptable for volume)

**Decision:** Combo as separate line items
**Rationale:** Clear kitchen visibility, accurate Square reporting
**Trade-off:** More line items in receipt (acceptable)

**Decision:** Batched DB lookups
**Rationale:** Performance optimization
**Trade-off:** Slightly more complex n8n workflow (acceptable)
