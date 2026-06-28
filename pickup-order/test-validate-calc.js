#!/usr/bin/env node
// Standalone test for Validate & Calculate logic
// Run: node test-validate-calc.js

const { Client } = require('pg');

async function test() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'utopia_deli',
    user: 'systack',
    password: 'Systack2026!CRM'
  });
  
  await client.connect();
  
  // Test 1: Cowboy + Combo Fries
  console.log('=== TEST 1: Cowboy + Combo Fries ===');
  const itemIds = ['COWBOY'];
  const modIds = ['C_COMBO_FRIES'];
  const groupIds = ['COW_COMBO'];
  
  const itemsRes = await client.query(
    `SELECT item_id, name, base_price_cents, active FROM menu_items WHERE item_id = ANY($1)`,
    [itemIds]
  );
  const modsRes = await client.query(
    `SELECT mod_id, group_id, mod_name, price_delta_cents, active FROM modifiers WHERE mod_id = ANY($1)`,
    [modIds]
  );
  const groupsRes = await client.query(
    `SELECT group_id, item_id, min_select, max_select, group_type, group_label FROM modifier_groups WHERE group_id = ANY($1)`,
    [groupIds]
  );
  
  console.log('Items:', itemsRes.rows);
  console.log('Modifiers:', modsRes.rows);
  console.log('Groups:', groupsRes.rows);
  
  // Simulate validation logic
  const dbItems = {};
  itemsRes.rows.forEach(row => dbItems[row.item_id] = row);
  
  const dbMods = {};
  modsRes.rows.forEach(row => dbMods[row.mod_id] = row);
  
  const dbGroups = {};
  groupsRes.rows.forEach(row => {
    if (!dbGroups[row.item_id]) dbGroups[row.item_id] = {};
    dbGroups[row.item_id][row.group_id] = row;
  });
  
  const item = { item_id: 'COWBOY', qty: 1, modifiers: [
    { mod_id: 'C_COMBO_FRIES', group_id: 'COW_COMBO', mod_name: 'plain fries', price_delta_cents: 500 }
  ]};
  
  const dbItem = dbItems['COWBOY'];
  const dbMod = dbMods['C_COMBO_FRIES'];
  const basePrice = dbItem.base_price_cents;
  const comboPrice = dbMod.price_delta_cents;
  const subtotal = basePrice + comboPrice;
  const tax = Math.round(subtotal * 0.0952);
  const total = subtotal + tax;
  
  console.log(`Base: $${(basePrice/100).toFixed(2)}`);
  console.log(`Combo: $${(comboPrice/100).toFixed(2)}`);
  console.log(`Subtotal: $${(subtotal/100).toFixed(2)}`);
  console.log(`Tax (9.52%): $${(tax/100).toFixed(2)}`);
  console.log(`Total: $${(total/100).toFixed(2)}`);
  console.log('Expected: $19.71');
  console.log('');
  
  // Test 2: Philly without protein (should fail)
  console.log('=== TEST 2: Philly without protein (should fail) ===');
  const phillyGroupsRes = await client.query(
    `SELECT group_id, item_id, min_select, max_select, group_type, group_label FROM modifier_groups WHERE item_id = 'PHILLY'`
  );
  console.log('Philly required groups:', phillyGroupsRes.rows.filter(g => g.min_select > 0));
  console.log('Expected: PHILLY_PROTEIN with min_select=1');
  console.log('');
  
  // Test 3: Fries without style (should fail)
  console.log('=== TEST 3: Fries without style (should fail) ===');
  const friesGroupsRes = await client.query(
    `SELECT group_id, item_id, min_select, max_select, group_type, group_label FROM modifier_groups WHERE item_id = 'FRIES'`
  );
  console.log('Fries required groups:', friesGroupsRes.rows.filter(g => g.min_select > 0));
  console.log('Expected: FRIES_STYLE with min_select=1');
  console.log('');
  
  // Test 4: Modifier from wrong item (should fail)
  console.log('=== TEST 4: Modifier from wrong item ===');
  const cowboyGroupsRes = await client.query(
    `SELECT group_id FROM modifier_groups WHERE item_id = 'COWBOY'`
  );
  const phillyGroupsRes2 = await client.query(
    `SELECT group_id FROM modifier_groups WHERE item_id = 'PHILLY'`
  );
  console.log('Cowboy groups:', cowboyGroupsRes.rows.map(r => r.group_id));
  console.log('Philly groups:', phillyGroupsRes2.rows.map(r => r.group_id));
  console.log('P_CHIKN in COWBOY groups?', cowboyGroupsRes.rows.some(r => r.group_id === 'PHILLY_PROTEIN'));
  console.log('Expected: false (P_CHIKN is PHILLY only)');
  
  await client.end();
}

test().catch(console.error);
