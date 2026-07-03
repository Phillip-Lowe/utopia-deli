// ===================== ORACLE / SOL LOCKED: order-form.js v5.1
// Utopia Deli canonical frontend order form
//
// Contract:
// - Frontend item id = DB item_id
// - Variant id = DB variant_id
// - Modifier code/mod_id = DB mod_id
// - Modifier group_id = DB group_id
// - Prices are cents
// - Frontend displays totals only
// - Backend recalculates from IDs
// - Source = pickup-order
// =====================

// ===================== STATE =====================
let cart = [];
let selectedItem = null;
let selectedVariant = null;
let selectedModifiers = {};
let itemQty = 1;

// ===================== CONFIG =====================
const HOURS = {
  timezone: "America/Chicago",
  mon: { open: "12:30", close: "19:30" },
  tue: { open: "12:30", close: "19:30" },
  wed: { open: "12:30", close: "19:30" },
  thu: { open: "12:30", close: "19:30" },
  fri: { open: "12:30", close: "19:30" },
  sat: { open: "12:30", close: "19:30" },
  sun: null,
};

const TAX_RATE = 0.0952;

const CHECKOUT_ENDPOINT =
  window.BRAND?.checkout?.endpoint ||
  "https://n8n.systack.net/webhook/utopia-deli-order-v4";

const GROUP_RULES = {
  COW_SAUCES: { min: 0, max: 6 },
  COW_TAKEOFF: { min: 0, max: 4 },
  COW_NORANCH: { min: 0, max: 1 },
  COW_ADDONS: { min: 0, max: 1 },
  COW_COMBO: { min: 0, max: 1 },

  PHILLY_PROTEIN: { min: 1, max: 1 },
  PHILLY_ADDONS: { min: 0, max: 1 },
  PHILLY_COMBO: { min: 0, max: 1 },
  PHILLY_TAKEOFF: { min: 0, max: 6 },
  PHILLY_EXTRAS: { min: 0, max: 3 },

  CLUB_TAKEOFF: { min: 0, max: 4 },
  CLUB_NORANCH: { min: 0, max: 1 },
  CLUB_COMBO: { min: 0, max: 1 },
  CLUB_ADDONS: { min: 0, max: 1 },
  CLUB_SAUCES: { min: 0, max: 1 },

  FRIED_TAKEOFF: { min: 0, max: 4 },
  FRIED_NORANCH: { min: 0, max: 1 },
  FRIED_COMBO: { min: 0, max: 1 },
  FRIED_ADDONS: { min: 0, max: 1 },
  FRIED_ADDSAUCE: { min: 0, max: 1 },

  FRIES_ADDONS: { min: 0, max: 1 },
  FRIES_ADDPROTEIN: { min: 0, max: 3 },

  JUICE_FLAVOR: { min: 1, max: 1 },

  POP_SAUCE: { min: 0, max: 1 },
  POP_COMBO: { min: 0, max: 1 },

  DUMPLING_TAKEOFF: { min: 0, max: 4 },
  DUMPLING_SUBS: { min: 0, max: 1 },
  DUMPLING_COMBO: { min: 0, max: 1 },

  ROCK_TAKEOFF: { min: 0, max: 2 },
  ROCK_COMBO: { min: 0, max: 1 },

  BUFFALO_TAKEOFF: { min: 0, max: 2 },
  BUFFALO_COMBO: { min: 0, max: 1 },
};

// ===================== HELPERS =====================
function formatPrice(cents) {
  return ((Number(cents) || 0) / 100).toFixed(2);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getAllItems() {
  return [
    ...(window.MENU?.sandwiches || []),
    ...(window.MENU?.specialties || []),
    ...(window.MENU?.sides || []),
    ...(window.MENU?.beverages || []),
  ];
}

function findItem(id) {
  return getAllItems().find((item) => item.id === id || item.item_id === id);
}

function getGroupRule(groupId, groupType) {
  if (GROUP_RULES[groupId]) return GROUP_RULES[groupId];
  if (groupType === "REQUIRED") return { min: 1, max: 1 };
  return { min: 0, max: 99 };
}

function readableGroupName(groupKey, firstOption) {
  const groupId = firstOption?.group_id || groupKey;

  const names = {
    sauce: "Sauce",
    hold: "Take Off",
    noranch: "No Ranch / Sauce Substitute",
    addons: "Add Ons",
    combo: "Combo Upgrade",
    protein: "Protein",
    extras: "Extras",
    subs: "Substitutions",
    flavor: "Juice Flavor",
  };

  return names[groupKey] || groupId.replaceAll("_", " ");
}

// ===================== RENDER MENU =====================
function renderMenu() {
  renderCategory("sandwichGrid", window.MENU?.sandwiches || []);
  renderCategory("specialtyGrid", window.MENU?.specialties || []);
  renderCategory("sidesGrid", window.MENU?.sides || []);
  renderCategory("beverageGrid", window.MENU?.beverages || []);
}

function renderCategory(gridId, items) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  grid.innerHTML = items
    .map((item) => {
      const itemId = escapeHtml(item.id || item.item_id);
      const name = escapeHtml(item.name);
      const desc = escapeHtml(item.desc || "");
      const photo = item.photo || "";

      return `
        <div class="menu-item" id="item-${itemId}" onclick="selectItem('${itemId}')">
          ${
            photo
              ? `<img class="item-photo" src="${escapeHtml(photo)}" alt="${name}" loading="lazy">`
              : ""
          }

          <div class="item-content">
            <div class="item-header">
              <div class="item-name">${name}</div>
              <div class="item-price">$${formatPrice(item.price)}</div>
            </div>

            <div class="item-desc">${desc}</div>

            <div class="modifiers" id="mods-${itemId}">
              ${renderVariants(item)}
              ${renderModifiers(item)}
            </div>

            <div class="item-actions">
              <div class="qty-control">
                <button type="button" onclick="event.stopPropagation(); changeQty(-1)">−</button>
                <input type="number" id="qty-${itemId}" value="1" min="1" max="10" readonly>
                <button type="button" onclick="event.stopPropagation(); changeQty(1)">+</button>
              </div>

              <button class="add-btn" onclick="event.stopPropagation(); addToCart('${itemId}')">
                ➕ Add to Order
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderVariants(item) {
  if (!Array.isArray(item.variants) || item.variants.length === 0) return "";

  return `
    <div class="mod-group variant-group" data-group="variants">
      <div class="mod-group-title">
        Choose Option
        <span style="color:var(--ud-accent);font-size:10px;">● REQUIRED</span>
      </div>

      <div class="mod-options">
        ${item.variants
          .map((variant) => {
            const variantId = escapeHtml(variant.variant_id);
            const label = escapeHtml(variant.label || variant.variant_name);
            const delta = Number(variant.price_delta_cents || 0);

            return `
              <button
                type="button"
                class="mod-btn variant-btn"
                data-variant-id="${variantId}"
                onclick="event.stopPropagation(); toggleVariant('${escapeHtml(
                  item.id || item.item_id,
                )}', '${variantId}', this)"
              >
                ${label}
                ${
                  delta > 0
                    ? `<span class="mod-price">+$${formatPrice(delta)}</span>`
                    : ""
                }
              </button>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderModifiers(item) {
  if (!item.modifiers) return "";

  return Object.entries(item.modifiers)
    .map(([groupKey, options]) => {
      if (!Array.isArray(options) || options.length === 0) return "";

      const first = options[0];
      const groupId = first.group_id || groupKey;
      const rule = getGroupRule(groupId, first.group_type);
      const isRequired = rule.min > 0;
      const title = escapeHtml(readableGroupName(groupKey, first));

      return `
        <div class="mod-group" data-group="${escapeHtml(groupKey)}" data-group-id="${escapeHtml(groupId)}">
          <div class="mod-group-title">
            ${title}
            ${
              isRequired
                ? `<span style="color:var(--ud-accent);font-size:10px;">● REQUIRED</span>`
                : ""
            }
            ${
              rule.max < 99
                ? `<span class="mod-counter" id="counter-${escapeHtml(item.id)}-${escapeHtml(groupKey)}"></span>`
                : ""
            }
          </div>

          <div class="mod-options">
            ${options
              .map((opt) => {
                const modId = escapeHtml(opt.mod_id || opt.code);
                const label = escapeHtml(opt.label || opt.mod_name);
                const price = Number(opt.price_delta_cents ?? opt.price ?? 0);

                return `
                  <button
                    type="button"
                    class="mod-btn"
                    data-group="${escapeHtml(groupKey)}"
                    data-group-id="${escapeHtml(opt.group_id)}"
                    data-mod-id="${modId}"
                    data-code="${modId}"
                    onclick="event.stopPropagation(); toggleMod('${escapeHtml(groupKey)}', '${modId}', this)"
                  >
                    ${label}
                    ${
                      price > 0
                        ? `<span class="mod-price">+$${formatPrice(price)}</span>`
                        : ""
                    }
                  </button>
                `;
              })
              .join("")}
          </div>
        </div>
      `;
    })
    .join("");
}

// ===================== INTERACTIONS =====================
function selectItem(id) {
  if (selectedItem && selectedItem !== id) {
    document
      .getElementById(`item-${selectedItem}`)
      ?.classList.remove("selected");
  }

  selectedItem = id;
  selectedVariant = null;
  selectedModifiers = {};
  itemQty = 1;

  document.getElementById(`item-${id}`)?.classList.add("selected");

  document.querySelectorAll(".qty-control input").forEach((input) => {
    input.value = 1;
  });
}

function toggleVariant(itemId, variantId, btn) {
  const item = findItem(itemId);
  if (!item?.variants) return;

  const variant = item.variants.find((v) => v.variant_id === variantId);
  if (!variant) return;

  selectedVariant = variant;

  const itemEl = document.getElementById(`item-${itemId}`);
  itemEl?.querySelectorAll(".variant-btn").forEach((button) => {
    button.classList.remove("active");
  });

  btn.classList.add("active");
}

function toggleMod(groupKey, modId, btn) {
  const item = findItem(selectedItem);
  if (!item?.modifiers?.[groupKey]) return;

  const option = item.modifiers[groupKey].find(
    (opt) => (opt.mod_id || opt.code) === modId,
  );

  if (!option) return;

  const groupId = option.group_id || groupKey;
  const rule = getGroupRule(groupId, option.group_type);

  if (!selectedModifiers[groupKey]) {
    selectedModifiers[groupKey] = [];
  }

  const selectedList = selectedModifiers[groupKey];
  const existingIndex = selectedList.findIndex(
    (selected) => (selected.mod_id || selected.code) === modId,
  );

  if (existingIndex >= 0) {
    selectedList.splice(existingIndex, 1);
    btn.classList.remove("active");
    updateModifierCounter(groupKey, rule);
    updateModifierDisabledState(groupKey, rule);
    return;
  }

  if (rule.max === 1) {
    selectedList.length = 0;

    const groupEl = btn.closest(".mod-group");
    groupEl?.querySelectorAll(".mod-btn").forEach((button) => {
      button.classList.remove("active");
    });
  }

  if (rule.max > 1 && selectedList.length >= rule.max) {
    showAlert(
      "error",
      `You can only select ${rule.max} option(s) for this group.`,
    );
    return;
  }

  selectedList.push({ ...option, group: groupKey });
  btn.classList.add("active");

  updateModifierCounter(groupKey, rule);
  updateModifierDisabledState(groupKey, rule);
}

function updateModifierCounter(groupKey, rule) {
  if (!selectedItem) return;

  const selectedCount = selectedModifiers[groupKey]?.length || 0;
  const counter = document.getElementById(
    `counter-${selectedItem}-${groupKey}`,
  );

  if (!counter) return;

  counter.textContent = rule.max < 99 ? ` (${selectedCount}/${rule.max})` : "";
  counter.style.color =
    selectedCount >= rule.max ? "var(--ud-accent)" : "var(--text-light)";
}

function updateModifierDisabledState(groupKey, rule) {
  if (!selectedItem || rule.max <= 1) return;

  const itemEl = document.getElementById(`item-${selectedItem}`);
  const groupEl = itemEl?.querySelector(`.mod-group[data-group="${groupKey}"]`);
  if (!groupEl) return;

  const selectedCount = selectedModifiers[groupKey]?.length || 0;

  groupEl.querySelectorAll(".mod-btn").forEach((button) => {
    if (!button.classList.contains("active") && selectedCount >= rule.max) {
      button.disabled = true;
      button.style.opacity = "0.5";
      button.style.cursor = "not-allowed";
    } else {
      button.disabled = false;
      button.style.opacity = "1";
      button.style.cursor = "pointer";
    }
  });
}

function changeQty(delta) {
  itemQty = Math.max(1, Math.min(10, itemQty + delta));

  if (selectedItem) {
    const input = document.getElementById(`qty-${selectedItem}`);
    if (input) input.value = itemQty;
  }
}

// ===================== VALIDATION =====================
function validateBeforeAdd(item) {
  if (!item) return false;

  if (
    Array.isArray(item.variants) &&
    item.variants.length > 0 &&
    !selectedVariant
  ) {
    showAlert("error", `Please choose an option for ${item.name}.`);
    return false;
  }

  if (item.modifiers) {
    for (const [groupKey, options] of Object.entries(item.modifiers)) {
      if (!Array.isArray(options) || options.length === 0) continue;

      const first = options[0];
      const groupId = first.group_id || groupKey;
      const rule = getGroupRule(groupId, first.group_type);
      const selectedCount = selectedModifiers[groupKey]?.length || 0;

      if (selectedCount < rule.min) {
        showAlert(
          "error",
          `Please select ${rule.min} option(s) for ${readableGroupName(groupKey, first)}.`,
        );
        return false;
      }

      if (selectedCount > rule.max) {
        showAlert(
          "error",
          `Too many selections for ${readableGroupName(groupKey, first)}.`,
        );
        return false;
      }
    }
  }

  return true;
}

// ===================== CART =====================
function addToCart(id) {
  const item = findItem(id);
  if (!item) return;

  if (selectedItem !== id) {
    selectItem(id);
  }

  if (!validateBeforeAdd(item)) return;

  const qtyInput = document.getElementById(`qty-${id}`);
  const qty = qtyInput
    ? Math.max(1, Math.min(10, parseInt(qtyInput.value, 10) || 1))
    : 1;

  const mods = Object.values(selectedModifiers).flat();

  const variantPrice = selectedVariant
    ? Number(selectedVariant.price_delta_cents || 0)
    : 0;

  const modPrice = mods.reduce((sum, mod) => {
    return sum + Number(mod.price_delta_cents ?? mod.price ?? 0);
  }, 0);

  const unitPrice = Number(item.price || 0) + variantPrice + modPrice;
  const totalPrice = unitPrice * qty;

  cart.push({
    id: item.id,
    item_id: item.item_id || item.id,
    name: item.name,

    variant_id: selectedVariant?.variant_id || null,
    variant_name:
      selectedVariant?.variant_name || selectedVariant?.label || null,
    variant_price_delta_cents: variantPrice,

    qty,
    quantity: qty,

    price: Number(item.price || 0),
    unitPrice,
    totalPrice,

    modifiers: mods.map((mod) => ({
      group: mod.group || null,
      group_id: mod.group_id || null,
      group_type: mod.group_type || null,
      code: mod.code || mod.mod_id,
      mod_id: mod.mod_id || mod.code,
      label: mod.label || mod.mod_name,
      mod_name: mod.mod_name || mod.label,
      price: Number(mod.price_delta_cents ?? mod.price ?? 0),
      price_delta_cents: Number(mod.price_delta_cents ?? mod.price ?? 0),
    })),
  });

  if (qtyInput) qtyInput.value = 1;

  document.getElementById(`item-${id}`)?.classList.remove("selected");

  selectedItem = null;
  selectedVariant = null;
  selectedModifiers = {};
  itemQty = 1;

  updateCart();
  showAlert("success", `${item.name} added to your order!`);
}

function removeFromCart(index) {
  cart.splice(index, 1);
  updateCart();
}

function updateCart() {
        const badge = document.getElementById("cartBadge");
        const content = document.getElementById("cartContent");
        const checkoutPanel = document.getElementById("checkoutPanel");

        const esc = (value) =>
          String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        const modPriceLabel = (m) => {
          const price = Number(m.price_delta_cents ?? m.price ?? m.price_cents ?? 0);
          return price > 0 ? ` (+$${formatPrice(price)})` : "";
        };

        const totalQty = cart.reduce((s, i) => s + i.qty, 0);

        if (totalQty === 0) {
          badge.style.display = "none";
          content.innerHTML = `
            <div class="cart-empty">
              <div class="emoji">🛒</div>
              <p>Your cart is empty.<br>Select an item to get started.</p>
            </div>
          `;
          return;
        }

        badge.style.display = "flex";
        badge.textContent = totalQty;
        checkoutPanel.style.display = "block";

        const subtotal = cart.reduce((s, i) => s + i.totalPrice, 0);
        const tax = Math.round(subtotal * 0.0952);
        const grand = subtotal + tax;

        content.innerHTML = `
          ${cart
            .map((item, idx) => {
              const comboMods = item.modifiers.filter(
                (m) =>
                  m.group_key === "combo" ||
                  m.group === "combo" ||
                  String(m.group_id || "").includes("_COMBO"),
              );

              const otherMods = item.modifiers.filter(
                (m) =>
                  !(
                    m.group_key === "combo" ||
                    m.group === "combo" ||
                    String(m.group_id || "").includes("_COMBO")
                  ),
              );

              return `
                <div class="cart-item">
                  <div class="cart-item-info">
                    <h4>${item.qty}x ${esc(item.name)}</h4>

                    ${
                      otherMods.length
                        ? `
                          <div class="cart-mods">
                            ${otherMods
                              .map(
                                (m) =>
                                  `<span class="cart-mod-tag">${esc(m.label || m.mod_name)}${modPriceLabel(m)}</span>`,
                              )
                              .join(" ")}
                          </div>
                        `
                        : ""
                    }

                    ${
                      comboMods.length
                        ? `
                          <div class="cart-combo">
                            🍟 COMBO: ${comboMods
                              .map(
                                (m) =>
                                  `${esc(String(m.label || m.mod_name || "").replace("Add ", ""))} (included)`,
                              )
                              .join(" + ")}
                          </div>
                        `
                        : ""
                    }

                    <div style="font-size:11px;color:var(--text-light);margin-top:4px;">
                      Unit: $${formatPrice(item.unitPrice)} × ${item.qty}
                    </div>
                  </div>

                  <div style="display:flex;align-items:center;gap:12px">
                    <div class="cart-item-price">$${formatPrice(item.totalPrice)}</div>
                    <button onclick="removeFromCart(${idx})" style="background:none;border:none;cursor:pointer;font-size:16px;color:var(--text-light)">🗑️</button>
                  </div>
                </div>
              `;
            })
            .join("")}

          <div style="margin-top:12px;padding-top:12px;border-top:1px solid var(--border);">
            <label style="display:block;font-size:12px;font-weight:600;color:var(--text);margin-bottom:4px;">Special Instructions</label>
            <textarea
              id="cartNotes"
              style="width:100%;padding:8px 10px;border:1.5px solid var(--input-border);border-radius:var(--radius-sm);font-size:13px;font-family:inherit;min-height:60px;resize:vertical;"
              placeholder="Allergies, dietary needs, extra requests..."
            ></textarea>
          </div>

          <div class="cart-totals">
            <div class="total-row">
              <span>Subtotal</span>
              <span>$${formatPrice(subtotal)}</span>
            </div>
            <div class="total-row tax">
              <span>Tax (est. 9.52%)</span>
              <span>$${formatPrice(tax)}</span>
            </div>
            <div class="total-row grand">
              <span>Total</span>
              <span>$${formatPrice(grand)}</span>
            </div>
          </div>

          <div style="margin-top:12px;">
            <button onclick="submitOrder()" class="submit-btn" id="cartCheckoutBtn" style="width:100%;">
              💳 Checkout
            </button>
          </div>
        `;
      }

      function scrollToCart() {
  document
    .getElementById("cartPanel")
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

// ===================== HOURS =====================
function isDeliOpen(pickupTime) {
  if (!pickupTime || pickupTime === "ASAP") {
    return { open: true, message: "ASAP selected." };
  }

  const now = new Date();
  const cst = new Date(
    now.toLocaleString("en-US", { timeZone: HOURS.timezone }),
  );
  const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const today = dayNames[cst.getDay()];
  const hours = HOURS[today];

  if (!hours) return { open: false, message: "Deli is closed today." };

  const [pickupHour, pickupMin] = pickupTime.split(":").map(Number);
  const pickupMinutes = pickupHour * 60 + pickupMin;

  const [openHour, openMin] = hours.open.split(":").map(Number);
  const openMinutes = openHour * 60 + openMin;

  const [closeHour, closeMin] = hours.close.split(":").map(Number);
  const closeMinutes = closeHour * 60 + closeMin;

  const open = pickupMinutes >= openMinutes && pickupMinutes <= closeMinutes;

  return {
    open,
    message: open
      ? "Deli is open."
      : `Deli is closed at ${pickupTime}. Hours: ${hours.open} - ${hours.close}`,
  };
}

function populatePickupTimes() {
  const select =
    document.getElementById("pickupTime") ||
    document.querySelector('select[name="pickup_time"]');

  if (!select) return;

  const now = new Date();
  const cst = new Date(
    now.toLocaleString("en-US", { timeZone: HOURS.timezone }),
  );
  const dayNames = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  const today = dayNames[cst.getDay()];
  const hours = HOURS[today];

  if (!hours) {
    select.innerHTML = '<option value="">Closed today</option>';
    return;
  }

  const [openHour, openMin] = hours.open.split(":").map(Number);
  const [closeHour, closeMin] = hours.close.split(":").map(Number);

  const openMinutes = openHour * 60 + openMin;
  const closeMinutes = closeHour * 60 + closeMin;

  let options = '<option value="ASAP">ASAP</option>';

  for (let mins = openMinutes; mins <= closeMinutes; mins += 15) {
    const hour = Math.floor(mins / 60);
    const min = mins % 60;

    const timeStr = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const displayTime = `${displayHour}:${String(min).padStart(2, "0")} ${ampm}`;

    options += `<option value="${timeStr}">${displayTime}</option>`;
  }

  select.innerHTML = options;
}

// ===================== CHECKOUT =====================
async function handleCheckout(e) {
  if (e?.preventDefault) e.preventDefault();
  return submitOrder();
}

async function submitOrder() {
  const btn =
    document.getElementById("cartCheckoutBtn") ||
    document.getElementById("submitBtn");

  if (cart.length === 0) {
    showAlert("error", "Your cart is empty. Please add at least one item.");
    return;
  }

  const customerName =
    document.querySelector('input[name="name"]')?.value?.trim() || "";

  const email =
    document.querySelector('input[name="email"]')?.value?.trim() || "";

  let phone =
    document.querySelector('input[name="phone"]')?.value?.trim() || "";

  const pickupTime =
    document.querySelector('select[name="pickup_time"]')?.value?.trim() ||
    document.getElementById("pickupTime")?.value?.trim() ||
    "ASAP";

  const specialInstructions =
    document.getElementById("cartNotes")?.value?.trim() ||
    document
      .querySelector('textarea[name="special_instructions"]')
      ?.value?.trim() ||
    "";

  if (!customerName || customerName.length < 2) {
    showAlert("error", "Please enter your full name.");
    document.getElementById("checkoutPanel")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showAlert("error", "Please enter a valid email address.");
    return;
  }

  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    showAlert("error", "Please enter a valid 10-digit phone number.");
    return;
  }
  phone = phoneDigits;

  const hoursCheck = isDeliOpen(pickupTime);
  if (!hoursCheck.open) {
    showAlert("error", hoursCheck.message);
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Sending...';
  }

  const subtotal = cart.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;

  const payload = {
    source: "pickup-order",
    customer: {
      name: customerName,
      email,
      phone,
    },
    items: cart.map((cartItem) => ({
      item_id: cartItem.item_id,
      variant_id: cartItem.variant_id || null,
      name: cartItem.name,
      qty: cartItem.qty,
      base_price_cents: cartItem.price,
      modifiers: cartItem.modifiers.map((modifier) => ({
        mod_id: modifier.mod_id,
        code: modifier.code,
        group_id: modifier.group_id,
        label: modifier.label || modifier.mod_name || "Unknown",
        price_cents: Number(modifier.price_delta_cents || modifier.price || 0),
      })),
    })),
    subtotal_cents: subtotal,
    tax_cents: tax,
    frontend_total_cents: total,
    notes: specialInstructions || "",
    pickup_time: pickupTime || "25-30 mins",
  };

  console.log("Canonical webhook payload:", payload);

  try {
    const response = await fetch(CHECKOUT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    let result;
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      result = await response.json();
    } else {
      const text = await response.text();
      result = {
        success: response.ok,
        ok: response.ok,
        message: text,
      };
    }

    if (!response.ok || result.success === false || result.ok === false) {
      showAlert(
        "error",
        result.message ||
          result.error ||
          "Something went wrong. Please try again or call us.",
      );
      return;
    }

    showConfirmation(
      result.message ||
        "Click the payment link below to complete your order. We'll start preparing your food once payment is completed.",
      result.payment_link || result.square_link || result.payment_url,
    );
  } catch (err) {
    console.error("Checkout error:", err);
    showAlert(
      "error",
      "Could not reach the ordering system. Please try again or call us directly.",
    );
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = "💳 Checkout";
    }
  }
}

// ===================== CONFIRMATION =====================
function showConfirmation(message, squareLink) {
        document.querySelector(".main").style.display = "none";
        document.querySelector(".hero").style.display = "none";

        const existing = document.getElementById("confirmationPage");
        if (existing) existing.remove();

        const esc = (value) =>
          String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

        const modPriceLabel = (m) => {
          const price = Number(m.price_delta_cents ?? m.price ?? m.price_cents ?? 0);
          return price > 0 ? ` (+$${formatPrice(price)})` : "";
        };

        const subtotal = cart.reduce((s, i) => s + i.totalPrice, 0);
        const tax = Math.round(subtotal * 0.0952);
        const grand = subtotal + tax;

        const form = document.getElementById("checkoutForm");
        const customerName =
          form?.querySelector('input[name="name"]')?.value || "";

        const orderItemsHtml = cart
          .map((item) => {
            const comboMods = item.modifiers.filter(
              (m) =>
                m.group_key === "combo" ||
                m.group === "combo" ||
                String(m.group_id || "").includes("_COMBO"),
            );

            const otherMods = item.modifiers.filter(
              (m) =>
                !(
                  m.group_key === "combo" ||
                  m.group === "combo" ||
                  String(m.group_id || "").includes("_COMBO")
                ),
            );

            return `
              <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee;">
                <div style="text-align:left;">
                  <div style="font-weight:600;font-size:14px;">${item.qty}× ${esc(item.name)}</div>

                  ${
                    comboMods.length
                      ? `<div style="color:#AF3D4B;font-size:12px;margin-top:2px;">
                          🍟 COMBO: ${comboMods
                            .map(
                              (m) =>
                                `${esc(String(m.label || m.mod_name || "").replace("Add ", ""))} (included)`,
                            )
                            .join(" + ")}
                        </div>`
                      : ""
                  }

                  ${
                    otherMods.length
                      ? `<div style="color:#6B7280;font-size:12px;margin-top:2px;">
                          ${otherMods
                            .map((m) => `${esc(m.label || m.mod_name)}${modPriceLabel(m)}`)
                            .join(" • ")}
                        </div>`
                      : ""
                  }

                  <div style="font-size:11px;color:#9CA3AF;margin-top:3px;">
                    Unit: $${formatPrice(item.unitPrice)} × ${item.qty}
                  </div>
                </div>

                <span style="font-weight:700;color:#AF3D4B;font-size:14px;white-space:nowrap;">
                  $${formatPrice(item.totalPrice)}
                </span>
              </div>
            `;
          })
          .join("");

        const confirmation = document.createElement("div");
        confirmation.id = "confirmationPage";
        confirmation.innerHTML = `
          <div style="max-width:520px;margin:40px auto;padding:24px;background:#fff;border-radius:14px;box-shadow:0 4px 24px rgba(17,24,39,0.08);">
            <div style="background:linear-gradient(135deg, #590B3F 0%, #7a1a55 50%, #754681 100%);color:white;padding:32px 24px;border-radius:14px 14px 0 0;text-align:center;margin:-24px -24px 24px -24px;">
              <div style="font-size:56px;margin-bottom:12px;">🎉</div>
              <h2 style="font-size:28px;font-weight:800;margin:0 0 8px 0;">We Got You!</h2>
              <p style="font-size:16px;opacity:0.9;margin:0;">We've received your order.</p>
            </div>

            <div style="text-align:center;margin-bottom:20px;">
              <div style="display:inline-block;background:#f5e6d0;color:#590B3F;padding:10px 18px;border-radius:8px;font-weight:700;font-size:14px;">
                📋 Order for ${esc(customerName || "You")}
              </div>
            </div>

            <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee;">
              <span style="color:#6B7280;font-size:14px;">Pickup Time</span>
              <span style="font-weight:600;font-size:14px;">25 - 30 mins</span>
            </div>

            <h3 style="font-size:16px;font-weight:700;color:#590B3F;margin:20px 0 12px 0;">Your Order</h3>
            ${orderItemsHtml}

            <div style="margin-top:16px;padding-top:12px;border-top:2px solid #eee;">
              <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:14px;">
                <span>Subtotal</span>
                <span>$${formatPrice(subtotal)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:4px 0;font-size:14px;color:#6B7280;">
                <span>Tax (9.52%)</span>
                <span>$${formatPrice(tax)}</span>
              </div>
              <div style="display:flex;justify-content:space-between;padding:8px 0;margin-top:8px;border-top:1px solid #eee;font-weight:800;font-size:18px;color:#590B3F;">
                <span>Total</span>
                <span>$${formatPrice(grand)}</span>
              </div>
            </div>

            <div style="text-align:center;margin-top:24px;">
              <p style="font-size:14px;color:#374151;margin-bottom:18px;line-height:1.6;font-weight:600;">
                We got you! Click the payment link below to complete your secure payment.
                Once payment is complete, we will begin preparing your order.
              </p>

              ${
                squareLink
                  ? `<a href="${squareLink}" target="_blank" style="display:inline-block;background:#AF3D4B;color:#fff;padding:16px 40px;border-radius:50px;font-weight:700;font-size:16px;text-decoration:none;transition:all 0.2s;">💳 Complete Payment</a>`
                  : ""
              }

              <p style="font-size:12px;color:#6B7280;margin-top:16px;line-height:1.5;">
                Payment links expire at 2:00 AM CT. Didn't receive the email? Check spam or call us.
              </p>

              <p style="font-size:12px;color:#9CA3AF;">
                Questions? Call us at
                <a href="tel:${BRAND.phone.replace(/[^0-9]/g, "")}" style="color:#590B3F;text-decoration:none;font-weight:600;">${esc(BRAND.phone)}</a>.
              </p>
            </div>
          </div>
        `;

        const footer = document.getElementById("pageFooter");
        if (footer) {
          document.body.insertBefore(confirmation, footer);
        } else {
          document.body.appendChild(confirmation);
        }

        window.scrollTo(0, 0);
      }

      // ===================== ALERTS =====================
function showAlert(type, msg) {
  const el = document.getElementById(
    `alert${type.charAt(0).toUpperCase() + type.slice(1)}`,
  );

  if (!el) {
    console.warn(`${type.toUpperCase()}: ${msg}`);
    return;
  }

  el.textContent = msg;
  el.classList.add("show");

  setTimeout(() => {
    el.classList.remove("show");
  }, 5000);
}

// ===================== HOURS DISPLAY =====================
function checkHours() {
  const now = new Date();
  const cst = new Date(
    now.toLocaleString("en-US", { timeZone: HOURS.timezone }),
  );
  const day = cst.getDay();
  const hour = cst.getHours();
  const min = cst.getMinutes();
  const timeVal = hour * 60 + min;

  const isOpenDay = day >= 1 && day <= 6;
  const isOpen = isOpenDay && timeVal >= 750 && timeVal <= 1170;

  const pill = document.getElementById("hoursPill");
  const text = document.getElementById("hoursText");

  if (!isOpen && pill) {
    pill.classList.add("closed");
    if (text) text.textContent = "Currently Closed · Opens Mon–Sat 12:30 PM";
  }
}

// ===================== INIT =====================
function initOrderForm() {
  if (typeof window.MENU === "undefined") {
    console.error(
      "MENU is not loaded. Make sure menu-data.js is loaded before order-form.js.",
    );
    return;
  }

  renderMenu();
  checkHours();
  populatePickupTimes();

  const form =
    document.getElementById("checkoutForm") || document.querySelector("form");

  if (form && form.tagName === "FORM") {
    form.addEventListener("submit", handleCheckout);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initOrderForm);
} else {
  initOrderForm();
}
