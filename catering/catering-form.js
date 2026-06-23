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
    { id: 'street-corn', name: 'Street Corn Taco Bowl', calories: 470, price: 1200, photo: '', icon: '🌮', desc: 'Cilantro lime rice, chipotle lentil taco crumble, roasted corn, black beans, pickled onions, chipotle crema' },
    { id: 'nashville-hot', name: 'Nashville Hot Lentil Bowl', calories: 480, price: 1200, photo: '', icon: '🌶️', desc: 'Garlic rice, Nashville hot lentils, roasted broccoli, ranch drizzle' },
    { id: 'mediterranean', name: 'Mediterranean Harvest Bowl', calories: 500, price: 1200, photo: 'images/meal-mediterranean-harvest.jpg', icon: '🥗', desc: 'Lemon herb quinoa, crispy oregano chickpeas, cucumber tomato salad, hummus, tahini drizzle, pickled red onion' },
    { id: 'thai-peanut', name: 'Thai Peanut Crunch Bowl', calories: 490, price: 1200, photo: 'images/meal-thai-peanut-crunch.jpg', icon: '🥜', desc: 'Jasmine rice, crispy peanut tofu, sesame cabbage slaw, sweet chili peanut drizzle' },
    { id: 'cajun-red-beans', name: 'Cajun Red Beans & Dirty Rice Bowl', calories: 460, price: 1200, photo: '', icon: '🍛', desc: 'Dirty rice, Cajun beans, peppers & onions, green onion garnish' },
    { id: 'bbq-potato', name: 'Loaded BBQ Potato Bowl', calories: 510, price: 1200, photo: '', icon: '🥔', desc: 'Roasted potatoes, BBQ lentil crumble, broccoli, smoked cheeze sauce, green onions' },
    { id: 'eggplant-parm', name: 'Eggplant Parmesan', calories: 530, price: 1200, photo: 'images/meal-eggplant-parm.jpg', icon: '🍆', desc: 'Parmesan crusted eggplant layered with fragrant homemade marinara sauce, topped with fresh basil' }
  ];

  const DESSERTS = [
    { id: 'mango-chia', name: 'Mango Chia Seed Pudding', calories: 280, price: 600, photo: 'images/dessert-mango-chia.jpg', icon: '🥭', desc: 'Creamy mango chia pudding made with coconut milk and fresh mango' },
    { id: 'raspberry-mousse', name: 'Raspberry Dark Chocolate Mousse', calories: 340, price: 600, photo: 'images/dessert-raspberry-mousse.jpg', icon: '🍫', desc: 'Rich dark chocolate mousse topped with fresh raspberries — sugar free' },
    { id: 'apple-pie', name: 'Apple Pie', calories: 310, price: 600, photo: 'images/apple-pie.jpg', icon: '🍎', desc: 'Classic spiced apple pie — sugar free' }
  ];

  const DRINKS = [
    { id: 'cold-pressed-juice', name: 'Fresh Cold-Pressed Juice', calories: 120, price: 500, photo: 'images/cold_pressed_juice_v2.jpg', desc: '10 oz — Pineapple, Honeycrisp Apple, Lemon' }
  ];

  const MEALS_PER_PACKAGE = 7;
  const LABOR_FEE = 5000; // $50.00 in cents
  const TAX_RATE = 0.0952;
  let mpCart = {}; // meal/dessert id -> qty (now just 0/1 toggle per meal type)

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

    // Render meals with icon or photo
    MEALS.forEach(function(meal) {
      const card = document.createElement('div');
      card.className = 'meal-card';
      card.id = 'meal-' + meal.id;
      var imgHtml;
      if (meal.photo && meal.photo.trim() !== '') {
        imgHtml = '<img src="' + meal.photo + '" alt="' + meal.name + '" loading="lazy">';
      } else {
        imgHtml = '<img src="images/meal-placeholder.png" alt="' + meal.name + '" loading="lazy" style="height:180px;object-fit:cover;">';
      }
      card.innerHTML =
        imgHtml +
        '<div class="meal-card-body">' +
          '<h3>' + meal.name + '</h3>' +
          '<div class="cal">' + meal.calories + ' cal · ' + meal.desc + '</div>' +
          '<div class="price">$12.00 per meal</div>' +
        '</div>';
      mealGrid.appendChild(card);
    });

    // Render add-ons (dessert + juice) in single-item grid
    const addonGrid = document.getElementById('addon-grid');
    if (addonGrid) {
      [...DESSERTS, ...DRINKS].forEach(function(item) {
        const card = document.createElement('div');
        card.className = 'meal-card addon-card';
        card.id = 'addon-' + item.id;
        var imgHtml;
        if (item.photo && item.photo.trim() !== '') {
          imgHtml = '<img src="' + item.photo + '" alt="' + item.name + '" loading="lazy">';
        } else {
          imgHtml = '<img src="images/dessert-placeholder.png" alt="' + item.name + '" loading="lazy" style="height:160px;object-fit:cover;">';
        }
        card.innerHTML =
          imgHtml +
          '<div class="meal-card-body">' +
            '<h3>' + item.name + '</h3>' +
            '<div class="cal">' + item.calories + ' cal \u00b7 ' + item.desc + '</div>' +
            '<div class="price">$' + (item.price / 100).toFixed(2) + ' each</div>' +
            '<div class="meal-qty">' +
              '<button onclick="updateAddonQty(\'' + item.id + '\', -1)">\u2212</button>' +
              '<span id="addon-qty-' + item.id + '">0</span>' +
              '<button onclick="updateAddonQty(\'' + item.id + '\', 1)">+</button>' +
            '</div>' +
          '</div>';
        addonGrid.appendChild(card);
      });
    }

    updateMPTotals();
  }

  window.addWeeklyPackage = function() {
    // Add one complete set of all meals
    const currentSets = mpCart['weekly_sets'] || 0;
    mpCart['weekly_sets'] = currentSets + 1;
    updateMPTotals();
  };

  window.removeWeeklyPackage = function() {
    const currentSets = mpCart['weekly_sets'] || 0;
    if (currentSets > 0) {
      if (currentSets === 1) {
        delete mpCart['weekly_sets'];
      } else {
        mpCart['weekly_sets'] = currentSets - 1;
      }
    }
    updateMPTotals();
  };

  window.updateAddonQty = function(id, delta) {
    const current = mpCart[id] || 0;
    const next = Math.max(0, current + delta);
    if (next === 0) {
      delete mpCart[id];
    } else {
      mpCart[id] = next;
    }
    // Update display
    const qtyEl = document.getElementById('addon-qty-' + id);
    if (qtyEl) qtyEl.textContent = next;
    updateMPTotals();
  };

  function updateMPTotals() {
    const totalsDiv = document.getElementById('mp-totals');
    const rowsDiv = document.getElementById('mp-totals-rows');
    const checkoutDiv = document.getElementById('mp-checkout');
    const weeklyQtyEl = document.getElementById('weekly-package-qty');
    const dessertQtyEl = document.getElementById('dessert-package-qty');

    const weeklySets = mpCart['weekly_sets'] || 0;

    // Sum individual add-on quantities
    let addonQty = 0;
    let addonSubtotal = 0;
    [...DESSERTS, ...DRINKS].forEach(function(item) {
      const qty = mpCart[item.id] || 0;
      if (qty > 0) {
        addonQty += qty;
        addonSubtotal += qty * item.price;
      }
    });

    // Update the displayed quantities
    if (weeklyQtyEl) weeklyQtyEl.textContent = weeklySets;

    const totalItems = weeklySets + addonQty;

    // Must have at least 1 weekly set to enable addons
    const hasMealSet = weeklySets > 0;
    // Show/hide addon section based on meal set selection
    const addonSection = document.getElementById('addon-section');
    if (addonSection) {
      addonSection.style.display = hasMealSet ? 'block' : 'none';
    }

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

    // Calculate based on weekly sets
    if (weeklySets > 0) {
      // Each weekly set = all 6 meals (1 of each type) at $12 each
      const weeklySubtotal = weeklySets * MEALS.length * MEALS[0].price;
      subtotal += weeklySubtotal;
      rows += '<div class="totals-row"><span>Weekly Meal Prep (' + weeklySets + ' set' + (weeklySets > 1 ? 's' : '') + ')</span><span>$' + (weeklySubtotal / 100).toFixed(2) + '</span></div>';
    }

    // Individual add-ons (desserts + drinks)
    [...DESSERTS, ...DRINKS].forEach(function(item) {
      const qty = mpCart[item.id] || 0;
      if (qty > 0) {
        const lineTotal = qty * item.price;
        subtotal += lineTotal;
        rows += '<div class="totals-row"><span>' + item.name + ' (' + qty + ')</span><span>$' + (lineTotal / 100).toFixed(2) + '</span></div>';
      }
    });

    // Labor: static $50 if any meal set ordered; $0 otherwise
    const labor = hasMealSet ? LABOR_FEE : 0;
    const tax = Math.round((subtotal + labor) * TAX_RATE);
    const total = subtotal + labor + tax;

    if (labor > 0) {
      rows += '<div class="totals-row"><span>Labor & Packaging</span><span>$' + (labor / 100).toFixed(2) + '</span></div>';
    }
    rows += '<div class="totals-row"><span>Tax (9.52%)</span><span>$' + (tax / 100).toFixed(2) + '</span></div>';
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
    let packageCount = 0;

    const weeklySets = mpCart['weekly_sets'] || 0;

    // Each weekly set = all 6 meals (1 of each type)
    if (weeklySets > 0) {
      packageCount += weeklySets;
      MEALS.forEach(function(meal) {
        // Each set includes 1 of each meal type
        const lineTotal = weeklySets * meal.price;
        subtotal += lineTotal;
        lineItems.push({ 
          id: meal.id, 
          name: meal.name, 
          qty: weeklySets, // Number of each meal type ordered
          price: meal.price, 
          calories: meal.calories, 
          category: 'meal' 
        });
      });
    }

    // Individual add-ons (desserts + drinks)
    [...DESSERTS, ...DRINKS].forEach(function(item) {
      const qty = mpCart[item.id] || 0;
      if (qty > 0) {
        const lineTotal = qty * item.price;
        subtotal += lineTotal;
        lineItems.push({ 
          id: item.id, 
          name: item.name, 
          qty: qty, 
          price: item.price, 
          calories: item.calories, 
          category: item.id === 'raspberry-mousse' ? 'dessert' : 'drink'
        });
      }
    });

    // Labor: static $50 if any meal set ordered; $0 otherwise
    const labor = weeklySets > 0 ? LABOR_FEE : 0;
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
