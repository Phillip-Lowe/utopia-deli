# Reusable Order System Template — Pattern Library

**Version:** 1.0  
**Date:** 2026-06-06  
**Source:** Utopia Deli implementation  

---

## Pattern 1: Smart addToCart() Function

**Problem:** Items with/without modifiers need different handling

**Solution:** Check if item has REQUIRED modifiers before deciding behavior

```javascript
function addToCart(id) {
  const item = findItem(id);
  if (!item) return;
  
  let mods = [];
  let qty = 1;
  
  if (selectedItem === id) {
    // Item is selected — use current state with validation
    if (!validateRequiredGroups(item)) return;
    mods = Object.values(selectedModifiers).flat();
    qty = itemQty;
  } else if (item.modifiers) {
    // Item has modifiers but isn't selected
    const hasRequired = Object.keys(item.modifiers).some(group => {
      const rules = GROUP_RULES[group];
      return rules && rules.min >= 1;
    });
    
    if (hasRequired) {
      // Prompt user to select required options
      selectItem(id);
      showAlert("info", `Please select options for ${item.name}`);
      return;
    }
    // No required modifiers — add with defaults
  }
  
  // Calculate prices
  const modPrice = mods.reduce((s, m) => s + (m.price || 0), 0);
  const unitPrice = item.price + modPrice;
  const totalPrice = unitPrice * qty;
  
  cart.push({ id, name: item.name, qty, unitPrice, totalPrice, modifiers: mods });
  updateCart();
}
```

**Usage:** Works for any item — simple items add immediately, complex items prompt for selection

---

## Pattern 2: Modifier Rules System

**Problem:** Different modifier groups need different behavior (required vs optional, single vs multi-select)

**Solution:** Define rules per group type

```javascript
const GROUP_RULES = {
  // REQUIRED: Must select exactly 1
  protein: { min: 1, max: 1, type: 'REQUIRED' },
  style: { min: 1, max: 1, type: 'REQUIRED' },
  
  // ADD: Optional, multi-select up to max
  sauce: { min: 0, max: 6, type: 'ADD' },
  extras: { min: 0, max: 3, type: 'ADD' },
  
  // HOLD: Removals, multi-select
  hold: { min: 0, max: 4, type: 'HOLD' },
  
  // SPECIAL: Toggle/replace single
  noranch: { min: 0, max: 1, type: 'SPECIAL' }
};
```

**Group Types:**
| Type | Behavior | UI Pattern |
|------|----------|------------|
| REQUIRED | Must select 1, replaces previous | Radio buttons |
| ADD | Optional, multi-select up to max | Checkboxes with counter |
| HOLD | Multi-select removals | Checkboxes |
| SPECIAL | Toggle/replace single | Toggle switch |

---

## Pattern 3: Multi-Select Modifier Storage

**Problem:** Old system stored only ONE selection per group

**Solution:** Store arrays per group

```javascript
// State
let selectedModifiers = {}; // { group: [opt1, opt2] }

// Toggle function
function toggleMod(group, code, btn) {
  const rules = GROUP_RULES[group] || { min: 0, max: 99 };
  
  if (!selectedModifiers[group]) {
    selectedModifiers[group] = [];
  }
  
  const groupList = selectedModifiers[group];
  const existsIndex = groupList.findIndex(m => m.code === code);
  
  if (existsIndex >= 0) {
    // Remove if already selected
    groupList.splice(existsIndex, 1);
  } else if (groupList.length < rules.max) {
    // Add if under max
    groupList.push(opt);
  }
  
  updateUI(group, rules);
}
```

---

## Pattern 4: Flatten Modifiers for Payload

**Problem:** Backend expects flat array, not grouped object

**Solution:** Flatten before sending

```javascript
const mods = Object.values(selectedModifiers).flat();

// Result: [opt1, opt2, opt3] instead of { group1: [opt1], group2: [opt2, opt3] }
```

---

## Pattern 5: Cart Display with Modifier Tags

**Problem:** Cart must show modifiers clearly, especially for duplicate items

**Solution:** Show each modifier as a tag with optional pricing

```javascript
content.innerHTML = cart.map((item, idx) => `
  <div class="cart-item">
    <div class="cart-item-info">
      <h4>${item.qty}x ${item.name}</h4>
      ${item.modifiers.length ? `
        <div class="cart-mods">
          ${item.modifiers.map(m => `
            <span class="cart-mod-tag">
              ${m.label}${m.price > 0 ? ` (+$${formatPrice(m.price)})` : ''}
            </span>
          `).join(' ')}
        </div>
      ` : ''}
      <div style="font-size:11px;color:var(--text-light);margin-top:4px;">
        Unit: $${formatPrice(item.unitPrice)} × ${item.qty}
      </div>
    </div>
    <div class="cart-item-price">$${formatPrice(item.totalPrice)}</div>
  </div>
`).join('');
```

**CSS for tags:**
```css
.cart-mod-tag {
  display: inline-block;
  background: rgba(117, 70, 129, 0.08);
  border: 1px solid rgba(117, 70, 129, 0.2);
  border-radius: 4px;
  padding: 2px 6px;
  margin: 2px 2px 0 0;
  font-size: 10px;
  color: var(--ud-secondary);
}
```

---

## Pattern 6: Error Catcher V2

**Problem:** Different errors need different handling

**Solution:** Structured error types with specific messages

```javascript
try {
  const response = await fetch(endpoint, { method: 'POST', body: JSON.stringify(payload) });
  const result = await response.json();
  
  if (!response.ok) {
    // HTTP error (4xx, 5xx)
    console.error('HTTP Error:', { status: response.status, response: result });
    showAlert('error', `Server error (${response.status}). Please try again.`);
    return;
  }
  
  if (result.ok === false) {
    // Business rule error
    console.error('Business Error:', { message: result.error, payload });
    showAlert('error', result.error || 'Order could not be processed');
    return;
  }
  
  // Success
  showConfirmation(result.message, result.payment_link);
  
} catch (err) {
  // Network/CORS/timeout
  console.error('Network Error:', err);
  showAlert('error', 'Network error. Please check connection and try again.');
}
```

---

## Pattern 7: Visual Counter for Modifiers

**Problem:** Users don't know how many modifiers they can select

**Solution:** Show counter next to group title

```javascript
function updateModifierUI(group, rules) {
  const selected = selectedModifiers[group]?.length || 0;
  const max = rules.max;
  const counter = document.querySelector(`#counter-${group}`);
  
  if (counter) {
    counter.textContent = max < 99 ? ` (${selected}/${max})` : ` (${selected})`;
    counter.style.color = selected >= max ? 'var(--ud-accent)' : 'var(--text-light)';
  }
  
  // Auto-disable buttons at max
  if (max > 1 && selected >= max) {
    groupEl.querySelectorAll('.mod-btn:not(.active)').forEach(btn => {
      btn.disabled = true;
      btn.style.opacity = '0.5';
    });
  }
}
```

---

## Pattern 8: Tax as Line Item (Square Limitation)

**Problem:** Square doesn't support external tax calculation

**Solution:** Add tax as separate line item

```javascript
{
  line_items: [
    ...regular_items,
    {
      name: "Tax (9.52%)",
      base_price_money: { amount: tax_cents, currency: "USD" }
    }
  ],
  metadata: {
    tax_rate_percent: "9.52",
    tax_handling: "manual_line_item"
  }
}
```

---

## Pattern 9: n8n Merge Node Pattern

**Problem:** HTTP Request node drops ALL input data

**Solution:** Use Merge nodes to preserve data

```
Original Data → Merge (combine: append) → HTTP Request → Merge (combine: append) → Next Node
```

**Important:** Always use Merge nodes before and after HTTP Request nodes in n8n

---

## Pattern 10: White-Label Config Structure

**Problem:** Hardcoded brand values make reuse difficult

**Solution:** Centralized config object

```javascript
const BRAND = {
  name: "The Utopia Deli",
  tagline: "It's just good food",
  location: "Little Rock, AR",
  phone: "(501) 551-5944",
  email: "order@theutopiadeli.com",
  hours: {
    timezone: "America/Chicago",
    openDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
    openTime: { hour: 12, minute: 30 },
    closeTime: { hour: 19, minute: 30 }
  },
  checkout: {
    endpoint: "https://n8n.yourdomain.com/webhook/order-v1",
    currency: "USD",
    currencySymbol: "$"
  }
};
```

---

## Integration Checklist for New Companies

### Step 1: Menu Setup
- [ ] Define items with prices (in cents)
- [ ] Create modifier groups with rules
- [ ] Set price deltas for modifiers
- [ ] Add product photos

### Step 2: Brand Configuration
- [ ] Update `config.js` with company details
- [ ] Set business hours
- [ ] Configure webhook endpoint
- [ ] Add logo and favicon

### Step 3: Tax Configuration
- [ ] Determine local tax rate
- [ ] Configure as line item (Square limitation)
- [ ] Update display calculations

### Step 4: n8n Workflow
- [ ] Import workflow template
- [ ] Configure Square API credentials
- [ ] Set up Merge nodes around HTTP Request
- [ ] Test with sample orders

### Step 5: Testing
- [ ] Simple items (no modifiers)
- [ ] Items with optional modifiers
- [ ] Items with required modifiers
- [ ] Multiple quantities
- [ ] Full checkout flow

---

## Cost Breakdown (Per Company)

| Component | Monthly Cost |
|-----------|-------------|
| GitHub Pages hosting | $0 |
| Cloudflare DNS | $0 |
| n8n self-hosted | $0 |
| Square API | 2.9% + $0.30 per transaction |
| **Total fixed** | **$0** |

---

## Files to Copy for New Deployment

```
utopia-deli-order/
├── index.html          # Main frontend (customize menu sections)
├── config.js           # Brand configuration (REQUIRED changes)
├── menu-data.js        # Menu items and modifiers (REQUIRED changes)
├── payment-confirmed.html  # Post-payment page (optional customization)
├── images/             # Product photos and logos
└── CNAME               # Custom domain (optional)
```

---

## Common Pitfalls to Avoid

1. **Don't forget MENU.sides in findItem()** — Always search all categories
2. **Don't assume items need selection** — Check for required modifiers first
3. **Don't forget Merge nodes in n8n** — HTTP Request drops all input data
4. **Don't use external tax calculation** — Square requires line item approach
5. **Don't skip validation** — Always validate required modifiers before addToCart

---

**Questions?** See full case study: `CASE-STUDY.md`

**Built by:** Systack (systack.net)  
**For:** The Utopia Deli (theutopiadeli.com)  
**Date:** 2026-06-06
