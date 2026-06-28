# Utopia Deli Frontend / Menu DB Alignment — Concise Handoff

## Purpose
This document explains what has been changed/decided so far for the Utopia Deli order page frontend and what still needs to be fixed before the frontend and backend can reliably speak the same language.

---

## Current Objective
Align the online order page with the database source of truth so that:

- Frontend item IDs match DB `item_id` values.
- Frontend modifier codes match DB `mod_id` values.
- Frontend modifier groups match DB `group_id` values.
- Frontend prices are display/validation only.
- Backend recalculates final pricing from the DB.
- Combo fries always mean **plain fries**.

---

## Canonical Data Model Decisions

### 1. Menu Items
The frontend should use canonical `item_id` values from the DB.

Current canonical public items:

- `COWBOY`
- `CLUB`
- `FRIED`
- `PHILLY`
- `POPPERS`
- `DUMPLING_TACOS`
- `ROCKTOWN_SLIDERS`
- `FRIES`
- `JUICE_CP`
- `COOKIES_2`
- `SIDE_SALAD`
- `WATER_16OZ`
- `CHIPS_SPIRALS`

Potential/new item:

- `BUFFALO_SLIDERS`

Important: if `BUFFALO_SLIDERS` exists in modifier groups/modifiers, it must also exist in `menu_items` before it is public or backend-valid.

---

### 2. Fries Model
Fries are now modeled as one parent item:

```text
FRIES
```

Fries style is selected through required modifier group:

```text
FRIES_STYLE
```

Valid fries style modifiers:

- `FRIES_PLAIN` = plain fries, +$0.00
- `FRIES_BACN` = loaded fries — bac'n, +$8.00
- `FRIES_CHIKN` = loaded fries — philly chik'n, +$8.00
- `FRIES_GARLICPARM` = loaded fries — garlic parm, +$8.00
- `FRIES_STEK` = loaded fries — philly stek, +$8.00

Because parent `FRIES` starts at `$5.00`, loaded styles total `$13.00`.

---

### 3. Combo Fries Rule
Combo fries are **always plain fries**.

Combo fries should not trigger `FRIES_STYLE`.

All combo fry modifier rows should say:

```text
plain fries
```

Examples:

- `C_COMBO_FRIES` = plain fries, +$5.00
- `S_COMBO_FRIES` = plain fries, +$5.00
- `F_COMBO_FRIES` = plain fries, +$5.00
- `P_COMBO_FRIES` = plain fries, +$5.00
- `POP_COMBO_FRIES` = plain fries, +$5.00
- `DUMP_COMBO_FRIES` = plain fries, +$5.00
- `R_COMBO_FRIES` = plain fries, +$5.00
- `B_COMBO_FRIES` = plain fries, +$5.00 if Buffalo is active

Backend interpretation:

```text
Combo fries = add a plain fries side for $5.00
```

Not:

```text
Add FRIES item and require FRIES_STYLE
```

---

### 4. Juice Model
Juice is now modeled as one parent item:

```text
JUICE_CP
```

Required groups:

```text
JUICE_FLAVOR
JUICE_SIZE
```

Current frontend should show only:

```text
JSIZE_10OZ = 10 oz plastic bottle, +$0.00
```

DB should keep 16 oz for future availability:

```text
JSIZE_16OZ = 16 oz glass bottle, +$5.00
```

Because parent `JUICE_CP` starts at `$5.00`, 16 oz totals `$10.00`.

Frontend status:

- 10 oz juice is public.
- 16 oz juice remains in DB but hidden from frontend for now.

---

## What Was Cleaned / Removed From Active Use

These rows/concepts should not be active in the clean model:

### 1. Bad fries modifier row
Old bad row:

```text
FRIES_PLAIN | plain fries | plain fries
```

Problem: `plain fries` was incorrectly used as a `group_id`.

Correct row:

```text
FRIES_PLAIN | FRIES_STYLE | plain fries
```

---

### 2. Duplicate `FRIES_UPS_FRIES_PLAIN`
Duplicate `mod_id` values can cause backend lookup/pricing errors.

Keep only one active row if upsells are used.

---

### 3. Vague loaded fries rows
Rows like these should not be active:

```text
FRIES_UPS_FRIES_LOADED
FRIES_UPS_LOADED_FRIES
```

Reason: they do not specify which loaded style the customer selected.

Use specific loaded fry styles instead:

- bac'n
- philly chik'n
- garlic parm
- philly stek

---

### 4. `UPS_JUICE`
Old row used invalid price ranges:

```text
5.00-10.00
```

Backend needs exact numeric pricing.

Use `JUICE_SIZE` modifiers instead.

---

### 5. `PHILLY_TAKEOFF_2`
Merged into:

```text
PHILLY_TAKEOFF
```

Renamed options:

- `P_NO_CHEESE`
- `P_NO_ONIONS`
- `P_NO_PEPPERS`

---

## Frontend File Status

Current generated frontend file:

```text
menu-data.js v9
```

It uses:

```javascript
window.MENU = { ... }
```

This is intentional because the HTML currently loads `menu-data.js` twice. Using `window.MENU` avoids duplicate `const MENU` declaration crashes.

---

## Important Frontend Compatibility Notes

The existing frontend expects modifier groups like:

```text
protein
style
flavor
size
sauce
addons
extras
combo
hold
noranch
subs
```

So `menu-data.js v9` keeps those frontend group keys for compatibility.

But each modifier now also carries canonical DB fields:

```text
mod_id
group_id
group_type
mod_name
price_delta_cents
```

This lets the frontend remain compatible while sending backend-safe data.

---

## Required Frontend Fixes

### 1. Update script version in HTML
The order page currently references:

```html
<script src="menu-data.js?v=8"></script>
```

Update both occurrences to:

```html
<script src="menu-data.js?v=9"></script>
```

There are two script tags in the current HTML. Both must be updated or the browser may load stale data.

---

### 2. Ensure frontend sends canonical modifier fields
The checkout payload builder should send:

```text
item_id
mod_id
group_id
group_type
mod_name
price_delta_cents
```

Do not rely only on old fields like:

```text
id
code
label
group
price_cents
```

Those can remain temporary fallback fields, but canonical DB fields should be primary.

---

### 3. Fix selected modifier storage
When a modifier is selected, frontend should store:

```javascript
{
  ...opt,
  group_key: group,
  group_id: opt.group_id || group,
  group_type: opt.group_type || null,
  mod_id: opt.mod_id || opt.code,
  mod_name: opt.mod_name || opt.label
}
```

This preserves the frontend display group and the DB group.

---

### 4. Validate required groups
Required frontend selections still needed:

- Philly requires `PHILLY_PROTEIN`.
- Fries requires `FRIES_STYLE`.
- Juice requires `JUICE_FLAVOR` and `JUICE_SIZE`.

Backend must also validate these. Frontend validation alone is not enough.

---

## Backend Requirements

Backend must treat DB as pricing authority.

Backend should:

1. Receive `item_id` from frontend.
2. Look up active item by `item_id`.
3. Validate quantity.
4. For each modifier:
   - look up by `mod_id`
   - confirm modifier is active
   - confirm modifier belongs to submitted `group_id`
   - confirm `group_id` belongs to selected `item_id`
5. Enforce group min/max rules.
6. Recalculate subtotal from DB prices.
7. Calculate tax server-side.
8. Create Square payment link from backend-calculated totals.
9. Return payment link to frontend.

Backend should not trust frontend totals except for debugging/comparison.

---

## Backend Compatibility/Fallback

During transition, backend may temporarily accept old fields:

```text
item.id
modifier.code
modifier.label
modifier.group
modifier.price_cents
```

But preferred fields are:

```text
item.item_id
modifier.mod_id
modifier.group_id
modifier.price_delta_cents
```

---

## Known Open Issues

### 1. Buffalo not fully confirmed
DB tables now include Buffalo groups/modifiers:

- `BUFFALO_SLIDERS`
- `BUFFALO_TAKEOFF`
- `BUFFALO_COMBO`
- `B_COMBO_FRIES`
- `B_COMBO_SALAD`
- `BUFFALO_NO_RANCH`
- `BUFFALO_NO_SLAW`

But `menu-data.js v9` does not include Buffalo on frontend.

Decision needed:

- If Buffalo is public now, add it to `menu_items` and `menu-data.js` under `specialties`.
- If Buffalo is not public now, keep it inactive/hidden.

---

### 2. 16 oz juice hidden intentionally
DB keeps 16 oz juice, but frontend currently hides it.

Decision needed later:

- Keep hidden for now, or
- Expose 16 oz publicly by enabling `JSIZE_16OZ` in `menu-data.js`.

---

### 3. Upsell groups are not currently in frontend v9
The current frontend file focuses on core item modifiers and combos.

Recommended sides/beverages upsell groups are not fully implemented in `menu-data.js v9`.

Decision needed:

- Keep upsells out for stability, or
- Add canonical upsells after backend is stable.

---

## What SOL Needs To Do Next

### Step 1 — Confirm DB tables
Confirm these are populated and active:

- `menu_items`
- `item_variants` if used
- `modifier_groups`
- `modifiers`

Every `group_id` in `modifiers` must exist in `modifier_groups`.

Every `item_id` in `modifier_groups` must exist in `menu_items`.

---

### Step 2 — Replace frontend menu data
Replace existing `menu-data.js` with `menu-data.js v9`.

Then update HTML cache buster:

```html
menu-data.js?v=9
```

---

### Step 3 — Patch frontend payload builder
Ensure submitted payload includes canonical fields:

```text
item_id
mod_id
group_id
group_type
mod_name
price_delta_cents
```

---

### Step 4 — Patch backend parser
Backend must parse canonical fields first and old fields only as fallback.

---

### Step 5 — Test minimum order paths
Test these orders:

1. Cowboy + plain fries combo.
2. Philly + required protein + combo.
3. Fries + required style plain.
4. Fries + loaded style.
5. Juice + flavor + 10 oz size.
6. Poppers + sauce + combo.
7. Rocktown sliders + takeoff + combo.

---

## Completion Criteria

This work is complete when:

- Frontend displays the correct public menu.
- Adding items to cart works with modifiers.
- Payload contains canonical `item_id`, `mod_id`, and `group_id`.
- Backend validates every item and modifier against DB.
- Backend recalculates prices instead of trusting frontend totals.
- Square payment link reflects correct backend totals.
- Combo fries appear as plain fries.
- 16 oz juice remains hidden unless intentionally enabled.
- Buffalo is either fully added or intentionally hidden.

---

## Current Validation Status

```text
Validation: NEEDS REVIEW
```

Reason:

- Frontend menu data is mostly aligned.
- DB structure is mostly aligned.
- Backend parser has not yet been reviewed.
- Buffalo public/private status is not confirmed.
- HTML still needs cache/version update from v8 to v9.

Once backend is pasted/reviewed, ORACLE can produce the exact bridge patch.
