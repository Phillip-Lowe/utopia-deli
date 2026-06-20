/**
 * Utopia Deli — Catering/Event Lead Form Handler
 * Posts to n8n webhook for scoring + automated response
 */

(function() {
  'use strict';

  // ===== HANDLE RETURN FROM SQUARE PAYMENT =====
  const urlParams = new URLSearchParams(window.location.search);
  const mpSuccess = urlParams.get('mp_success');
  const orderId = urlParams.get('order');

  if (mpSuccess === '1') {
    // Show success state immediately
    document.addEventListener('DOMContentLoaded', function() {
      const mealPrepSection = document.getElementById('meal-prep');
      if (mealPrepSection) {
        // Hide meal prep ordering UI
        document.getElementById('meal-grid').style.display = 'none';
        document.getElementById('dessert-grid').style.display = 'none';
        document.querySelector('.dessert-section') && (document.querySelector('.dessert-section').style.display = 'none');
        document.getElementById('mp-cta').style.display = 'none';
        document.getElementById('mp-totals').style.display = 'none';
        document.getElementById('mp-checkout').style.display = 'none';
        document.getElementById('mp-deadline').style.display = 'none';
        document.querySelector('.meal-prep-header').style.display = 'none';
        // Show success
        document.getElementById('mp-success').classList.add('active');
        // Update order ID if available
        if (orderId) {
          const orderIdEl = document.getElementById('mp-order-id');
          const orderIdBox = document.getElementById('mp-order-id-box');
          if (orderIdEl) orderIdEl.textContent = orderId;
          if (orderIdBox) orderIdBox.style.display = 'block';
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  // ===== CONFIG =====
  const CATERING_WEBHOOK = 'https://utopia-api.systack.net/webhook/utopia-deli-catering-v2';
  const CHECKOUT_WEBHOOK = 'https://utopia-api.systack.net/webhook/utopia-deli-order-v4';
  const MIN_HEADCOUNT = 10;
  const MIN_LEAD_DAYS = 3;

  // ===== MEAL PREP DATA =====
  const MEALS = [
    { id: 'buffalo-chickpea', name: 'Buffalo Chickpea Ranch Bowl', calories: 490, price: 1200, photo: 'images/meal-buffalo-chickpea.jpg', desc: 'Crispy buffalo chickpeas with ranch drizzle over rice and greens' },
    { id: 'teriyaki-tofu', name: 'Teriyaki Tofu Bowl', calories: 480, price: 1200, photo: 'images/meal-teriyaki-tofu.jpg', desc: 'Sweet teriyaki glazed tofu with steamed broccoli and rice' },
    { id: 'red-lentil-masala', name: 'Red Lentil Coconut Masala', calories: 510, price: 1200, photo: 'images/meal-red-lentil-masala.jpg', desc: 'Spiced red lentil curry with coconut milk, tomatoes, ginger, and basmati rice' },
    { id: 'peanut-ginger', name: 'Peanut Ginger Bowl', calories: 500, price: 1200, photo: 'images/meal-peanut-ginger.jpg', desc: 'Tofu and fresh slaw with rich peanut ginger sauce over steamed rice' },
    { id: 'cajun-northern-beans', name: 'Cajun Northern Beans & Rice', calories: 470, price: 1200, photo: 'images/meal-cajun-northern-beans.jpg', desc: 'Smoky Cajun-spiced northern beans with peppers and seasoned rice' },
    { id: 'rainbow-bbq-tofu', name: 'Rainbow BBQ Tofu Wild Rice', calories: 520, price: 1200, photo: 'images/meal-rainbow-bbq-tofu.jpg', desc: 'BBQ glazed tofu with wild rice, snap peas, carrots, and cashews' }
  ];

  const DESSERTS = [
    { id: 'raspberry-mousse', name: 'Raspberry Dark Chocolate Mousse', calories: 340, price: 600, photo: 'images/dessert-raspberry-mousse.jpg', desc: 'Rich dark chocolate mousse topped with fresh raspberries' }
  ];

  const LABOR_FEE = 5000; // $50.00 in cents
  const TAX_RATE = 0.065;
  let mpCart = {}; // meal/dessert id -> qty

  // ===== STATE =====
  let currentStep = 1;
  const totalSteps = 5;
  let isSubmitting = false;
  let mpSubmitting = false;

  // ===== MEAL PREP INIT =====
  function initMealPrep() {
    const mealGrid = document.getElementById('meal-grid');
    const dessertGrid = document.getElementById('dessert-grid');
    if (!mealGrid) return;

    // Render meals
    MEALS.forEach(function(meal) {
      const card = document.createElement('div');
      card.className = 'meal-card';
      card.id = 'meal-' + meal.id;
      card.innerHTML =
        '<img src="' + meal.photo + '" alt="' + meal.name + '" loading="lazy">' +
        '<div class="meal-card-body">' +
          '<h3>' + meal.name + '</h3>' +
          '<div class="cal">' + meal.calories + ' cal \u00b7 ' + meal.desc + '</div>' +
          '<div class="price">$' + (meal.price / 100).toFixed(2) + '</div>' +
          '<div class="meal-qty">' +
            '<button onclick="setMealQty(\'' + meal.id + '\', -1)">-</button>' +
            '<span id="qty-' + meal.id + '">0</span>' +
            '<button onclick="setMealQty(\'' + meal.id + '\', 1)">+</button>' +
          '</div>' +
        '</div>';
      mealGrid.appendChild(card);
    });

    // Render desserts
    if (dessertGrid) {
      DESSERTS.forEach(function(dessert) {
        const card = document.createElement('div');
        card.className = 'meal-card dessert-card';
        card.id = 'meal-' + dessert.id;
        card.innerHTML =
          '<img src="' + dessert.photo + '" alt="' + dessert.name + '" loading="lazy">' +
          '<div class="meal-card-body">' +
            '<h3>' + dessert.name + '</h3>' +
            '<div class="cal">' + dessert.calories + ' cal \u00b7 ' + dessert.desc + '</div>' +
            '<div class="price">$' + (dessert.price / 100).toFixed(2) + '</div>' +
            '<div class="meal-qty">' +
              '<button onclick="setMealQty(\'' + dessert.id + '\', -1)">-</button>' +
              '<span id="qty-' + dessert.id + '">0</span>' +
              '<button onclick="setMealQty(\'' + dessert.id + '\', 1)">+</button>' +
            '</div>' +
          '</div>';
        dessertGrid.appendChild(card);
      });
    }

    updateMPTotals();
  }

  window.setMealQty = function(id, delta) {
    const current = mpCart[id] || 0;
    const next = Math.max(0, current + delta);
    if (next === 0) {
      delete mpCart[id];
    } else {
      mpCart[id] = next;
    }
    const qtyEl = document.getElementById('qty-' + id);
    if (qtyEl) qtyEl.textContent = next;
    const cardEl = document.getElementById('meal-' + id);
    if (cardEl) cardEl.classList.toggle('selected', next > 0);
    updateMPTotals();
  };

  function updateMPTotals() {
    const totalsDiv = document.getElementById('mp-totals');
    const rowsDiv = document.getElementById('mp-totals-rows');
    const checkoutDiv = document.getElementById('mp-checkout');

    const totalItems = Object.values(mpCart).reduce(function(a, b) { return a + b; }, 0);

    if (totalItems === 0) {
      totalsDiv.style.display = 'none';
      checkoutDiv.style.display = 'none';
      document.getElementById('mp-cta').style.display = 'block';
      return;
    }

    totalsDiv.style.display = 'block';
    checkoutDiv.style.display = 'block';
    document.getElementById('mp-cta').style.display = 'none';

    let subtotal = 0;
    let rows = '';

    // Meals
    MEALS.forEach(function(meal) {
      const qty = mpCart[meal.id];
      if (qty) {
        const lineTotal = qty * meal.price;
        subtotal += lineTotal;
        rows += '<div class="totals-row"><span>' + meal.name + ' \u00d7 ' + qty + '</span><span>$' + (lineTotal / 100).toFixed(2) + '</span></div>';
      }
    });

    // Desserts
    DESSERTS.forEach(function(dessert) {
      const qty = mpCart[dessert.id];
      if (qty) {
        const lineTotal = qty * dessert.price;
        subtotal += lineTotal;
        rows += '<div class="totals-row"><span>' + dessert.name + ' \u00d7 ' + qty + '</span><span>$' + (lineTotal / 100).toFixed(2) + '</span></div>';
      }
    });

    const labor = LABOR_FEE;
    const tax = Math.round((subtotal + labor) * TAX_RATE);
    const total = subtotal + labor + tax;

    rows += '<div class="totals-row"><span>Labor \u0026 Packaging</span><span>$50.00</span></div>';
    rows += '<div class="totals-row"><span>Tax (6.5%)</span><span>$' + (tax / 100).toFixed(2) + '</span></div>';
    rows += '<div class="totals-row"><span>Total</span><span>$' + (total / 100).toFixed(2) + '</span></div>';

    rowsDiv.innerHTML = rows;
  }

  window.submitMealPrep = function() {
    if (mpSubmitting) return;

    const name = document.getElementById('mp-name').value.trim();
    const phone = document.getElementById('mp-phone').value.trim();
    const email = document.getElementById('mp-email').value.trim();
    const pickup = document.getElementById('mp-pickup').value;
    const notes = document.getElementById('mp-notes').value.trim();

    if (!name || !phone || !email) {
      alert('Please fill in your name, phone, and email.');
      return;
    }

    const phoneDigits = phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRe.test(email)) {
      alert('Please enter a valid email address.');
      return;
    }

    mpSubmitting = true;
    const btn = document.getElementById('mp-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Processing...';

    // Build line items from cart
    let subtotal = 0;
    const lineItems = [];

    MEALS.forEach(function(meal) {
      const qty = mpCart[meal.id];
      if (qty) {
        const lineTotal = qty * meal.price;
        subtotal += lineTotal;
        lineItems.push({ id: meal.id, name: meal.name, qty: qty, price: meal.price, calories: meal.calories, category: 'meal' });
      }
    });

    DESSERTS.forEach(function(dessert) {
      const qty = mpCart[dessert.id];
      if (qty) {
        const lineTotal = qty * dessert.price;
        subtotal += lineTotal;
        lineItems.push({ id: dessert.id, name: dessert.name, qty: qty, price: dessert.price, calories: dessert.calories, category: 'dessert' });
      }
    });

    const labor = LABOR_FEE;
    const tax = Math.round((subtotal + labor) * TAX_RATE);
    const total = subtotal + labor + tax;

    const payload = {
      source: 'meal-prep',
      timestamp: new Date().toISOString(),
      customer: { name: name, phone: phoneDigits, email: email, pickup_time: pickup, notes: notes },
      items: lineItems,
      pricing: { subtotal: subtotal, labor: labor, tax: tax, total: total }
    };

    fetch(CHECKOUT_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      // Check if we got a payment link back
      if (data.payment_link) {
        // Redirect to Square payment page
        window.location.href = data.payment_link;
      } else if (data.ok && data.square_link) {
        // Fallback for older response format
        window.location.href = data.square_link;
      } else {
        // No payment link — show error
        throw new Error(data.message || 'No payment link received');
      }
    })
    .catch(function(err) {
      console.error('Meal prep submit error:', err);
      alert('Something went wrong: ' + err.message + '. Please try again or call us at (501) 551-5944.');
      mpSubmitting = false;
      btn.disabled = false;
      btn.textContent = 'Pay & Place Order';
    });
  };

  // ===== STEP NAVIGATION =====
  window.nextStep = function(step) {
    if (!validateStep(currentStep)) return;
    
    document.getElementById('step-' + currentStep).classList.remove('active');
    document.querySelector('.progress-step[data-step="' + currentStep + '"]').classList.remove('active');
    document.querySelector('.progress-step[data-step="' + currentStep + '"]').classList.add('completed');
    
    currentStep = step;
    document.getElementById('step-' + currentStep).classList.add('active');
    document.querySelector('.progress-step[data-step="' + currentStep + '"]').classList.add('active');
    
    if (currentStep === 5) updateSummary();
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.prevStep = function(step) {
    document.getElementById('step-' + currentStep).classList.remove('active');
    document.querySelector('.progress-step[data-step="' + currentStep + '"]').classList.remove('active');
    
    currentStep = step;
    document.getElementById('step-' + currentStep).classList.add('active');
    document.querySelector('.progress-step[data-step="' + currentStep + '"]').classList.remove('completed');
    document.querySelector('.progress-step[data-step="' + currentStep + '"]').classList.add('active');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ===== VALIDATION =====
  function validateStep(step) {
    let valid = true;
    const fields = document.querySelectorAll('#step-' + step + ' [id]');
    
    fields.forEach(function(field) {
      const errorMsg = field.parentElement.querySelector('.error-msg');
      if (!errorMsg) return;
      
      let fieldValid = true;
      
      // Required check
      if (field.tagName === 'SELECT' || field.tagName === 'INPUT' || field.tagName === 'TEXTAREA') {
        if (field.hasAttribute('required') || field.parentElement.querySelector('label .required')) {
          if (!field.value.trim()) fieldValid = false;
        }
      }
      
      // Specific validations
      switch(field.id) {
        case 'event_date':
          const minDate = new Date();
          minDate.setDate(minDate.getDate() + MIN_LEAD_DAYS);
          const selectedDate = new Date(field.value);
          if (selectedDate < minDate) {
            fieldValid = false;
            errorMsg.textContent = 'Please select a date at least ' + MIN_LEAD_DAYS + ' days from today';
          }
          break;
          
        case 'headcount':
          // Always valid since it's a select with constrained options
          break;
          
        case 'coord_phone':
          const coordPhoneDigits = field.value.replace(/\D/g, '');
          if (coordPhoneDigits.length < 10) {
            fieldValid = false;
            errorMsg.textContent = 'Please enter a valid 10-digit phone number';
          }
          break;
          
        case 'coord_email':
          const coordEmailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!coordEmailRe.test(field.value)) {
            fieldValid = false;
            errorMsg.textContent = 'Please enter a valid email address';
          }
          break;
          
        case 'agree_terms':
          if (!field.checked) {
            fieldValid = false;
            errorMsg.textContent = 'Please agree to the terms to continue';
          }
          break;
      }
      
      if (!fieldValid) {
        field.classList.add('error');
        errorMsg.classList.add('show');
        valid = false;
      } else {
        field.classList.remove('error');
        errorMsg.classList.remove('show');
      }
    });
    
    return valid;
  }

  // ===== UPDATE SUMMARY =====
  function updateSummary() {
    const getVal = function(id) {
      const el = document.getElementById(id);
      return el ? el.value : '';
    };
    
    const headcountMap = {
      '10-20': '10\u201320', '21-40': '21\u201340', '41-60': '41\u201360',
      '61-100': '61\u2013100', '101-150': '101\u2013150', '151-250': '151\u2013250', '250+': '250+'
    };
    
    const budgetMap = {
      'lt300': '<$300', '300-600': '$300\u2013$600', '600-1200': '$600\u2013$1,200',
      '1200-2500': '$1,200\u2013$2,500', 'gt2500': '$2,500+', 'quote': 'Need quote'
    };
    
    const distanceMap = {
      'lt5': '< 5 miles', '5-15': '5\u201315 miles', '15-30': '15\u201330 miles',
      'gt30': '> 30 miles', 'unknown': 'Not sure'
    };
    
    const serviceMap = {
      'drop-off': 'Drop-off (self-serve)',
      'staffed-buffet': 'Staffed buffet',
      'plated': 'Plated / table service',
      'undecided': 'Not sure \u2014 need guidance'
    };
    
    const summaryHTML = 
      '<div class="summary-row"><span class="label">Event</span><span class="value">' + getVal('event_name') + '</span></div>' +
      '<div class="summary-row"><span class="label">Date & Time</span><span class="value">' + formatDate(getVal('event_date')) + ' at ' + formatTime(getVal('event_time')) + '</span></div>' +
      '<div class="summary-row"><span class="label">Headcount</span><span class="value">' + (headcountMap[getVal('headcount')] || getVal('headcount')) + ' people</span></div>' +
      '<div class="summary-row"><span class="label">Venue</span><span class="value">' + getVal('venue_name') + '</span></div>' +
      '<div class="summary-row"><span class="label">Budget</span><span class="value">' + (budgetMap[getVal('budget_range')] || getVal('budget_range')) + '</span></div>' +
      '<div class="summary-row"><span class="label">Coordinator</span><span class="value">' + getVal('coord_name') + ' (' + getVal('coord_phone') + ')</span></div>' +
      '<div class="summary-row"><span class="label">Service Style</span><span class="value">' + (serviceMap[getVal('service_style')] || getVal('service_style')) + '</span></div>';
    
    document.getElementById('summary-content').innerHTML = summaryHTML;
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatTime(timeStr) {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return displayHour + ':' + m + ' ' + ampm;
  }

  // ===== GET CHECKBOX VALUES =====
  function getCheckedValues(namePrefix) {
    const checked = [];
    document.querySelectorAll('input[type="checkbox"][id^="' + namePrefix + '"]').forEach(function(cb) {
      if (cb.checked) checked.push(cb.value);
    });
    return checked;
  }

  // ===== SUBMIT CATERING FORM =====
  window.submitCatering = function() {
    if (isSubmitting) return;
    
    if (!validateStep(currentStep)) return;
    
    isSubmitting = true;
    const btn = document.getElementById('submit-btn');
    btn.disabled = true;
    btn.textContent = 'Sending...';
    
    const getVal = function(id) {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };
    
    const getChecked = function(name) {
      const els = document.querySelectorAll('input[name="' + name + '"]:checked');
      return Array.from(els).map(function(el) { return el.value; });
    };
    
    const now = new Date();
    const pad = function(n) { return n < 10 ? '0' + n : n; };
    const timestamp = now.getFullYear() + '-' + pad(now.getMonth()+1) + '-' + pad(now.getDate()) + ' ' + 
                     pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
    
    // Build payload
    const formData = {
      timestamp: timestamp,
      event_name: getVal('event_name'),
      event_type: getVal('event_type'),
      event_date: getVal('event_date'),
      event_time: getVal('event_time'),
      event_duration: getVal('event_duration'),
      setup_time: getVal('setup_time'),
      headcount: getVal('headcount'),
      venue_name: getVal('venue_name'),
      venue_address: getVal('venue_address'),
      coord_name: getVal('coord_name'),
      coord_phone: getVal('coord_phone').replace(/\D/g, ''),
      coord_email: getVal('coord_email'),
      service_style: getVal('service_style'),
      budget_range: getVal('budget_range'),
      notes: getVal('notes'),
      terms_agreed: document.getElementById('agree_terms').checked ? 'yes' : 'no',
      utensils_needed: document.getElementById('need_utensils').checked ? 'yes' : 'no',
      eco_friendly: document.getElementById('eco_friendly').checked ? 'yes' : 'no',
      protein_prefs: getChecked('protein_pref'),
      menu_items: getChecked('menu_item')
    };
    
    // Check for internet
    if (!navigator.onLine) {
      alert('No internet connection. Please check your connection and try again.');
      isSubmitting = false;
      btn.disabled = false;
      btn.textContent = 'Submit Request';
      return;
    }
    
    fetch(CATERING_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    .then(function(response) {
      if (!response.ok) throw new Error('Server returned ' + response.status);
      return response.text();
    })
    .then(function(text) {
      // Show success
      document.getElementById('submit-btn').style.display = 'none';
      document.getElementById('step-5').style.display = 'none';
      document.querySelector('.progress-bar').style.display = 'none';
      document.querySelector('.summary-card').style.display = 'none';
      document.getElementById('success-state').classList.add('active');
      
      // Clear form
      document.querySelectorAll('input, select, textarea').forEach(function(el) {
        if (el.type === 'checkbox' || el.type === 'radio') el.checked = false;
        else if (el.type !== 'hidden') el.value = '';
      });
      
      window.scrollTo({ top: 0, behavior: 'smooth' });
    })
    .catch(function(error) {
      console.error('Submission error:', error);
      
      document.getElementById('error-state').textContent = 'Something went wrong. Please check your connection and try again, or call us at (501) 551-5944.';
      document.getElementById('error-state').classList.add('show');
      
      isSubmitting = false;
      btn.disabled = false;
      btn.textContent = 'Submit Request';
    });
  };

  // ===== INIT =====
  document.addEventListener('DOMContentLoaded', function() {
    initMealPrep();
    
    // Set minimum date for event date picker
    const eventDateInput = document.getElementById('event_date');
    if (eventDateInput) {
      const today = new Date();
      today.setDate(today.getDate() + MIN_LEAD_DAYS);
      eventDateInput.min = today.toISOString().split('T')[0];
    }
  });

})();
