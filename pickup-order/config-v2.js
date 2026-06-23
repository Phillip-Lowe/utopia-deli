// ===================== BRAND CONFIGURATION =====================
// Edit this file to rebrand the order page for any business.
// All brand-specific values are isolated here.
// v2 - 2026-06-07 - email + logo link fixes
// ==============================================================

const BRAND = {
  // Identity
  name: "The Utopia Deli",
  tagline: "It's just good food",
  shortName: "Utopia Deli",
  location: "Little Rock, AR",

  // Contact
  phone: "(501) 551-5944",
  email: "theutopiadelilittlerock@gmail.com",
  instagram: "@theutopiadeli",
  website: "https://theutopiadeli.com",
  streetAddress: "801 S. Chester, Little Rock, AR 72201",

  // SMTP (using local email server instead of Gmail)
  smtp: {
    host: "smtp.gmail.com", // Replace with your SMTP host
    port: 587,
    user: "theutopiadelilittlerock@gmail.com",
    password: null, // Loaded from keychain or env
    fromName: "The Utopia Deli",
    fromEmail: "order@theutopiadeli.com",
  },

  // Visual Identity — CSS variable overrides
  colors: {
    primary: "#590B3F",
    primaryLight: "#7a1a55",
    accent: "#AF3D4B",
    accentHover: "#c44d5b",
    secondary: "#754681",
    gold: "#D59F5C",
    goldLight: "#f5e6d0",
  },

  // Assets
  logo: "../images/logo.png",
  favicon: "../images/logo.png",
  heroImage: null,

  // Hours (CST/Chicago)
  hours: {
    timezone: "America/Chicago",
    openDays: [1, 2, 3, 4, 5, 6],
    openTime: { hour: 12, minute: 30 },
    closeTime: { hour: 19, minute: 30 },
    closedMessage: "Currently Closed · Opens Mon–Sat 12:30 PM",
    openMessage: "Open Now · Mon–Sat 12:30 PM – 7:30 PM",
  },

  // Checkout / Payment
  checkout: {
    // n8n webhook endpoint (free, visual workflow editor)
    endpoint: "https://n8n.systack.net/webhook/utopia-deli-order-v4",
    // Alternative: local checkout server (self-contained, no n8n dependency)
    // endpoint:    "https://order-utopia-deli.systack.net/checkout",
    squareDomain: "square.link",
    currency: "USD",
    currencySymbol: "$",
  },

  // Legal
  copyrightYear: 2026,
};

// ==============================================================
//  WHITE-LABEL CHECKLIST
// ==============================================================
//  1. Replace BRAND.name, .tagline, .location
//  2. Update BRAND.phone and BRAND.email
//  3. Replace logo.png in images/ folder
//  4. Replace product photos in images/ folder
//  5. Update menu-data.js with your menu items
//  6. Update BRAND.checkout.endpoint to your server/webhook
//  7. Update BRAND.hours to your schedule
//  8. Update CNAME file to your custom domain
//  9. Update DNS CNAME record at your registrar
// ==============================================================
