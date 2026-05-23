import { Product } from "../types";

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ProductSpecs {
  label: string;
  value: string;
}

// Deterministic default specifications based on category and name
export function getProductSpecs(category: string, name: string): ProductSpecs[] {
  const cat = category.toLowerCase();
  if (cat === "audio") {
    return [
      { label: "Acoustic Drivers", value: "40mm Dynamic Neodymium" },
      { label: "Frequency Response", value: "20Hz - 22,000Hz" },
      { label: "Active Noise Cancelling", value: "Hybrid Adaptive (Up to 42dB)" },
      { label: "Wireless Protocol", value: "Bluetooth 5.2 / AAC & SBC" },
      { label: "Battery Performance", value: "40 Hours ANC Off / 30 Hours ANC On" },
      { label: "Charge Type", value: "USB-C Fast Charge (10m = 4h)" },
      { label: "Physical Weight", value: "260g (Comfort Plush-Pads)" }
    ];
  } else if (cat === "accessories" || name.toLowerCase().includes("keyboard")) {
    return [
      { label: "Keyboard Layout", value: "75% ANSI Space Efficient (82-Key)" },
      { label: "Switch Type", value: "KeyCraft Ivory Linear Switches (Pre-Lubed)" },
      { label: "Hot-Swappable", value: "Yes (5-Pin PCB Socket Support)" },
      { label: "Keycap Material", value: "Thick Dye-Sublimated PBT" },
      { label: "Connection Speed", value: "USB-C / 2.4Ghz RF (1ms) / Bluetooth 5.0" },
      { label: "Dimensions", value: "318 x 128 x 38 mm" },
      { label: "Mounting Type", value: "Dampened Gasket-Mount Structure" }
    ];
  } else if (name.toLowerCase().includes("lamp") || name.toLowerCase().includes("light")) {
    return [
      { label: "Luminous Density", value: "450 Lumens (Max Output)" },
      { label: "Color Match CRI", value: "96+ (Circadian Daylight Matching)" },
      { label: "Color Spectrum", value: "2700K (Warm) - 6500K (Cool Breeze)" },
      { label: "Power Output", value: "10W Circadian LED Ring Array" },
      { label: "Material Frame", value: "Satin Solid Brass & Brushed Sand-Stem" },
      { label: "Control Surface", value: "Infinitely Variable Sliding Touch-Track" },
      { label: "Stand Height", value: "42 cm" }
    ];
  } else if (cat === "office" || name.toLowerCase().includes("mat") || name.toLowerCase().includes("desk")) {
    return [
      { label: "Material Sourcing", value: "100% Genuine Tasmanian Merino Wool Felt" },
      { label: "Product Thickness", value: "3.2 mm Comfort Padding" },
      { label: "Edge Finish", value: "Laser-Strained Non-Fray Edges" },
      { label: "Spill Resilience", value: "Water & Stain Resistant Hydro-Coat Shield" },
      { label: "Backing Friction", value: "Non-slip Natural Rubber Texture" },
      { label: "Overall Size", value: "900 mm x 400 mm" },
      { label: "Eco-Footprint", value: "Biodegradable, Carbon-Neutral Harvest" }
    ];
  } else if (cat === "kitchen" || name.toLowerCase().includes("carafe") || name.toLowerCase().includes("brew")) {
    return [
      { label: "Liquid Capacity", value: "600 ml (3 - 4 Elegant Drips)" },
      { label: "Glass Sourcing", value: "Premium Double-Walled Borosilicate Grade-A" },
      { label: "Thermal Range", value: "-30°C to 150°C (Shock Resilient)" },
      { label: "Inner Filter", value: "0.2mm Laser Cut Stainless Steel + Brass Finish" },
      { label: "Collar Handle", value: "Polished Walnut Wood with Raw Leather Tie" },
      { label: "Drip Rate", value: "Optimized Conical Flow Timing (approx 3m)" },
      { label: "Dishwasher Safe", value: "Glass carafe yes (remove wood collar)" }
    ];
  } else if (cat === "travel" || name.toLowerCase().includes("pack") || name.toLowerCase().includes("bag")) {
    return [
      { label: "Storage Volume", value: "22 Liters Compact Chamber" },
      { label: "Fabric Blend", value: "1000D Recycled Bio-Ballistic Polyester" },
      { label: "Waterproofing", value: "IPX-6 Rated Hydro-Dry Seams & YKK AquaGuards" },
      { label: "Laptop Protection", value: "Isolated Suspending Compartment (up to 16\" MB Pro)" },
      { label: "Strap Tech", value: "High-density Eva Foam with Breathable mesh backing" },
      { label: "Pockets Guard", value: "Rfid Protected Passport Pocket & Concealed Tile slot" },
      { label: "Chamber Weight", value: "850g (Extremely Light Frame)" }
    ];
  }

  // General defaults
  return [
    { label: "Material", value: "High-grade industrial polymer & metal accents" },
    { label: "Service Warranty", value: "2-Year Comprehensive global replacement" },
    { label: "Eco Rating", value: "Completely certified toxin-free" },
    { label: "Origin", value: "Ethically assembled in boutique workspace labs" }
  ];
}

// Seeded reviews matching default products
const defaultReviewsMap: Record<string, Review[]> = {
  prod_1: [
    { id: "rev_1_1", name: "David K.", rating: 5, comment: "Undeniable acoustic clarity. The noise cancellation creates a perfect silence bubble in noisy cafes. Battery life easily lasts me standard work weeks.", date: "2026-04-12" },
    { id: "rev_1_2", name: "Sophia M.", rating: 4, comment: "Extremely comfortable ear pads, though the sound is slightly bass-heavy. Easily adjusted through EQ.", date: "2026-05-01" },
    { id: "rev_1_3", name: "Marcus L.", rating: 5, comment: "I am a sound engineer and this matches gear three times the price. Impeccable transient response.", date: "2026-05-18" }
  ],
  prod_2: [
    { id: "rev_2_1", name: "Elena R.", rating: 5, comment: "The ivory switches are so creamy! The sound attenuation pads make this perfectly polite in my corporate office. Absolutely beautiful layout.", date: "2026-03-29" },
    { id: "rev_2_2", name: "Tyler S.", rating: 4, comment: "PBT keycaps feel luxurious and heavy. Lost points only because I would have liked RGB backlighting instead of static warm light.", date: "2026-04-15" }
  ],
  prod_3: [
    { id: "rev_3_1", name: "Hiroshi T.", rating: 5, comment: "Pure felt luxury. The mouse glides beautifully and it adds instant architectural layout to a minimalist oak table.", date: "2026-05-02" },
    { id: "rev_3_2", name: "Chloe A.", rating: 4, comment: "Authentic premium wool. Needs a bit of steam-ironing flat initially, but after that it lies completely flat and looks glorious.", date: "2026-05-11" }
  ],
  prod_4: [
    { id: "rev_4_1", name: "Aria J.", rating: 5, comment: "The circadian shifting schedule changed my evening coding flow. Solid design, and feels highly premium when touching the brass track.", date: "2026-04-20" },
    { id: "rev_4_2", name: "Lucas P.", rating: 4, comment: "Beautiful light emission, zero flicker. Frame has comfortable weight to it. Just wish the cord was slightly longer.", date: "2026-05-04" }
  ],
  prod_5: [
    { id: "rev_5_1", name: "Emma G.", rating: 5, comment: "The double wall is gorgeous to look at while pouring. Coffee remains warm for significantly longer than conventional ceramic carafes.", date: "2026-04-10" },
    { id: "rev_5_2", name: "Oliver D.", rating: 4, comment: "The filter lets some fines through but that gives awesome body to the cup. Handcrafted finish is outstanding.", date: "2026-04-25" }
  ],
  prod_6: [
    { id: "rev_6_1", name: "Sarah B.", rating: 5, comment: "Toured around Iceland with this bag. Withstood heavy showers, and the tablet partition kept everything super snug. 10/10.", date: "2026-05-15" },
    { id: "rev_6_2", name: "Felix W.", rating: 5, comment: "Excellent weight distribution. The shoulder pads don't dig in, even when fully packed with dual laptops.", date: "2026-05-22" }
  ]
};

// Retrieve reviews from localStorage combined with seed reviews
export function getProductReviews(productId: string): Review[] {
  const customStr = localStorage.getItem(`custom_reviews_${productId}`);
  let custom: Review[] = [];
  if (customStr) {
    try {
      custom = JSON.parse(customStr);
    } catch (_) {}
  }
  const defaults = defaultReviewsMap[productId] || [
    { id: `rev_def_0`, name: "Anonymous Workspace Owner", rating: 5, comment: "Perfect functional implementation. Minimal footprint and exquisite build quality.", date: "2026-05-20" }
  ];
  return [...custom, ...defaults];
}

// Compute review summary
export function getProductRating(productId: string): { average: number; count: number; reviews: Review[] } {
  const reviews = getProductReviews(productId);
  if (reviews.length === 0) {
    return { average: 5.0, count: 0, reviews: [] };
  }
  const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
  const average = Number((sum / reviews.length).toFixed(1));
  return { average, count: reviews.length, reviews };
}

// Save a review to storage
export function addProductReview(productId: string, name: string, rating: number, comment: string): Review {
  const reviews = getProductReviews(productId);
  const newReview: Review = {
    id: `rev_custom_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    name: name.trim() || "Verified Buyer",
    rating,
    comment: comment.trim(),
    date: new Date().toISOString().split("T")[0]
  };
  
  const customStr = localStorage.getItem(`custom_reviews_${productId}`);
  let custom: Review[] = [];
  if (customStr) {
    try {
      custom = JSON.parse(customStr);
    } catch (_) {}
  }
  custom.unshift(newReview);
  localStorage.setItem(`custom_reviews_${productId}`, JSON.stringify(custom));
  return newReview;
}
