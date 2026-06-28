// ===================== DATA — Auto-generated from Google Sheets =====================
// Source: Utopia_Deli_Menu_System spreadsheet
// Generated: 2026-05-16
// Sheet ID: 1jF85_1dx9WBETfhQyda2nnnKzzvTgzSbQ_uqcgArpm0

const MENU = {
  sandwiches: [
    {
      id: 'cowboy-chicken',
      name: "Cowboy Chik'n Sandwich",
      price: 1300,
      desc: "Grilled Cowboy Chik'n, Lettuce, Tomato, Ranch, Bac'n",
      photo: '../images/cowboy_chicken.webp',
      modifiers: {
        sauce: [
          { code: 'C_SAUCE_BBQ', label: 'BBQ', price: 50 },
          { code: 'C_SAUCE_BUFFALO', label: 'Buffalo', price: 50 },
          { code: 'C_SAUCE_GARLICPARM', label: 'Garlic Parm', price: 100 },
          { code: 'C_SAUCE_JERK', label: 'Jerk', price: 50 },
          { code: 'C_SAUCE_LEMONPEP', label: 'Lemon Pepper', price: 100 },
          { code: 'C_SAUCE_TRUTH', label: 'Truth', price: 50 },
        ],
        hold: [
          { code: 'C_HOLD_BACN', label: 'No Bac\'n', price: 0 },
          { code: 'C_HOLD_CHIVES', label: 'No Chives', price: 0 },
          { code: 'C_HOLD_LETTUCE', label: 'No Lettuce', price: 0 },
          { code: 'C_HOLD_TOMATO', label: 'No Tomato', price: 0 },
        ],
        noranch: [
          { code: 'C_NORANCH_FLAG', label: 'No Ranch', price: 0 },
          { code: 'C_SUB_GARLICBUTR', label: 'Add Garlic Butter Instead', price: 0 },
          { code: 'C_SUB_SAUCE_BBQ', label: 'Add BBQ Sauce Instead', price: 0 },
          { code: 'C_SUB_SAUCE_BUFF', label: 'Add Buffalo Sauce Instead', price: 0 },
          { code: 'C_SUB_SAUCE_JERK', label: 'Add Jerk Sauce Instead', price: 0 },
          { code: 'C_SUB_SAUCE_TRTH', label: 'Add Truth Sauce Instead', price: 0 },
        ],
        addons: [
          { code: 'C_JALAP', label: 'Jalapeños', price: 100 },
        ],
        combo: [
          { code: 'C_COMBO_FRIES', label: 'Add Fries', price: 500 },
          { code: 'C_COMBO_SALAD', label: 'Add Side Salad', price: 500 },
        ]
      }
    },
    {
      id: 'chicken-club',
      name: "Chik'n Club Sub",
      price: 1500,
      desc: "Grilled Chik'n, Bac'n, Cheese on a bed of Lettuce and Tomatoes",
      photo: '../images/chicken_club.webp',
      modifiers: {
        hold: [
          { code: 'S_HOLD_BACN', label: 'No Bac\'n', price: 0 },
          { code: 'S_HOLD_CHIVES', label: 'No Chives', price: 0 },
          { code: 'S_HOLD_LETTUCE', label: 'No Lettuce', price: 0 },
          { code: 'S_HOLD_TOMATO', label: 'No Tomato', price: 0 },
        ],
        noranch: [
          { code: 'S_NORANCH_FLAG', label: 'No Ranch', price: 0 },
          { code: 'S_SUB_GARLICBUTR', label: 'Add Garlic Butter Instead', price: 0 },
          { code: 'S_SUB_SAUCE_BBQ', label: 'Add BBQ Sauce Instead', price: 0 },
          { code: 'S_SUB_SAUCE_BUFF', label: 'Add Buffalo Sauce', price: 0 },
          { code: 'S_SUB_SAUCE_JERK', label: 'Add Jerk Sauce Instead', price: 0 },
          { code: 'S_SUB_SAUCE_TRTH', label: 'Add Truth Sauce Instead', price: 0 },
        ],
        combo: [
          { code: 'S_COMBO_FRIES', label: 'Add Fries', price: 500 },
          { code: 'S_COMBO_SALAD', label: 'Add Side Salad', price: 500 },
        ],
        addons: [
          { code: 'S_JALAP', label: 'Jalapeños', price: 100 },
        ],
        sauce: [
          { code: 'S_SAUCE_BBQ', label: 'BBQ', price: 50 },
          { code: 'S_SAUCE_BUFFALO', label: 'Buffalo', price: 50 },
          { code: 'S_SAUCE_GARLICPARM', label: 'Garlic Parm', price: 250 },
          { code: 'S_SAUCE_JERKS', label: 'Jerk', price: 50 },
          { code: 'S_SAUCE_LEMONPEP', label: 'Lemon Pepper', price: 100 },
          { code: 'S_SAUCE_TRUTH', label: 'Truth', price: 50 },
        ]
      }
    },
    {
      id: 'chicken-fried',
      name: "Chik'n Fried Chik'n Sub",
      price: 1300,
      desc: "Crispy Fried Chik'n on a hoagie with lettuce, tomato, ranch",
      photo: '../images/chicken_fried_chikn_sub.png',
      modifiers: {
        hold: [
          { code: 'F_NO_BACN', label: 'No Bac\'n', price: 0 },
          { code: 'F_NO_CHIVES', label: 'No Chives', price: 0 },
          { code: 'F_NO_LETTUCE', label: 'No Lettuce', price: 0 },
          { code: 'F_NO_TOMATO', label: 'No Tomato', price: 0 },
        ],
        noranch: [
          { code: 'F_NO_RANCH_FLAG', label: 'No Ranch', price: 0 },
          { code: 'F_SUB_GARLICBUTR', label: 'Add Garlic Butter Instead', price: 0 },
          { code: 'F_SUB_BBQ', label: 'Add BBQ Sauce Instead', price: 0 },
          { code: 'F_SUB_BUFFALO', label: 'Add Buffalo Sauce', price: 0 },
          { code: 'F_SUB_JERK', label: 'Add Jerk Sauce Instead', price: 0 },
          { code: 'F_SUB_TRUTH', label: 'Add Truth Sauce Instead', price: 0 },
        ],
        combo: [
          { code: 'F_COMBO_FRIES', label: 'Add Fries', price: 500 },
          { code: 'F_COMBO_SALAD', label: 'Add Side Salad', price: 500 },
        ],
        addons: [
          { code: 'F_ADD_JALAP', label: 'Jalapeños', price: 100 },
        ],
        sauce: [
          { code: 'F_SAUCE_AIOLI', label: 'Aioli', price: 75 },
          { code: 'F_SAUCE_BBQ', label: 'BBQ', price: 50 },
          { code: 'F_SAUCE_BUFFALO', label: 'Buffalo', price: 50 },
          { code: 'F_SAUCE_GARLICPARM', label: 'Garlic Parm', price: 250 },
          { code: 'F_SAUCE_JERK', label: 'Jerk', price: 50 },
          { code: 'F_SAUCE_LEMONPEP', label: 'Lemon Pepper Wet', price: 75 },
          { code: 'F_SAUCE_TRUTH', label: 'Truth', price: 50 },
        ]
      }
    },
    {
      id: 'philly-sub',
      name: "Philly Sub",
      price: 1300,
      desc: "Stek OR Chik'n with sautéed onions & bell peppers",
      photo: '../images/steak_philly.jpg',
      modifiers: {
        protein: [
          { code: 'P_CHIKN', label: 'Chik\'n', price: 0 },
          { code: 'P_STEK', label: 'Stek', price: 0 },
        ],
        addons: [
          { code: 'P_JALAP', label: 'Jalapeños', price: 100 },
        ],
        combo: [
          { code: 'P_COMBO_FRIES', label: 'Add Fries', price: 500 },
          { code: 'P_COMBO_SALAD', label: 'Add Side Salad', price: 500 },
        ],
        hold: [
          { code: 'P_NO_AIOLI', label: 'No Aioli', price: 0 },
          { code: 'P_HOLD_PEPPERS_ONIONS', label: 'No Peppers & Onions', price: 0 },
          { code: 'P_NO_CHEESE', label: 'No Cheese', price: 0 },
          { code: 'P_NO_ONIONS', label: 'No Onions', price: 0 },
          { code: 'P_NO_PEPPERS', label: 'No Peppers', price: 0 },
        ],
        extras: [
          { code: 'P_EXTRA_AIOLI', label: 'Extra Aioli', price: 75 },
          { code: 'P_EXTRA_CHEZE', label: 'Extra Cheese', price: 100 },
          { code: 'P_EXTRA_CHIKN', label: 'Extra Chik\'n', price: 200 },
          { code: 'P_EXTRA_ONIONS', label: 'Extra Onions', price: 100 },
          { code: 'P_EXTRA_PEPPERS', label: 'Extra Peppers', price: 100 },
          { code: 'P_EXTRA_STEK', label: 'Extra Stek', price: 200 },
        ]
      }
    },
  ],
  specialties: [
    {
      id: 'chicken-poppers',
      name: "Chik'n Poppers",
      price: 1000,
      desc: "Crispy chik'n dippers — choice of sauce: BBQ, Garlic Parm, Jerk, Buffalo, Lemon Pepper Wet",
      photo: '../images/chicken_poppers_v3.jpg',
      modifiers: {
        sauce: [
          { code: 'POP_SAUCE_BUFFALO', label: 'Buffalo', price: 0 },
          { code: 'POP_SAUCE_GARLICPARM', label: 'Garlic Parm', price: 0 },
          { code: 'POP_SAUCE_JERK', label: 'Jerk', price: 0 },
          { code: 'POP_SAUCE_LEMONPEP', label: 'Lemon Pepper Wet', price: 0 },
          { code: 'POP_SAUCE_PLAIN', label: 'Plain (no sauce)', price: 0 },
        ],
        combo: [
          { code: 'POP_COMBO_FRIES', label: 'Add Fries', price: 500 },
          { code: 'POP_COMBO_SALAD', label: 'Add Side Salad', price: 500 },
        ]
      }
    },
    {
      id: 'korean-tacos',
      name: 'Korean Pork Dumpling Tacos',
      price: 1000,
      desc: '"Pork", pickled slaw, aioli, and sauce on a dumpling shell. Set of 4 tacos',
      photo: '../images/korean_pork_dumpling_tacos.jpg',
      modifiers: {
        hold: [
          { code: 'DUMP_NO_AIOLI', label: 'No Aioli', price: 0 },
          { code: 'DUMP_NO_JERK', label: 'No Jerk', price: 0 },
          { code: 'DUMP_NO_SLAW', label: 'No Cabbage', price: 0 },
        ],
        subs: [
          { code: 'DUMP_SUB_LETTUCE', label: 'Sub Lettuce for Cabbage', price: 0 },
        ],
        sauce: [
          { code: 'DUMP_SAUCE_BBQ', label: 'BBQ', price: 0 },
          { code: 'DUMP_SAUCE_BUFFALO', label: 'Buffalo', price: 0 },
          { code: 'DUMP_SAUCE_GARLICPARM', label: 'Garlic Parm', price: 0 },
          { code: 'DUMP_SAUCE_JERK', label: 'Jerk', price: 0 },
          { code: 'DUMP_SAUCE_LEMONPEP', label: 'Lemon Pepper', price: 0 },
          { code: 'DUMP_SAUCE_TRUTH', label: 'Truth', price: 0 },
        ],
        combo: [
          { code: 'DUMP_COMBO_FRIES', label: 'Add Fries', price: 500 },
          { code: 'DUMP_COMBO_SALAD', label: 'Add Side Salad', price: 500 },
        ]
      }
    },
    {
      id: 'bourbon-sliders',
      name: "Rocktown Bourbon Chik'n Sliders",
      price: 1200,
      desc: "Rocktown distillery bourbon-infused chik'n with fresh slaw and aioli on a garlic butter slider bun",
      photo: '../images/rocktown_bourbon_slider.jpg',
      modifiers: {
        hold: [
          { code: 'ROCK_NO_AIOLI', label: 'No Aioli', price: 0 },
          { code: 'ROCK_NO_CABBAGE', label: 'No Cabbage', price: 0 },
        ],
        combo: [
          { code: 'ROCK_COMBO_FRIES', label: 'Add Fries', price: 500 },
          { code: 'ROCK_COMBO_SALAD', label: 'Add Side Salad', price: 500 },
        ]
      }
    },
    {
      id: 'buffalo-sliders',
      name: "Buffalo Chik'n Sliders",
      price: 1200,
      desc: "Buffalo chik'n sliders with fresh slaw and ranch on a garlic butter slider bun",
      photo: '../images/buffalo_chikn_slider.jpg',
      modifiers: {
        hold: [
          { code: 'BUFF_NO_RANCH', label: 'No Ranch', price: 0 },
          { code: 'BUFF_NO_CABBAGE', label: 'No Cabbage', price: 0 },
        ],
        combo: [
          { code: 'BUFF_COMBO_FRIES', label: 'Add Fries', price: 500 },
          { code: 'BUFF_COMBO_SALAD', label: 'Add Side Salad', price: 500 },
        ]
      }
    },
  ],
  sides: [
    {
      id: 'fries-plain',
      name: "Plain Fries",
      price: 500,
      desc: "Crinkle-cut fries with a golden, crispy exterior",
      photo: '../images/plain_fries.avif',
      modifiers: {
        style: [
          { code: 'FRIES_PLAIN', label: 'Plain', price: 0 },
        ],
        addons: [
          { code: 'FRIES_ADD_JALAP', label: 'Jalapeños', price: 100 },
        ],
        protein: [
          { code: 'FRIES_ADD_BACN', label: 'Add Bac\'n', price: 150 },
          { code: 'FRIES_ADD_CHIKN', label: 'Add Chik\'n', price: 200 },
          { code: 'FRIES_ADD_STEK', label: 'Add Stek', price: 200 },
        ]
      }
    },
    {
      id: 'fries-loaded-bacn',
      name: "Loaded Fries — Bac'n",
      price: 1300,
      desc: "Crinkle-cut fries loaded with bac'n",
      photo: '../images/loaded_bacon_fry.jpg',
      modifiers: {}
    },
    {
      id: 'fries-loaded-garlic',
      name: "Loaded Fries — Garlic Parm",
      price: 1300,
      desc: "Crinkle-cut fries loaded with garlic parmesan",
      photo: '../images/garlic_parm_fries_v2.jpg',
      modifiers: {}
    },
    {
      id: 'fries-loaded-chikn',
      name: "Loaded Fries — Philly Chik'n",
      price: 1300,
      desc: "Crinkle-cut fries loaded with philly chik'n",
      photo: '../images/loaded_fries.webp',
      modifiers: {}
    },
    {
      id: 'fries-loaded-stek',
      name: "Loaded Fries — Philly Stek",
      price: 1300,
      desc: "Crinkle-cut fries loaded with philly stek",
      photo: '../images/loaded_fries.webp',
      modifiers: {}
    },
    {
      id: 'cookies',
      name: "Two Chocolate Chip Cookies",
      price: 400,
      desc: "Two fresh-baked chocolate chip cookies",
      photo: '../images/cookies_v2.jpg',
      modifiers: {}
    },
    {
      id: 'cold-pressed-juice',
      name: "Fresh Cold-Pressed Juice",
      price: 500,
      desc: "Fresh cold-pressed juice — 10 oz",
      photo: '../images/cold_pressed_juice_v2.jpg',
      modifiers: {
        flavor: [
          { code: 'JFLAV_PINEAPPLE', label: 'Pineapple Honey Crisp — Pineapple, Honeycrisp Apple, Lemon', price: 0 },
        ]
      }
    },
    {
      id: 'water',
      name: "Bottled Water",
      price: 200,
      desc: "16 oz bottled water — crisp and refreshing",
      photo: '../images/bottled_water_v2.png',
      modifiers: {}
    },
    {
      id: 'side-salad',
      name: "Side Salad",
      price: 500,
      desc: "Fresh mixed greens with house vegetables, served with your choice of dressing",
      photo: '../images/side_salad_v2.png',
      modifiers: {}
    },
    {
      id: 'potato-chip-spirals',
      name: "Potato Chip Spirals",
      price: 500,
      desc: "Crispy potato chip spirals — seasoned and fried to perfection",
      photo: '../images/spiral_chips.jpg',
      modifiers: {}
    },
  ]
};
