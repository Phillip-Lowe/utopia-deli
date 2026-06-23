// ===================== CODY-CREATED: order-form.js v4.0 — Webhook Integration
// PLAN_ID: PLAN-HTML-WEBHOOK-INTEGRATION-2026-06-01
// ROLE: CODY
// STATE: ACTIVE
// Date: 2026-06-07
// Changes: Fixed payload schema to match WEBHOOK-DOCS.md v1.0.2:
//          - Flat field names (customer_name, not customer.name)
//          - order_items with price in dollars (not cents)
//          - subtotal/tax/total in dollars (not cents)
//          - pickup_time as "HH:MM" or "ASAP" string
//          - Fixed undefined finalPickupTime bug
//          - Proper response handling for JSON vs non-JSON
//          - Added item_id mapping from menu-data.js
// =====================

// ===================== STATE =====================
let cart = [];
let selectedItem = null;
let selectedModifiers = {};
let itemQty = 1;

// ===================== HOURS CONFIG =====================
const HOURS = {
  timezone: 'America/Chicago',
  mon: { open: '12:30', close: '19:30' },
  tue: { open: '12:30', close: '19:30' },
  wed: { open: '12:30', close: '19:30' },
  thu: { open: '12:30', close: '19:30' },
  fri: { open: '12:30', close: '19:30' },
  sat: { open: '12:30', close: '19:30' },
  sun: null // Closed Sunday
};

const TAX_RATE = 0.0952; // Arkansas rate per webhook docs

// ===================== RENDER MENU =====================
function renderMenu() {
  renderCategory('sandwichGrid', MENU.sandwiches);
  renderCategory('specialtyGrid', MENU.specialties);
  renderCategory('sidesGrid', MENU.sides);
}

function renderCategory(gridId, items) {
  const grid = document.getElementById(gridId);
  if (!grid) return;
  grid.innerHTML = items.map(item => `
    <div class="menu-item" id="item-${item.id}" onclick="selectItem('${item.id}')">
      ${item.photo ? `<img class="item-photo" src="${item.photo}" alt="${item.name}" loading="lazy">` : ''}
      <div class="item-content">
        <div class="item-header">
          <div class="item-name">${item.name}</div>
          <div class="item-price">$${formatPrice(item.price)}</div>
        </div>
        <div class="item-desc">${item.desc}</div>
        <div class="modifiers" id="mods-${item.id}">
          ${renderModifiers(item)}
        </div>
        <div class="item-actions">
          <div class="qty-control">
            <button type="button" onclick="event.stopPropagation(); changeQty(-1)">−</button>
            <input type="number" id="qty-${item.id}" value="1" min="1" max="10" readonly>
            <button type="button" onclick="event.stopPropagation(); changeQty(1)">+</button>
          </div>
          <button class="add-btn" onclick="event.stopPropagation(); addToCart('${item.id}')">
            ➕ Add to Order
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderModifiers(item) {
  if (!item.modifiers) return '';
  return Object.entries(item.modifiers).map(([group, options]) => `
    <div class="mod-group">
      <div class="mod-group-title">${group.charAt(0).toUpperCase() + group.slice(1)}</div>
      <div class="mod-options">
        ${options.map((opt, i) => `
          <button type="button"
            class="mod-btn ${i === 0 ? 'active' : ''}"
            data-group="${group}"
            data-code="${opt.code}"
            onclick="event.stopPropagation(); toggleMod('${group}', '${opt.code}', this)">
            ${opt.label}
            ${opt.price > 0 ? `<span class="mod-price">+$${formatPrice(opt.price)}</span>` : ''}
          </button>
        `).join('')}
      </div>
    </div>
  `).join('');
}

// ===================== INTERACTIONS =====================
function selectItem(id) {
  if (selectedItem) {
    document.getElementById(`item-${selectedItem}`)?.classList.remove('selected');
  }
  selectedItem = id;
  selectedModifiers = {};
  itemQty = 1;
  document.getElementById(`item-${id}`)?.classList.add('selected');

  const item = findItem(id);
  if (item?.modifiers) {
    Object.entries(item.modifiers).forEach(([group, options]) => {
      if (options.length > 0) selectedModifiers[group] = options[0];
    });
  }

  document.querySelectorAll('.qty-control input').forEach(inp => inp.value = 1);
}

function toggleMod(group, code, btn) {
  const item = findItem(selectedItem);
  if (!item?.modifiers?.[group]) return;
  const opt = item.modifiers[group].find(o => o.code === code);
  if (!opt) return;
  selectedModifiers[group] = opt;

  const groupBtns = btn.parentElement?.querySelectorAll('.mod-btn');
  groupBtns?.forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function changeQty(delta) {
  itemQty = Math.max(1, Math.min(10, itemQty + delta));
  if (selectedItem) {
    const input = document.getElementById(`qty-${selectedItem}`);
    if (input) input.value = itemQty;
  }
}

function findItem(id) {
  return [...MENU.sandwiches, ...MENU.specialties, ...MENU.sides].find(i => i.id === id);
}

function formatPrice(cents) {
  return (cents / 100).toFixed(2);
}

// ===================== CART =====================
function addToCart(id) {
  const item = findItem(id);
  if (!item) return;

  const qtyInput = document.getElementById(`qty-${id}`);
  const qty = qtyInput ? Math.max(1, Math.min(10, parseInt(qtyInput.value, 10) || 1)) : 1;

  const modsContainer = document.getElementById(`mods-${id}`);
  const activeModBtns = modsContainer ? modsContainer.querySelectorAll('.mod-btn.active') : [];

  const mods = [];
  activeModBtns.forEach(btn => {
    const group = btn.dataset.group;
    const code = btn.dataset.code;
    if (item.modifiers && item.modifiers[group]) {
      const opt = item.modifiers[group].find(o => o.code === code);
      if (opt) mods.push(opt);
    }
  });

  const modPrice = mods.reduce((s, m) => s + (m.price || 0), 0);
  const unitPrice = item.price + modPrice;
  const totalPrice = unitPrice * qty;

  cart.push({
    id: item.id,
    name: item.name,
    qty,
    unitPrice,
    totalPrice,
    modifiers: mods,
  });

  if (qtyInput) qtyInput.value = 1;

  if (selectedItem === id) {
    document.getElementById(`item-${id}`)?.classList.remove('selected');
    selectedItem = null;
    selectedModifiers = {};
    itemQty = 1;
  }

  updateCart();
  showAlert('success', `${item.name} added to your order!`);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

function updateCart() {
  const badge = document.getElementById('cartBadge');
  const content = document.getElementById('cartContent');
  const checkoutPanel = document.getElementById('checkoutPanel');

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);

  if (totalQty === 0) {
    if (badge) badge.style.display = 'none';
    if (checkoutPanel) checkoutPanel.style.display = 'none';
    if (content) {
      content.innerHTML = `
        <div class="cart-empty">
          <div class="emoji">🛒</div>
          <p>Your cart is empty.<br>Select an item to get started.</p>
        </div>
      `;
    }
    return;
  }

  if (badge) {
    badge.style.display = 'flex';
    badge.textContent = totalQty;
  }
  if (checkoutPanel) checkoutPanel.style.display = 'block';

  const subtotal = cart.reduce((s, i) => s + i.totalPrice, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const grand = subtotal + tax;

  if (content) {
    content.innerHTML = `
      ${cart.map((item, idx) => {
        const comboMod = item.modifiers.find(m => m.code && m.code.includes('COMBO'));
        const otherMods = item.modifiers.filter(m => !m.code || !m.code.includes('COMBO'));
        return `
        <div class="cart-item">
          <div class="cart-item-info">
            <h4>${item.qty}x ${item.name}</h4>
            ${comboMod ? `
              <div class="cart-combo">🍟 COMBO: ${comboMod.label.replace('Add ', '')}</div>
            ` : ''}
            ${otherMods.length ? `
              <div class="cart-mods">${otherMods.map(m => m.label).join(' • ')}</div>
            ` : ''}
          </div>
          <div style="display:flex;align-items:center;gap:12px">
            <div class="cart-item-price">$${formatPrice(item.totalPrice)}</div>
            <button onclick="removeFromCart(${idx})" style="background:none;border:none;cursor:pointer;font-size:16px;color:var(--text-light)">🗑️</button>
          </div>
        </div>
      `}).join('')}
      <div class="cart-totals">
        <div class="total-row">
          <span>Subtotal</span>
          <span>$${formatPrice(subtotal)}</span>
        </div>
        <div class="total-row tax">
          <span>Tax (est.)</span>
          <span>$${formatPrice(tax)}</span>
        </div>
        <div class="total-row grand">
          <span>Total</span>
          <span>$${formatPrice(grand)}</span>
        </div>
      </div>
    `;
  }
}

function scrollToCart() {
  document.getElementById('cartPanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===================== HOURS VALIDATION =====================
function isDeliOpen(pickupTime) {
  const now = new Date();
  const cst = new Date(now.toLocaleString('en-US', { timeZone: HOURS.timezone }));
  const dayNames = ['sun','mon','tue','wed','thu','fri','sat'];
  const today = dayNames[cst.getDay()];
  const hours = HOURS[today];

  if (!hours) return { open: false, message: 'Deli is closed today.' };

  const [pickupHour, pickupMin] = pickupTime.split(':').map(Number);
  const pickupMinutes = pickupHour * 60 + pickupMin;
  const [openHour, openMin] = hours.open.split(':').map(Number);
  const openMinutes = openHour * 60 + openMin;
  const [closeHour, closeMin] = hours.close.split(':').map(Number);
  const closeMinutes = closeHour * 60 + closeMin;

  const isOpen = pickupMinutes >= openMinutes && pickupMinutes <= closeMinutes;

  return {
    open: isOpen,
    message: isOpen ? 'Deli is open!' : `Deli is closed at ${pickupTime}. Hours: ${hours.open} - ${hours.close}`
  };
}

function populatePickupTimes() {
  const select = document.getElementById('pickupTime');
  if (!select) return;

  const now = new Date();
  const cst = new Date(now.toLocaleString('en-US', { timeZone: HOURS.timezone }));
  const dayNames = ['sun','mon','tue','wed','thu','fri','sat'];
  const today = dayNames[cst.getDay()];
  const hours = HOURS[today];

  if (!hours) {
    select.innerHTML = '<option value="">Closed today</option>';
    return;
  }

  const [openHour, openMin] = hours.open.split(':').map(Number);
  const [closeHour, closeMin] = hours.close.split(':').map(Number);
  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  let options = '<option value="ASAP">ASAP</option>';
  for (let mins = openMinutes; mins <= closeMinutes; mins += 15) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    const displayTime = `${displayH}:${String(m).padStart(2, '0')} ${ampm}`;
    options += `<option value="${timeStr}">${displayTime}</option>`;
  }
  select.innerHTML = options;
}

// ===================== CHECKOUT / WEBHOOK POST =====================
async function handleCheckout(e) {
  e.preventDefault();

  const btn = document.getElementById('submitBtn');
  if (!btn) {
    showAlert('error', 'System error. Please refresh and try again.');
    return;
  }

  if (cart.length === 0) {
    showAlert('error', 'Your cart is empty. Please add at least one item.');
    return;
  }

  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Sending...';

  // Read form values directly from DOM (CODY-PITFALLS: avoid FormData staleness)
  const customerName = document.querySelector('input[name="name"]')?.value?.trim() || '';
  const email = document.querySelector('input[name="email"]')?.value?.trim() || '';
  let phone = document.querySelector('input[name="phone"]')?.value?.trim() || '';
  const pickupTime = document.querySelector('select[name="pickup_time"]')?.value?.trim() || '';
  const specialInstructions = document.querySelector('textarea[name="special_instructions"]')?.value?.trim() || '';

  // Validate pickup time (skip for ASAP)
  if (pickupTime && pickupTime !== 'ASAP') {
    const hoursCheck = isDeliOpen(pickupTime);
    if (!hoursCheck.open) {
      showAlert('error', hoursCheck.message);
      btn.disabled = false;
      btn.innerHTML = '💳 Send Payment Link';
      return;
    }
  }

  // Phone normalization
  const phoneDigits = phone.replace(/\D/g, '');
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    showAlert('error', 'Please enter a valid 10-digit phone number.');
    btn.disabled = false;
    btn.innerHTML = '💳 Send Payment Link';
    return;
  }
  phone = phoneDigits;

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showAlert('error', 'Please enter a valid email address.');
    btn.disabled = false;
    btn.innerHTML = '💳 Send Payment Link';
    return;
  }

  if (!customerName || customerName.length < 2) {
    showAlert('error', 'Please enter your full name.');
    btn.disabled = false;
    btn.innerHTML = '💳 Send Payment Link';
    return;
  }

  // Build payload per WEBHOOK-DOCS.md v1.0.2 (flat fields, dollars not cents)
  const order_items = cart.map(cartItem => {
    const unitPriceDollars = cartItem.unitPrice / 100;
    return {
      item_id: cartItem.id,
      name: cartItem.name,
      qty: cartItem.qty,
      price: parseFloat(unitPriceDollars.toFixed(2)),
      modifiers: cartItem.modifiers.map(m => ({
        code: m.code,
        label: m.label,
        price_delta: (m.price || 0) / 100
      }))
    };
  });

  const subtotalCents = cart.reduce((s, i) => s + i.totalPrice, 0);
  const taxCents = Math.round(subtotalCents * TAX_RATE);
  const totalCents = subtotalCents + taxCents;

  const payload = {
    customer_name: customerName,
    email: email,
    phone: phone,
    order_items: order_items,
    subtotal: parseFloat((subtotalCents / 100).toFixed(2)),
    tax: parseFloat((taxCents / 100).toFixed(2)),
    total: parseFloat((totalCents / 100).toFixed(2)),
    pickup_time: pickupTime || 'ASAP',
    special_instructions: specialInstructions,
    source: 'pickup-order',
    timestamp: new Date().toISOString()
  };

  // Debug log (remove in prod)
  console.log('Webhook payload:', payload);

  try {
    const response = await fetch('https://utopia-api.systack.net/webhook/utopia-deli-html-order-v1', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Handle non-JSON responses gracefully (CODY-015)
    let result;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      result = await response.json();
    } else {
      const text = await response.text();
      result = { success: response.ok, message: text };
    }

    if (!response.ok || result.success === false) {
      showAlert('error', result.message || 'Something went wrong. Please try again or call us.');
    } else {
      showConfirmation(
        result.message || 'We sent your payment link. Check your email (SMS if needed).',
        result.payment_link
      );
    }
  } catch (err) {
    console.error('Checkout error:', err);
    showAlert('error', 'Could not reach the ordering system. Please try again or call us directly.');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '💳 Send Payment Link';
  }
}

// ===================== CONFIRMATION PAGE =====================
function showConfirmation(message, paymentLink) {
  const main = document.querySelector('.main');
  const hero = document.querySelector('.hero');
  if (main) main.style.display = 'none';
  if (hero) hero.style.display = 'none';

  const existing = document.getElementById('confirmationPage');
  if (existing) existing.remove();

  const confirmation = document.createElement('div');
  confirmation.id = 'confirmationPage';
  confirmation.innerHTML = `
    <div style="max-width:448px;margin:40px auto;padding:24px;background:#fff;border-radius:14px;box-shadow:0 4px 24px rgba(17,24,39,0.08);text-align:center;">
      <div style="font-size:48px;margin-bottom:16px;">🎉</div>
      <h2 style="font-size:24px;font-weight:800;color:#590B3F;margin-bottom:12px;">We Got You!</h2>
      <p style="font-size:16px;color:#6B7280;margin-bottom:24px;line-height:1.5;">
        We've received your order and emailed you a secure payment link.<br>
        Your order will be confirmed after payment is completed.
      </p>
      <p style="font-size:14px;color:#374151;margin-bottom:24px;">${message}</p>
      ${paymentLink ? `<a href="${paymentLink}" target="_blank" style="display:inline-block;background:#AF3D4B;color:#fff;padding:14px 32px;border-radius:50px;font-weight:700;font-size:16px;text-decoration:none;margin-bottom:16px;">💳 Pay Now</a>` : ''}
      <p style="font-size:12px;color:#9CA3AF;">Didn't receive the email? Check your spam folder or call us.</p>
    </div>
  `;
  document.body.appendChild(confirmation);
}

// ===================== ALERTS =====================
function showAlert(type, msg) {
  const el = document.getElementById(`alert${type.charAt(0).toUpperCase() + type.slice(1)}`);
  if (!el) return;
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 5000);
}

// ===================== HOURS CHECK =====================
function checkHours() {
  const now = new Date();
  const cst = new Date(now.toLocaleString('en-US', { timeZone: 'America/Chicago' }));
  const day = cst.getDay();
  const hour = cst.getHours();
  const min = cst.getMinutes();
  const timeVal = hour * 60 + min;

  const isWeekday = day >= 1 && day <= 6;
  const isOpen = isWeekday && timeVal >= 750 && timeVal <= 1170; // 12:30 - 19:30

  const pill = document.getElementById('hoursPill');
  const text = document.getElementById('hoursText');

  if (!isOpen && pill) {
    pill.classList.add('closed');
    if (text) text.textContent = 'Currently Closed · Opens Mon–Sat 12:30 PM';
  }
}

// ===================== INIT =====================
if (typeof MENU !== 'undefined') {
  renderMenu();
  checkHours();
  populatePickupTimes();
}
