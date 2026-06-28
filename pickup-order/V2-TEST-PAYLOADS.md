# Utopia Deli V2 Backend Test Plan

## Test Payloads for 7 Required Order Paths

### 1. Cowboy + Plain Fries Combo
```json
{
  "items": [
    {
      "item_id": "COWBOY",
      "qty": 1,
      "modifiers": [
        { "mod_id": "C_COMBO_FRIES", "group_id": "COW_COMBO", "group_type": "ADD", "mod_name": "plain fries", "price_delta_cents": 500 }
      ]
    }
  ],
  "customer": { "name": "Test Customer", "email": "test@example.com", "phone": "501-555-0100" },
  "pickup_time": "ASAP",
  "notes": "Test order: Cowboy + combo fries"
}
```
**Expected:** 
- Line 1: cowboy chikn sandwich ($13.00)
- Line 2: Combo plain fries ($5.00)
- Tax: $1.71 (9.52%)
- Total: $19.71

---

### 2. Philly + Required Protein + Combo
```json
{
  "items": [
    {
      "item_id": "PHILLY",
      "qty": 1,
      "modifiers": [
        { "mod_id": "P_CHIKN", "group_id": "PHILLY_PROTEIN", "group_type": "REQUIRED", "mod_name": "chik'n", "price_delta_cents": 0 },
        { "mod_id": "P_COMBO_FRIES", "group_id": "PHILLY_COMBO", "group_type": "ADD", "mod_name": "plain fries", "price_delta_cents": 500 }
      ]
    }
  ],
  "customer": { "name": "Test Customer", "email": "test@example.com", "phone": "501-555-0100" },
  "pickup_time": "ASAP"
}
```
**Expected:** 
- Line 1: philly sub + chik'n ($13.00)
- Line 2: Combo plain fries ($5.00)
- Tax: $1.71
- Total: $19.71

---

### 3. Fries + Required Style (Plain)
```json
{
  "items": [
    {
      "item_id": "FRIES",
      "qty": 1,
      "modifiers": [
        { "mod_id": "FRIES_PLAIN", "group_id": "FRIES_STYLE", "group_type": "REQUIRED", "mod_name": "plain fries", "price_delta_cents": 0 }
      ]
    }
  ],
  "customer": { "name": "Test Customer", "email": "test@example.com", "phone": "501-555-0100" },
  "pickup_time": "ASAP"
}
```
**Expected:** 
- Line 1: fries plain ($5.00)
- Tax: $0.48
- Total: $5.48

---

### 4. Fries + Loaded Style (Bac'n)
```json
{
  "items": [
    {
      "item_id": "FRIES",
      "qty": 1,
      "modifiers": [
        { "mod_id": "FRIES_BACN", "group_id": "FRIES_STYLE", "group_type": "REQUIRED", "mod_name": "loaded fries — bac'n", "price_delta_cents": 800 }
      ]
    }
  ],
  "customer": { "name": "Test Customer", "email": "test@example.com", "phone": "501-555-0100" },
  "pickup_time": "ASAP"
}
```
**Expected:** 
- Line 1: fries loaded bac'n ($13.00)
- Tax: $1.24
- Total: $14.24

---

### 5. Juice + Flavor + 10oz Size
```json
{
  "items": [
    {
      "item_id": "JUICE_CP",
      "qty": 1,
      "modifiers": [
        { "mod_id": "JFLAV_GREEN", "group_id": "JUICE_FLAVOR", "group_type": "REQUIRED", "mod_name": "green juice", "price_delta_cents": 0 },
        { "mod_id": "JSIZE_10OZ", "group_id": "JUICE_SIZE", "group_type": "REQUIRED", "mod_name": "10 oz plastic bottle", "price_delta_cents": 0 }
      ]
    }
  ],
  "customer": { "name": "Test Customer", "email": "test@example.com", "phone": "501-555-0100" },
  "pickup_time": "ASAP"
}
```
**Expected:** 
- Line 1: fresh cold-pressed juice ($5.00)
- Tax: $0.48
- Total: $5.48

---

### 6. Poppers + Sauce + Combo
```json
{
  "items": [
    {
      "item_id": "POPPERS",
      "qty": 1,
      "modifiers": [
        { "mod_id": "POP_BUFFALO", "group_id": "POP_SAUCE", "group_type": "ADD", "mod_name": "buffalo", "price_delta_cents": 0 },
        { "mod_id": "POP_COMBO_FRIES", "group_id": "POP_COMBO", "group_type": "ADD", "mod_name": "plain fries", "price_delta_cents": 500 }
      ]
    }
  ],
  "customer": { "name": "Test Customer", "email": "test@example.com", "phone": "501-555-0100" },
  "pickup_time": "ASAP"
}
```
**Expected:** 
- Line 1: chikn poppers + buffalo ($10.00)
- Line 2: Combo plain fries ($5.00)
- Tax: $1.43
- Total: $16.43

---

### 7. Rocktown Sliders + Takeoff + Combo
```json
{
  "items": [
    {
      "item_id": "ROCKTOWN_SLIDERS",
      "qty": 1,
      "modifiers": [
        { "mod_id": "ROCK_NO_AIOLI", "group_id": "ROCK_TAKEOFF", "group_type": "HOLD", "mod_name": "no aioli", "price_delta_cents": 0 },
        { "mod_id": "R_COMBO_FRIES", "group_id": "ROCK_COMBO", "group_type": "ADD", "mod_name": "plain fries", "price_delta_cents": 500 }
      ]
    }
  ],
  "customer": { "name": "Test Customer", "email": "test@example.com", "phone": "501-555-0100" },
  "pickup_time": "ASAP"
}
```
**Expected:** 
- Line 1: rocktown bourbon chikn sliders - no aioli ($12.00)
- Line 2: Combo plain fries ($5.00)
- Tax: $1.62
- Total: $18.62

---

## cURL Test Commands

```bash
# Test 1: Cowboy + Combo
curl -X POST https://n8n.systack.net/webhook/utopia-order-v2 \
  -H "Content-Type: application/json" \
  -d '{"items":[{"item_id":"COWBOY","qty":1,"modifiers":[{"mod_id":"C_COMBO_FRIES","group_id":"COW_COMBO","group_type":"ADD","mod_name":"plain fries","price_delta_cents":500}]}],"customer":{"name":"Test","email":"test@test.com","phone":"501-555-0100"},"pickup_time":"ASAP","test":true}'

# Test 2: Philly + Protein + Combo
curl -X POST https://n8n.systack.net/webhook/utopia-order-v2 \
  -H "Content-Type: application/json" \
  -d '{"items":[{"item_id":"PHILLY","qty":1,"modifiers":[{"mod_id":"P_CHIKN","group_id":"PHILLY_PROTEIN","group_type":"REQUIRED","mod_name":"chik\'n","price_delta_cents":0},{"mod_id":"P_COMBO_FRIES","group_id":"PHILLY_COMBO","group_type":"ADD","mod_name":"plain fries","price_delta_cents":500}]}],"customer":{"name":"Test","email":"test@test.com","phone":"501-555-0100"},"pickup_time":"ASAP","test":true}'

# Test 3: Fries Plain
curl -X POST https://n8n.systack.net/webhook/utopia-order-v2 \
  -H "Content-Type: application/json" \
  -d '{"items":[{"item_id":"FRIES","qty":1,"modifiers":[{"mod_id":"FRIES_PLAIN","group_id":"FRIES_STYLE","group_type":"REQUIRED","mod_name":"plain fries","price_delta_cents":0}]}],"customer":{"name":"Test","email":"test@test.com","phone":"501-555-0100"},"pickup_time":"ASAP","test":true}'

# Test 4: Fries Loaded Bac'n
curl -X POST https://n8n.systack.net/webhook/utopia-order-v2 \
  -H "Content-Type: application/json" \
  -d '{"items":[{"item_id":"FRIES","qty":1,"modifiers":[{"mod_id":"FRIES_BACN","group_id":"FRIES_STYLE","group_type":"REQUIRED","mod_name":"loaded fries — bac\'n","price_delta_cents":800}]}],"customer":{"name":"Test","email":"test@test.com","phone":"501-555-0100"},"pickup_time":"ASAP","test":true}'

# Test 5: Juice
curl -X POST https://n8n.systack.net/webhook/utopia-order-v2 \
  -H "Content-Type: application/json" \
  -d '{"items":[{"item_id":"JUICE_CP","qty":1,"modifiers":[{"mod_id":"JFLAV_GREEN","group_id":"JUICE_FLAVOR","group_type":"REQUIRED","mod_name":"green juice","price_delta_cents":0},{"mod_id":"JSIZE_10OZ","group_id":"JUICE_SIZE","group_type":"REQUIRED","mod_name":"10 oz plastic bottle","price_delta_cents":0}]}],"customer":{"name":"Test","email":"test@test.com","phone":"501-555-0100"},"pickup_time":"ASAP","test":true}'

# Test 6: Poppers + Sauce + Combo
curl -X POST https://n8n.systack.net/webhook/utopia-order-v2 \
  -H "Content-Type: application/json" \
  -d '{"items":[{"item_id":"POPPERS","qty":1,"modifiers":[{"mod_id":"POP_BUFFALO","group_id":"POP_SAUCE","group_type":"ADD","mod_name":"buffalo","price_delta_cents":0},{"mod_id":"POP_COMBO_FRIES","group_id":"POP_COMBO","group_type":"ADD","mod_name":"plain fries","price_delta_cents":500}]}],"customer":{"name":"Test","email":"test@test.com","phone":"501-555-0100"},"pickup_time":"ASAP","test":true}'

# Test 7: Rocktown + Takeoff + Combo
curl -X POST https://n8n.systack.net/webhook/utopia-order-v2 \
  -H "Content-Type: application/json" \
  -d '{"items":[{"item_id":"ROCKTOWN_SLIDERS","qty":1,"modifiers":[{"mod_id":"ROCK_NO_AIOLI","group_id":"ROCK_TAKEOFF","group_type":"HOLD","mod_name":"no aioli","price_delta_cents":0},{"mod_id":"R_COMBO_FRIES","group_id":"ROCK_COMBO","group_type":"ADD","mod_name":"plain fries","price_delta_cents":500}]}],"customer":{"name":"Test","email":"test@test.com","phone":"501-555-0100"},"pickup_time":"ASAP","test":true}'
```

## Negative Tests (Should Fail)

```bash
# Missing required protein for Philly
curl -X POST https://n8n.systack.net/webhook/utopia-order-v2 \
  -H "Content-Type: application/json" \
  -d '{"items":[{"item_id":"PHILLY","qty":1,"modifiers":[]}]}'

# Invalid item ID
curl -X POST https://n8n.systack.net/webhook/utopia-order-v2 \
  -H "Content-Type: application/json" \
  -d '{"items":[{"item_id":"INVALID_ITEM","qty":1,"modifiers":[]}]}'

# Modifier not belonging to item
curl -X POST https://n8n.systack.net/webhook/utopia-order-v2 \
  -H "Content-Type: application/json" \
  -d '{"items":[{"item_id":"COWBOY","qty":1,"modifiers":[{"mod_id":"P_CHIKN","group_id":"PHILLY_PROTEIN","mod_name":"chik\'n"}]}]}'
```
