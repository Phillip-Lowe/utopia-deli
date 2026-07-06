// menu-data.js
// Utopia Deli canonical frontend menu data
// Fixed after legacy Google Sheets rollback.
// Source of truth alignment:
// - Frontend item id = DB item_id
// - Modifier code = DB mod_id
// - Modifier group_id = DB group_id
// - Prices are cents
// - Combo fries are always plain fries
// - FRIES style is handled as a REQUIRED modifier
// - JUICE flavor and size are handled as REQUIRED modifiers

(function () {
  function mod(code, group_id, group_type, label, price) {
    return {
      code,
      mod_id: code,
      group_id,
      group_type,
      label,
      mod_name: label,
      price,
      price_cents: price,
      price_delta_cents: price,
    };
  }

  window.MENU = {
    sandwiches: [
      {
        id: "COWBOY",
        item_id: "COWBOY",
        name: "cowboy chikn sandwich",
        price: 1300,
        base_price_cents: 1300,
        desc: "Grilled Cowboy Chik’n, Lettuce, Tomato, Ranch, Bac'n.",
        photo: "../images/cowboy_chicken.webp",
        modifiers: {
          sauce: [
            mod("C_SAUCE_BBQ", "COW_SAUCES", "ADD", "bbq", 50),
            mod("C_SAUCE_BUFFALO", "COW_SAUCES", "ADD", "buffalo", 50),
            mod("C_SAUCE_GARLICPARM", "COW_SAUCES", "ADD", "garlic parm", 100),
            mod("C_SAUCE_JERK", "COW_SAUCES", "ADD", "jerk", 50),
            mod("C_SAUCE_LEMONPEP", "COW_SAUCES", "ADD", "lemon pepper", 100),
            mod("C_SAUCE_TRUTH", "COW_SAUCES", "ADD", "truth", 50),
          ],
          hold: [
            mod("C_HOLD_BACN", "COW_TAKEOFF", "HOLD", "no bac'n", 0),
            mod("C_HOLD_CHIVES", "COW_TAKEOFF", "HOLD", "no chives", 0),
            mod("C_HOLD_LETTUCE", "COW_TAKEOFF", "HOLD", "no lettuce", 0),
            mod("C_HOLD_TOMATO", "COW_TAKEOFF", "HOLD", "no tomato", 0),
          ],
          noranch: [
            mod("C_NORANCH_FLAG", "COW_NORANCH", "SPECIAL", "no ranch", 0),
            mod(
              "C_SUB_GARLICBUTR",
              "COW_NORANCH",
              "SPECIAL",
              "add garlic butter instead",
              0,
            ),
            mod(
              "C_SUB_SAUCE_BBQ",
              "COW_NORANCH",
              "SPECIAL",
              "add bbq sauce instead",
              0,
            ),
            mod(
              "C_SUB_SAUCE_BUFF",
              "COW_NORANCH",
              "SPECIAL",
              "add buffalo sauce instead",
              0,
            ),
            mod(
              "C_SUB_SAUCE_JERK",
              "COW_NORANCH",
              "SPECIAL",
              "add jerk sauce instead",
              0,
            ),
            mod(
              "C_SUB_SAUCE_TRTH",
              "COW_NORANCH",
              "SPECIAL",
              "add truth sauce instead",
              0,
            ),
          ],
          addons: [mod("C_JALAP", "COW_ADDONS", "ADD", "jalapenos", 100)],
          combo: [
            mod("C_COMBO_FRIES", "COW_COMBO", "ADD", "plain fries", 500),
            mod("C_COMBO_SALAD", "COW_COMBO", "ADD", "side salad", 500),
          ],
        },
      },

      {
        id: "CLUB",
        item_id: "CLUB",
        name: "chikn club sub",
        price: 1500,
        base_price_cents: 1500,
        desc: "Grilled Chik’n Bac’n Cheese on a bed of Lettuce and Tomatoes.",
        photo: "../images/chicken_club.webp",
        modifiers: {
          hold: [
            mod("S_HOLD_BACN", "CLUB_TAKEOFF", "HOLD", "no bac'n", 0),
            mod("S_HOLD_CHIVES", "CLUB_TAKEOFF", "HOLD", "no chives", 0),
            mod("S_HOLD_LETTUCE", "CLUB_TAKEOFF", "HOLD", "no lettuce", 0),
            mod("S_HOLD_TOMATO", "CLUB_TAKEOFF", "HOLD", "no tomato", 0),
          ],
          noranch: [
            mod("S_NORANCH_FLAG", "CLUB_NORANCH", "SPECIAL", "no ranch", 0),
            mod(
              "S_SUB_GARLICBUTR",
              "CLUB_NORANCH",
              "SPECIAL",
              "add garlic butter instead",
              0,
            ),
            mod(
              "S_SUB_SAUCE_BBQ",
              "CLUB_NORANCH",
              "SPECIAL",
              "add bbq sauce instead",
              0,
            ),
            mod(
              "S_SUB_SAUCE_BUFF",
              "CLUB_NORANCH",
              "SPECIAL",
              "add buffalo sauce instead",
              0,
            ),
            mod(
              "S_SUB_SAUCE_JERK",
              "CLUB_NORANCH",
              "SPECIAL",
              "add jerk sauce instead",
              0,
            ),
            mod(
              "S_SUB_SAUCE_TRTH",
              "CLUB_NORANCH",
              "SPECIAL",
              "add truth sauce instead",
              0,
            ),
          ],
          combo: [
            mod("S_COMBO_FRIES", "CLUB_COMBO", "ADD", "plain fries", 500),
            mod("S_COMBO_SALAD", "CLUB_COMBO", "ADD", "side salad", 500),
          ],
          addons: [mod("S_JALAP", "CLUB_ADDONS", "ADD", "jalapenos", 100)],
          sauce: [
            mod("S_SAUCE_BBQ", "CLUB_SAUCES", "ADD", "bbq", 50),
            mod("S_SAUCE_BUFFALO", "CLUB_SAUCES", "ADD", "buffalo", 50),
            mod("S_SAUCE_GARLICPARM", "CLUB_SAUCES", "ADD", "garlic parm", 250),
            mod("S_SAUCE_JERK", "CLUB_SAUCES", "ADD", "jerk", 50),
            mod("S_SAUCE_LEMONPEP", "CLUB_SAUCES", "ADD", "lemon pepper", 100),
            mod("S_SAUCE_TRUTH", "CLUB_SAUCES", "ADD", "truth", 50),
          ],
        },
      },

      {
        id: "FRIED",
        item_id: "FRIED",
        name: "chikn fried chikn sub",
        price: 1300,
        base_price_cents: 1300,
        desc: "Crispy Fried Chik'n on a hoagie with lettuce, tomato, ranch.",
        photo: "../images/chicken_fried_chikn_sub.png",
        modifiers: {
          hold: [
            mod("F_NO_BACN", "FRIED_TAKEOFF", "HOLD", "no bac'n", 0),
            mod("F_NO_CHIVES", "FRIED_TAKEOFF", "HOLD", "no chives", 0),
            mod("F_NO_LETTUCE", "FRIED_TAKEOFF", "HOLD", "no lettuce", 0),
            mod("F_NO_TOMATO", "FRIED_TAKEOFF", "HOLD", "no tomato", 0),
          ],
          noranch: [
            mod("F_NO_RANCH_FLAG", "FRIED_NORANCH", "SPECIAL", "no ranch", 0),
            mod(
              "F_SUB_GARLICBUTR",
              "FRIED_NORANCH",
              "SPECIAL",
              "add garlic butter instead",
              0,
            ),
            mod(
              "F_SUB_BBQ",
              "FRIED_NORANCH",
              "SPECIAL",
              "add bbq sauce instead",
              0,
            ),
            mod(
              "F_SUB_BUFFALO",
              "FRIED_NORANCH",
              "SPECIAL",
              "add buffalo sauce instead",
              0,
            ),
            mod(
              "F_SUB_JERK",
              "FRIED_NORANCH",
              "SPECIAL",
              "add jerk sauce instead",
              0,
            ),
            mod(
              "F_SUB_TRUTH",
              "FRIED_NORANCH",
              "SPECIAL",
              "add truth sauce instead",
              0,
            ),
          ],
          combo: [
            mod("F_COMBO_FRIES", "FRIED_COMBO", "ADD", "plain fries", 500),
            mod("F_COMBO_SALAD", "FRIED_COMBO", "ADD", "side salad", 500),
          ],
          addons: [mod("F_ADD_JALAP", "FRIED_ADDONS", "ADD", "jalapenos", 100)],
          sauce: [
            mod("F_SAUCE_AIOLI", "FRIED_ADDSAUCE", "ADD", "aioli", 75),
            mod("F_SAUCE_BBQ", "FRIED_ADDSAUCE", "ADD", "bbq", 50),
            mod("F_SAUCE_BUFFALO", "FRIED_ADDSAUCE", "ADD", "buffalo", 50),
            mod(
              "F_SAUCE_GARLICPARM",
              "FRIED_ADDSAUCE",
              "ADD",
              "garlic parm",
              250,
            ),
            mod("F_SAUCE_JERK", "FRIED_ADDSAUCE", "ADD", "jerk", 50),
            mod(
              "F_SAUCE_LEMONPEP",
              "FRIED_ADDSAUCE",
              "ADD",
              "lemon pepper wet",
              75,
            ),
            mod("F_SAUCE_TRUTH", "FRIED_ADDSAUCE", "ADD", "truth", 50),
          ],
        },
      },

      {
        id: "PHILLY",
        item_id: "PHILLY",
        name: "philly sub",
        price: 1300,
        base_price_cents: 1300,
        desc: "Stek OR Chik’n with sautéed onions &amp; bell peppers.",
        photo: "../images/steak_philly.jpg",
        modifiers: {
          protein: [
            mod("P_CHIKN", "PHILLY_PROTEIN", "REQUIRED", "chik'n", 0),
            mod("P_STEK", "PHILLY_PROTEIN", "REQUIRED", "stek", 0),
          ],
          addons: [mod("P_JALAP", "PHILLY_ADDONS", "ADD", "jalapeños", 100)],
          combo: [
            mod("P_COMBO_FRIES", "PHILLY_COMBO", "ADD", "plain fries", 500),
            mod("P_COMBO_SALAD", "PHILLY_COMBO", "ADD", "side salad", 500),
          ],
          hold: [
            mod(
              "P_HOLD_PEPPERS_ONIONS",
              "PHILLY_TAKEOFF",
              "HOLD",
              "no peppers and onions",
              0,
            ),
            mod("P_NO_AIOLI", "PHILLY_TAKEOFF", "HOLD", "no aioli", 0),
            mod("P_NO_CHEZE", "PHILLY_TAKEOFF", "HOLD", "no cheze", 0),
            mod("P_NO_PARSLEY", "PHILLY_TAKEOFF", "HOLD", "no parsley", 0),
            mod("P_NO_CHEESE", "PHILLY_TAKEOFF", "HOLD", "no cheese", 0),
            mod("P_NO_ONIONS", "PHILLY_TAKEOFF", "HOLD", "no onions", 0),
            mod("P_NO_PEPPERS", "PHILLY_TAKEOFF", "HOLD", "no peppers", 0),
          ],
          extras: [
            mod("P_EXTRA_AIOLI", "PHILLY_EXTRAS", "ADD", "extra aioli", 75),
            mod("P_EXTRA_CHEZE", "PHILLY_EXTRAS", "ADD", "extra cheze", 100),
            mod("P_EXTRA_ONIONS", "PHILLY_EXTRAS", "ADD", "extra onions", 100),
            mod(
              "P_EXTRA_PEPPERS",
              "PHILLY_EXTRAS",
              "ADD",
              "extra peppers",
              100,
            ),
            mod("P_EXTRA_CHIKN", "PHILLY_EXTRAS", "ADD", "extra chikn", 200),
            mod("P_EXTRA_STEK", "PHILLY_EXTRAS", "ADD", "extra stek", 200),
          ],
        },
      },
    ],

    specialties: [
      {
        id: "POPPERS",
        item_id: "POPPERS",
        name: "chikn poppers",
        price: 1000,
        base_price_cents: 1000,
        desc: "Crispy chikn dippers or sauced with choice of BBQ, Garlic Parm, Jerk, Buffalo, Lemon Pepper Wet.",
        photo: "../images/chicken_poppers_v3.jpg",
        modifiers: {
          sauce: [
            mod("POP_PLAIN", "POP_SAUCE", "ADD", "plain", 0),
            mod("POP_BUFFALO", "POP_SAUCE", "ADD", "buffalo", 0),
            mod("POP_GARLIC", "POP_SAUCE", "ADD", "garlic parm", 0),
            mod("POP_JERK", "POP_SAUCE", "ADD", "jerk", 0),
            mod("POP_LEM_WET", "POP_SAUCE", "ADD", "lemon pepper wet", 0),
          ],
          combo: [
            mod("POP_COMBO_FRIES", "POP_COMBO", "ADD", "plain fries", 500),
            mod("POP_COMBO_SALAD", "POP_COMBO", "ADD", "side salad", 500),
          ],
        },
      },

      {
        id: "DUMPLING_TACOS",
        item_id: "DUMPLING_TACOS",
        name: "korean pork dumpling tacos",
        price: 1000,
        base_price_cents: 1000,
        desc: "“Pork”, pickled slaw, aioli, and sauce on a dumpling shell. Set of 4 tacos.",
        photo: "../images/korean_pork_dumpling_tacos.jpg",
        modifiers: {
          hold: [
            mod("DUMP_NO_AIOLI", "DUMPLING_TAKEOFF", "HOLD", "no aioli", 0),
            mod("DUMP_NO_JERK", "DUMPLING_TAKEOFF", "HOLD", "no jerk", 0),
            mod("DUMP_NO_SLAW", "DUMPLING_TAKEOFF", "HOLD", "no cabbage", 0),
          ],
          subs: [
            mod(
              "DUMP_SUB_LETTUCE",
              "DUMPLING_SUBS",
              "SPECIAL",
              "sub lettuce for cabbage",
              0,
            ),
          ],
          combo: [
            mod(
              "DUMP_COMBO_FRIES",
              "DUMPLING_COMBO",
              "ADD",
              "plain fries",
              500,
            ),
            mod("DUMP_COMBO_SALAD", "DUMPLING_COMBO", "ADD", "side salad", 500),
          ],
        },
      },

      {
        id: "ROCKTOWN_SLIDERS",
        item_id: "ROCKTOWN_SLIDERS",
        name: "rocktown bourbon chikn sliders",
        price: 1200,
        base_price_cents: 1200,
        desc: "Rocktown distillery bourbon-infused chik’n with fresh slaw and aioli on a garlic butter slider bun.",
        photo: "../images/rocktown_bourbon_slider.jpg",
        modifiers: {
          hold: [
            mod("ROCK_NO_AIOLI", "ROCK_TAKEOFF", "HOLD", "no aioli", 0),
            mod("ROCK_NO_CABBAGE", "ROCK_TAKEOFF", "HOLD", "no cabbage", 0),
          ],
          combo: [
            mod("R_COMBO_FRIES", "ROCK_COMBO", "ADD", "plain fries", 500),
            mod("R_COMBO_SALAD", "ROCK_COMBO", "ADD", "side salad", 500),
          ],
        },
      },

      {
        id: "BUFFALO_SLIDERS",
        item_id: "BUFFALO_SLIDERS",
        name: "buffalo chikn sliders",
        price: 1200,
        base_price_cents: 1200,
        desc: "Buffalo chik’n sliders with fresh slaw and ranch on a garlic butter slider bun.",
        photo: "../images/buffalo_chikn_slider.jpg",
        modifiers: {
          hold: [
            mod("BUFFALO_NO_RANCH", "BUFFALO_TAKEOFF", "HOLD", "no ranch", 0),
            mod("BUFFALO_NO_SLAW", "BUFFALO_TAKEOFF", "HOLD", "no slaw", 0),
          ],
          combo: [
            mod("B_COMBO_FRIES", "BUFFALO_COMBO", "ADD", "plain fries", 500),
            mod("B_COMBO_SALAD", "BUFFALO_COMBO", "ADD", "side salad", 500),
          ],
        },
      },
    ],

    sides: [
      {
        id: "FRIES",
        item_id: "FRIES",
        name: "fries",
        price: 500,
        base_price_cents: 500,
        desc: "Crinkle-cut fries with a golden, crispy exterior. Choose plain or loaded style.",
        photo: "../images/plain_fries.avif",
        modifiers: {
          style: [
            mod("FRIES_PLAIN", "FRIES_STYLE", "REQUIRED", "plain fries", 0),
            mod(
              "FRIES_BACN",
              "FRIES_STYLE",
              "REQUIRED",
              "loaded fries — bac'n",
              800,
            ),
            mod(
              "FRIES_CHIKN",
              "FRIES_STYLE",
              "REQUIRED",
              "loaded fries — philly chik'n",
              800,
            ),
            mod(
              "FRIES_GARLICPARM",
              "FRIES_STYLE",
              "REQUIRED",
              "loaded fries — garlic parm",
              800,
            ),
            mod(
              "FRIES_STEK",
              "FRIES_STYLE",
              "REQUIRED",
              "loaded fries — philly stek",
              800,
            ),
          ],
          addons: [
            mod("FRIES_ADD_JALAP", "FRIES_ADDONS", "ADD", "jalapeños", 100),
          ],
          extras: [
            mod("FRIES_ADD_BACN", "FRIES_ADDPROTEIN", "ADD", "add bac'n", 150),
            mod(
              "FRIES_ADD_CHIKN",
              "FRIES_ADDPROTEIN",
              "ADD",
              "add chik'n",
              200,
            ),
            mod("FRIES_ADD_STEK", "FRIES_ADDPROTEIN", "ADD", "add stek", 200),
          ],
        },
      },

      {
        id: "JUICE_CP",
        item_id: "JUICE_CP",
        name: "fresh cold-pressed juice",
        price: 500,
        base_price_cents: 500,
        desc: "Select flavor and size. Current public size is 10 oz plastic bottle.",
        photo: "../images/cold_pressed_juice_v2.jpg",
        modifiers: {
          flavor: [
            mod(
              "JFLAV_GREEN",
              "JUICE_FLAVOR",
              "REQUIRED",
              "green juice — green apple, cucumber, celery, ginger",
              0,
            ),
            mod(
              "JFLAV_ORANGE",
              "JUICE_FLAVOR",
              "REQUIRED",
              "orange machine — orange, carrot, ginger, apple",
              0,
            ),
            mod(
              "JFLAV_SWEET",
              "JUICE_FLAVOR",
              "REQUIRED",
              "sweet dreams — strawberry, grapes, watermelon, lemons",
              0,
            ),
          ],
          size: [
            mod(
              "JSIZE_10OZ",
              "JUICE_SIZE",
              "REQUIRED",
              "10 oz plastic bottle",
              0,
            ),

            // 16 oz remains in DB but is hidden from frontend for now.
            // Uncomment only when available:
            // mod("JSIZE_16OZ", "JUICE_SIZE", "REQUIRED", "16 oz glass bottle", 500),
          ],
        },
      },

      {
        id: "COOKIES_2",
        item_id: "COOKIES_2",
        name: "two fresh baked chocolate chip cookies",
        price: 400,
        base_price_cents: 400,
        desc: "2 fresh baked chocolate chip cookies.",
        photo: "../images/cookies_v2.jpg",
      },

      {
        id: "SIDE_SALAD",
        item_id: "SIDE_SALAD",
        name: "side salad",
        price: 500,
        base_price_cents: 500,
        desc: "Fresh mixed greens with house vegetables, served with your choice of dressing.",
        photo: "../images/side_salad_v2.png",
      },

      {
        id: "WATER_16OZ",
        item_id: "WATER_16OZ",
        name: "16 oz bottled water",
        price: 200,
        base_price_cents: 200,
        desc: "Crisp, chilled 16 oz bottled water — refreshing and perfect alongside any meal.",
        photo: "../images/bottled_water_v2.png",
      },

      {
        id: "CHIPS_SPIRALS",
        item_id: "CHIPS_SPIRALS",
        name: "potato chip spirals",
        price: 500,
        base_price_cents: 500,
        desc: "Crispy potato chip spirals — seasoned and fried to perfection.",
        photo: "../images/spiral_chips.jpg",
      },
    ],

    beverages: [],
  };
})();
