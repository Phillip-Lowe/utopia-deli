# Utopia Deli V2 Backend — ORACLE Fixes Applied

## Date: 2026-06-28 08:20 CDT
## Status: ✅ FIXED — Ready for deployment

---

## All ORACLE Issues Addressed

| # | Issue | Status | Fix Applied |
|---|-------|--------|-------------|
| 1 | Postgres query parameters missing | ✅ FIXED | Built array literals inline with proper escaping |
| 2 | DB row extraction incorrect | ✅ FIXED | Used `.all().forEach()` pattern, not `[0]?.json` |
| 3 | DB branches race condition | ✅ FIXED | Chained DB nodes: Items → Modifiers → Groups → Merge |
| 4 | Check Errors has no condition | ✅ FIXED | Condition: `{{ $json.ok === true }}` |
| 5 | Error path broken | ✅ FIXED | New `Format Error Response` + `Respond Error` nodes |
| 6 | Square response parsing wrong | ✅ FIXED | Properly extracts `payment_link.url` and `order_id` |
| 7 | Square modifier array invalid | ✅ FIXED | Bakes modifier names into line item name, no `modifiers` array |
| 8 | Combo subtotal excluded | ✅ FIXED | Adds `comboSubtotalCents` to subtotal before tax |
| 9 | Frontend mismatch wrong field | ✅ FIXED | Reads `body.totals?.subtotal_cents` |
| 10 | Check Hours uses server timezone | ✅ FIXED | Uses `America/Chicago` timezone explicitly |

---

## DB Verification Results

All 5 tests passed:

| Test | Result | Expected | Actual |
|------|--------|----------|--------|
| Cowboy + combo | ✅ PASS | $19.71 | $19.71 |
| Philly required protein | ✅ PASS | min_select=1 | min_select=1 |
| Fries required style | ✅ PASS | min_select=1 | min_select=1 |
| Modifier ownership | ✅ PASS | False | False |
| Group summary | ✅ PASS | 5 groups for Cowboy | 5 groups |

---

## Node Architecture (Fixed)

```
Webhook
→ Check Hours (with America/Chicago timezone)
  TRUE → Extract Lookup IDs
    → DB: Lookup Items
      → DB: Lookup Modifiers
        → DB: Lookup Groups
          → Merge DB Results
            → Validate & Calculate
              → Check Errors (condition: ok === true)
                TRUE → Create Square Payment Link
                  → Merge Response
                    → Save to SQLite
                    → Format Response
                      → Respond to Webhook
                FALSE → Format Error Response
                  → Respond Error
  FALSE → Format Closed Response
    → Respond Closed
```

---

## Key Code Changes

### Validate & Calculate — DB Extraction (Fixed)
```javascript
const dbItems = {};
$('DB: Lookup Items').all().forEach(item => {
  const row = item.json;
  if (row && row.item_id) dbItems[row.item_id] = row;
});
```

### Combo Subtotal (Fixed)
```javascript
const comboSubtotalCents = comboSides.reduce(
  (sum, side) => sum + Number(side.amount_cents || 0) * Number(side.quantity || 1),
  0
);
subtotalCents += comboSubtotalCents;
```

### Frontend Mismatch (Fixed)
```javascript
const frontendSubtotal =
  body.totals?.subtotal_cents ??
  body.frontend_subtotal_cents ??
  body.subtotal_cents ??
  0;
```

### Square Line Items (Fixed — no modifier array)
```javascript
const squareLineItems = validatedItems.map(item => {
  const modNames = item.modifiers
    .filter(m => !m.is_combo)
    .map(m => m.mod_name)
    .filter(Boolean);

  const displayName = modNames.length
    ? `${item.name} (${modNames.join(', ')})`
    : item.name;

  return {
    name: displayName,
    quantity: String(item.quantity),
    base_price_money: { amount: item.unit_total_cents, currency: 'USD' }
  };
});
```

---

## Deployment Checklist

- [ ] Import `n8n-v2-workflow-FIXED.json` into n8n UI
- [ ] Configure Postgres credential "Utopia Deli Postgres"
- [ ] Activate workflow
- [ ] Test with curl commands from `V2-TEST-PAYLOADS.md`
- [ ] Update frontend `config-v2.js` to point to new webhook
- [ ] Deploy frontend to GitHub Pages
- [ ] Monitor for 24 hours
- [ ] Disable old workflow when stable

---

## Files

| File | Purpose |
|------|---------|
| `n8n-v2-workflow-FIXED.json` | **USE THIS** — Fixed n8n workflow |
| `V2-TEST-PAYLOADS.md` | Test cases and curl commands |
| `BACKEND-V2-IMPLEMENTATION.md` | Architecture decisions |
| `test-validate-calc.js` | Standalone DB test (Node.js) |
| `index.html` | Updated frontend (cache v9 + canonical fields) |

---

**Validation: PASS** ✅
**Ready for deployment**
