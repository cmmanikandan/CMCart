/**
 * CMCart Core Catalog & E-Commerce Seed Data
 */

export const INITIAL_CATEGORIES = [
  {
    id: "cat-electronics",
    name: "Electronics",
    slug: "electronics",
    description: "Smartphones, Audio, Wearables & Smart Home tech",
    icon: "Smartphone",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80",
    itemCount: 1420,
    is_active: true,
  },
  {
    id: "cat-fashion",
    name: "Fashion",
    slug: "fashion",
    description: "Trending Apparel, Footwear, Watches & Accessories",
    icon: "Shirt",
    image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&auto=format&fit=crop&q=80",
    itemCount: 3840,
    is_active: true,
  },
  {
    id: "cat-home",
    name: "Home & Living",
    slug: "home-living",
    description: "Furniture, Decor, Kitchen Appliances & Essentials",
    icon: "Home",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80",
    itemCount: 2150,
    is_active: true,
  },
  {
    id: "cat-beauty",
    name: "Beauty & Personal Care",
    slug: "beauty-personal-care",
    description: "Skincare, Fragrances, Grooming & Wellness",
    icon: "Sparkles",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=80",
    itemCount: 960,
    is_active: true,
  },
  {
    id: "cat-sports",
    name: "Sports & Fitness",
    slug: "sports-fitness",
    description: "Gym Gear, Activewear, Footwear & Supplements",
    icon: "Dumbbell",
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
    itemCount: 820,
    is_active: true,
  },
  {
    id: "cat-books",
    name: "Books & Stationery",
    slug: "books-stationery",
    description: "Bestsellers, Fiction, Notebooks & Art Supplies",
    icon: "BookOpen",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&auto=format&fit=crop&q=80",
    itemCount: 1640,
    is_active: true,
  },
  {
    id: "cat-toys",
    name: "Toys & Games",
    slug: "toys-games",
    description: "Action Figures, Board Games, STEM & Puzzles",
    icon: "Gamepad2",
    image: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600&auto=format&fit=crop&q=80",
    itemCount: 640,
    is_active: true,
  },
];

export const INITIAL_BANNERS = [
  {
    id: "ban-1",
    title: "Big Savings Up to 60% Off",
    subtitle: "Mega Electronics & Smart Living Sale. Grab the lowest prices of the season.",
    tag: "FEATURED DEAL",
    badge: "LIMITED TIME",
    cta_text: "Shop Deals Now",
    cta_link: "/products?filter=deals",
    image_url: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&auto=format&fit=crop&q=80",
    bg_gradient: "from-[#171717] to-[#262626]",
    is_active: true,
  },
  {
    id: "ban-2",
    title: "Premium Audio & Noise Cancelling",
    subtitle: "Experience studio sound everywhere with up to 45% discount on top headphones.",
    tag: "NEW ARRIVALS",
    badge: "TOP PICKS",
    cta_text: "Explore Audio",
    cta_link: "/category/electronics",
    image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1600&auto=format&fit=crop&q=80",
    bg_gradient: "from-[#0f172a] to-[#1e293b]",
    is_active: true,
  },
  {
    id: "ban-3",
    title: "Elevate Your Streetwear Style",
    subtitle: "Discover the latest urban streetwear and sneakers for the season.",
    tag: "TRENDING NOW",
    badge: "FLAT 40% OFF",
    cta_text: "Browse Fashion",
    cta_link: "/category/fashion",
    image_url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&auto=format&fit=crop&q=80",
    bg_gradient: "from-[#18181b] to-[#27272a]",
    is_active: true,
  },
];

export const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    name: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
    slug: "sony-wh-1000xm5-noise-cancelling-headphones",
    category_id: "cat-electronics",
    category_name: "Electronics",
    brand: "Sony",
    sku: "SONY-WH1000XM5-BLK",
    current_price: 26990,
    original_price: 34990,
    discount_percentage: 23,
    rating: 4.8,
    review_count: 1420,
    stock: 24,
    status: "in_stock",
    is_active: true,
    is_featured: true,
    is_deal_of_the_day: true,
    is_best_seller: true,
    is_new_arrival: false,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { id: "var-1a", name: "Midnight Black", price: 26990, stock: 15, color: "#111111" },
      { id: "var-1b", name: "Platinum Silver", price: 26990, stock: 9, color: "#E5E5E5" }
    ],
    description: "Industry-leading noise cancellation optimized with two processors and 8 microphones. Magnificent sound quality engineered with precision, crystal-clear hands-free calling, and up to 30 hours of battery life with ultra-fast charging.",
    specifications: {
      "Driver Unit": "30mm precision carbon fiber dome",
      "Battery Life": "Up to 30 Hours (ANC ON)",
      "Connectivity": "Bluetooth 5.2, Multipoint connection",
      "Weight": "250g",
      "Warranty": "1 Year Manufacturer Warranty"
    },
    offers: [
      "Bank Offer: 10% instant discount up to ₹1,500 on HDFC Cards",
      "No Cost EMI available on major credit cards",
      "Get CMCart Protection Plan 1 Year at ₹999"
    ]
  },
  {
    id: "prod-2",
    name: "Apple Watch Series 9 GPS 45mm Midnight Aluminum",
    slug: "apple-watch-series-9-gps-45mm",
    category_id: "cat-electronics",
    category_name: "Electronics",
    brand: "Apple",
    sku: "APL-W9-45-MID",
    current_price: 39999,
    original_price: 44900,
    discount_percentage: 11,
    rating: 4.9,
    review_count: 890,
    stock: 14,
    status: "in_stock",
    is_active: true,
    is_featured: true,
    is_deal_of_the_day: false,
    is_best_seller: true,
    is_new_arrival: true,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { id: "var-2a", name: "Midnight Sport Band", price: 39999, stock: 8, color: "#1E293B" },
      { id: "var-2b", name: "Starlight Sport Band", price: 39999, stock: 6, color: "#F1F5F9" }
    ],
    description: "Smartest, brightest, most powerful Apple Watch. Powerful S9 chip enables a magical way to use your watch without touching the screen via double tap gesture. Advanced health sensors and crash detection.",
    specifications: {
      "Display": "Always-On Retina display up to 2000 nits",
      "Chip": "S9 SiP with 64-bit dual-core processor",
      "Water Resistance": "50 meters swimproof",
      "Sensors": "ECG, Blood Oxygen, Temperature sensor"
    },
    offers: [
      "Flat ₹2,500 Instant Cashback on ICICI Cards",
      "Exchange bonus up to ₹5,000 on your old smartwatch"
    ]
  },
  {
    id: "prod-3",
    name: "Nike Air Max 270 React Premium Sneakers",
    slug: "nike-air-max-270-react-premium-sneakers",
    category_id: "cat-fashion",
    category_name: "Fashion",
    brand: "Nike",
    sku: "NK-AM270-BLK",
    current_price: 9495,
    original_price: 13995,
    discount_percentage: 32,
    rating: 4.7,
    review_count: 530,
    stock: 18,
    status: "in_stock",
    is_active: true,
    is_featured: true,
    is_deal_of_the_day: true,
    is_best_seller: true,
    is_new_arrival: false,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { id: "var-3a", name: "Size UK 8", price: 9495, stock: 5, size: "UK 8" },
      { id: "var-3b", name: "Size UK 9", price: 9495, stock: 7, size: "UK 9" },
      { id: "var-3c", name: "Size UK 10", price: 9495, stock: 6, size: "UK 10" }
    ],
    description: "The Nike Air Max 270 React blends Nike's biggest heel Air unit with lightweight, springy Nike React foam for non-stop cushioning that feels as extraordinary as it looks.",
    specifications: {
      "Sole Material": "Durable rubber outsole with high traction",
      "Closure": "Lace-Up",
      "Upper Material": "Breathable knit and synthetic overlays",
      "Ideal For": "Men's Lifestyle & Running"
    },
    offers: [
      "Get 10% off with coupon code WELCOME50",
      "Free 7-day hassle-free doorstep returns and exchanges"
    ]
  },
  {
    id: "prod-4",
    name: "Minimalist Matte Black Ceramic Dinnerware Set (16-Piece)",
    slug: "matte-black-ceramic-dinnerware-set",
    category_id: "cat-home",
    category_name: "Home & Living",
    brand: "UrbanHome",
    sku: "UH-DIN-BLK16",
    current_price: 3499,
    original_price: 5999,
    discount_percentage: 42,
    rating: 4.6,
    review_count: 240,
    stock: 12,
    status: "in_stock",
    is_active: true,
    is_featured: false,
    is_deal_of_the_day: false,
    is_best_seller: false,
    is_new_arrival: true,
    images: [
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { id: "var-4a", name: "Matte Black", price: 3499, stock: 8, color: "#1C1C1C" },
      { id: "var-4b", name: "Natural Terracotta", price: 3699, stock: 4, color: "#C86D51" }
    ],
    description: "Crafted from natural stoneware clay with an artisanal organic rim and soft satin-matte glaze. Dishwasher and microwave safe. Includes 4 dinner plates, 4 salad plates, 4 cereal bowls, and 4 mugs.",
    specifications: {
      "Material": "100% Lead-Free Stoneware",
      "Microwave Safe": "Yes",
      "Dishwasher Safe": "Yes",
      "Piece Count": "16 Pieces"
    },
    offers: [
      "Buy 2 get additional 10% off automatically applied at cart"
    ]
  },
  {
    id: "prod-5",
    name: "Dyson V12 Detect Slim Total Clean Cordless Vacuum",
    slug: "dyson-v12-detect-slim-vacuum",
    category_id: "cat-home",
    category_name: "Home & Living",
    brand: "Dyson",
    sku: "DYS-V12-SLIM",
    current_price: 49900,
    original_price: 55900,
    discount_percentage: 11,
    rating: 4.9,
    review_count: 380,
    stock: 5,
    status: "low_stock",
    is_active: true,
    is_featured: true,
    is_deal_of_the_day: false,
    is_best_seller: false,
    is_new_arrival: true,
    images: [
      "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { id: "var-5a", name: "Nickel / Yellow", price: 49900, stock: 5 }
    ],
    description: "Dyson's lightest intelligent cordless vacuum with laser illumination that reveals microscopic dust on hard floors. Piezo sensor continuously sizes and counts dust particles.",
    specifications: {
      "Suction Power": "150 AW",
      "Run Time": "Up to 60 Minutes",
      "Bin Volume": "0.35 L",
      "Weight": "2.2 kg"
    },
    offers: [
      "Free 2-year Dyson accidental coverage on registration"
    ]
  },
  {
    id: "prod-6",
    name: "The Ordinary Niacinamide 10% + Zinc 1% Blemish Formula",
    slug: "the-ordinary-niacinamide-10-zinc-1",
    category_id: "cat-beauty",
    category_name: "Beauty & Personal Care",
    brand: "The Ordinary",
    sku: "ORD-NIA-30ML",
    current_price: 599,
    original_price: 750,
    discount_percentage: 20,
    rating: 4.8,
    review_count: 3200,
    stock: 80,
    status: "in_stock",
    is_active: true,
    is_featured: false,
    is_deal_of_the_day: true,
    is_best_seller: true,
    is_new_arrival: false,
    images: [
      "https://images.unsplash.com/photo-1608248597359-5776d5e16ec8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { id: "var-6a", name: "30 ml", price: 599, stock: 50 },
      { id: "var-6b", name: "60 ml", price: 1099, stock: 30 }
    ],
    description: "A high-strength vitamin and mineral blemish formula with 10% pure Niacinamide and 1% Zinc PCA to visibly reduce the appearance of skin blemishes and congestion.",
    specifications: {
      "Skin Type": "Oily, Combination, Blemish-Prone",
      "Volume": "30ml / 60ml",
      "Cruelty-Free": "Yes",
      "Fragrance-Free": "Yes"
    },
    offers: [
      "Buy 3 beauty products and get 15% off with code BEAUTY15"
    ]
  },
  {
    id: "prod-7",
    name: "Bose SoundLink Flex Portable Bluetooth Speaker Waterproof",
    slug: "bose-soundlink-flex-portable-bluetooth-speaker",
    category_id: "cat-electronics",
    category_name: "Electronics",
    brand: "Bose",
    sku: "BOSE-FLEX-BLU",
    current_price: 12999,
    original_price: 15900,
    discount_percentage: 18,
    rating: 4.8,
    review_count: 610,
    stock: 22,
    status: "in_stock",
    is_active: true,
    is_featured: true,
    is_deal_of_the_day: false,
    is_best_seller: true,
    is_new_arrival: false,
    images: [
      "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { id: "var-7a", name: "Stone Blue", price: 12999, stock: 12, color: "#3B82F6" },
      { id: "var-7b", name: "Carmine Red", price: 12999, stock: 10, color: "#E63946" }
    ],
    description: "Clear, deep sound with rugged waterproof and dustproof IP67 design. PositionIQ technology detects its orientation to deliver optimal acoustic performance.",
    specifications: {
      "Battery Life": "Up to 12 hours",
      "IP Rating": "IP67 Waterproof & Dustproof",
      "Bluetooth": "Version 4.2 with 30ft range"
    },
    offers: [
      "Flat ₹1,000 off on Prepaid orders"
    ]
  },
  {
    id: "prod-8",
    name: "Classic Heavyweight Cotton Oversized Boxy Tee",
    slug: "classic-heavyweight-cotton-oversized-boxy-tee",
    category_id: "cat-fashion",
    category_name: "Fashion",
    brand: "CMCart Essentials",
    sku: "CMC-TEE-OVZ-WHT",
    current_price: 899,
    original_price: 1499,
    discount_percentage: 40,
    rating: 4.5,
    review_count: 750,
    stock: 45,
    status: "in_stock",
    is_active: true,
    is_featured: false,
    is_deal_of_the_day: true,
    is_best_seller: true,
    is_new_arrival: true,
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { id: "var-8s", name: "Size S", price: 899, stock: 10, size: "S" },
      { id: "var-8m", name: "Size M", price: 899, stock: 18, size: "M" },
      { id: "var-8l", name: "Size L", price: 899, stock: 17, size: "L" }
    ],
    description: "Crafted from 240 GSM 100% combed ring-spun organic cotton with reinforced collar ribbing and drop shoulders for a clean streetwear silhouette.",
    specifications: {
      "Fabric": "240 GSM 100% Cotton",
      "Fit": "Relaxed Oversized Fit",
      "Wash Care": "Machine wash cold with like colors"
    },
    offers: [
      "Buy 2 for ₹1,599 (Save extra ₹200)"
    ]
  },
  {
    id: "prod-9",
    name: "Pro-Grip Hexagonal Rubber Coated Dumbbell Set (Pair)",
    slug: "pro-grip-hexagonal-rubber-coated-dumbbell-set",
    category_id: "cat-sports",
    category_name: "Sports & Fitness",
    brand: "FitPro",
    sku: "FP-HEX-DB10",
    current_price: 2499,
    original_price: 3999,
    discount_percentage: 38,
    rating: 4.7,
    review_count: 180,
    stock: 16,
    status: "in_stock",
    is_active: true,
    is_featured: false,
    is_deal_of_the_day: false,
    is_best_seller: false,
    is_new_arrival: false,
    images: [
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { id: "var-9a", name: "5 kg Pair", price: 1699, stock: 8 },
      { id: "var-9b", name: "10 kg Pair", price: 2499, stock: 8 }
    ],
    description: "Solid cast iron core encased in premium thick rubber to protect gym floors and eliminate rolling. Ergonomically knurled chrome steel handle provides superior grip.",
    specifications: {
      "Material": "Solid Cast Iron + Virgin Rubber Coating",
      "Handle": "Ergonomic Knurled Steel",
      "Shape": "Anti-Roll Hexagonal"
    },
    offers: [
      "Free doorstep delivery on fitness equipment"
    ]
  },
  {
    id: "prod-10",
    name: "Atomic Habits by James Clear (Hardcover Collector's Edition)",
    slug: "atomic-habits-james-clear-hardcover",
    category_id: "cat-books",
    category_name: "Books & Stationery",
    brand: "Penguin Random House",
    sku: "BK-ATOM-HB",
    current_price: 649,
    original_price: 999,
    discount_percentage: 35,
    rating: 4.9,
    review_count: 5400,
    stock: 60,
    status: "in_stock",
    is_active: true,
    is_featured: false,
    is_deal_of_the_day: true,
    is_best_seller: true,
    is_new_arrival: false,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { id: "var-10a", name: "Hardcover", price: 649, stock: 35 },
      { id: "var-10b", name: "Paperback", price: 499, stock: 25 }
    ],
    description: "The #1 New York Times bestseller with over 15 million copies sold worldwide. A proven framework for improving every day through tiny changes and remarkable results.",
    specifications: {
      "Format": "Hardcover",
      "Pages": "320 pages",
      "Language": "English",
      "Publisher": "Random House Business"
    },
    offers: [
      "Special bookmark and reading notes included free"
    ]
  },
  {
    id: "prod-11",
    name: "Sony Alpha 7 IV Full-Frame Mirrorless Camera Body",
    slug: "sony-alpha-7-iv-mirrorless-camera",
    category_id: "cat-electronics",
    category_name: "Electronics",
    brand: "Sony",
    sku: "SNY-A7IV-BDY",
    current_price: 194990,
    original_price: 224990,
    discount_percentage: 13,
    rating: 4.9,
    review_count: 310,
    stock: 7,
    status: "in_stock",
    is_active: true,
    is_featured: true,
    is_deal_of_the_day: false,
    is_best_seller: false,
    is_new_arrival: true,
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { id: "var-11a", name: "Body Only", price: 194990, stock: 4 },
      { id: "var-11b", name: "With 28-70mm Lens", price: 214990, stock: 3 }
    ],
    description: "33MP full-frame Exmor R back-illuminated CMOS sensor with real-time Eye AF for humans, animals, and birds. 4K 60p 10-bit 4:2:2 video recording.",
    specifications: {
      "Sensor": "33MP Full-Frame Exmor R",
      "Video": "4K 60p 10-bit 4:2:2",
      "Stabilization": "5.5-stop 5-axis in-body IS"
    },
    offers: [
      "Complimentary 128GB High Speed V90 SD Card worth ₹9,999"
    ]
  },
  {
    id: "prod-12",
    name: "Lego Icons Bonsai Tree 10281 Building Kit",
    slug: "lego-icons-bonsai-tree-10281",
    category_id: "cat-toys",
    category_name: "Toys & Games",
    brand: "LEGO",
    sku: "LG-BONSAI-10281",
    current_price: 4499,
    original_price: 5999,
    discount_percentage: 25,
    rating: 4.8,
    review_count: 1100,
    stock: 20,
    status: "in_stock",
    is_active: true,
    is_featured: false,
    is_deal_of_the_day: false,
    is_best_seller: true,
    is_new_arrival: false,
    images: [
      "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800&auto=format&fit=crop&q=80"
    ],
    variants: [
      { id: "var-12a", name: "Standard Set", price: 4499, stock: 20 }
    ],
    description: "A mindful building project featuring interchangeable green leaves and vibrant pink cherry blossoms. Includes rectangular pot and wood-effect slatted stand.",
    specifications: {
      "Pieces": "878 pieces",
      "Age Range": "18+ Adult Builders",
      "Dimensions": "Over 18 cm high, 21 cm long"
    },
    offers: [
      "Flat ₹300 off for CMCart Club members"
    ]
  }
];

export const INITIAL_COUPONS = [
  {
    id: "coup-1",
    code: "WELCOME50",
    description: "Flat ₹500 off on your first order above ₹1,999",
    discount_type: "fixed",
    discount_value: 500,
    minimum_order_amount: 1999,
    maximum_discount_amount: 500,
    is_active: true,
    times_used: 142,
    usage_limit: 1000
  },
  {
    id: "coup-2",
    code: "BIGSAVER15",
    description: "15% discount up to ₹1,200 on all orders",
    discount_type: "percentage",
    discount_value: 15,
    minimum_order_amount: 1499,
    maximum_discount_amount: 1200,
    is_active: true,
    times_used: 388,
    usage_limit: 2500
  },
  {
    id: "coup-3",
    code: "FREESHIP",
    description: "Free express delivery on all orders with no minimum",
    discount_type: "fixed",
    discount_value: 99,
    minimum_order_amount: 0,
    maximum_discount_amount: 99,
    is_active: true,
    times_used: 812,
    usage_limit: 5000
  }
];

export const INITIAL_ADDRESSES = [
  {
    id: "addr-1",
    full_name: "Rahul Sharma",
    phone: "+91 98765 43210",
    address_line: "Flat 402, Skyline Residency, 14th Main Road, Indiranagar",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560038",
    type: "Home",
    is_default: true
  },
  {
    id: "addr-2",
    full_name: "Rahul Sharma",
    phone: "+91 98765 43210",
    address_line: "Tech Park 4, Wing B, Level 6, Whitefield",
    city: "Bengaluru",
    state: "Karnataka",
    pincode: "560066",
    type: "Office",
    is_default: false
  }
];

export const INITIAL_ORDERS = [
  {
    id: "ord-80912",
    order_number: "CMC-2026-80912",
    date: "2026-10-06T14:30:00Z",
    status: "Shipped",
    estimated_delivery: "Tomorrow, 8:00 PM",
    tracking_number: "BLUEDART-8891244",
    carrier: "BlueDart Express",
    subtotal: 26990,
    discount_amount: 1200,
    delivery_fee: 0,
    tax_amount: 4642,
    total_amount: 30432,
    payment_method: "UPI (Google Pay)",
    payment_status: "Completed",
    shipping_address: INITIAL_ADDRESSES[0],
    items: [
      {
        id: "item-1",
        product_id: "prod-1",
        product_name: "Sony WH-1000XM5 Wireless Noise-Cancelling Headphones",
        variant: "Midnight Black",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
        unit_price: 26990,
        quantity: 1,
        total: 26990
      }
    ],
    timeline: [
      { status: "Order Placed", time: "Oct 6, 2:30 PM", completed: true, note: "Order placed successfully" },
      { status: "Packed", time: "Oct 6, 6:15 PM", completed: true, note: "Item packed at Bengaluru Fulfillment Center" },
      { status: "Shipped", time: "Oct 7, 9:00 AM", completed: true, note: "Handed over to carrier BlueDart" },
      { status: "Out for Delivery", time: "Expected Oct 8", completed: false, note: "Courier executive will contact before delivery" },
      { status: "Delivered", time: "Expected Oct 8", completed: false, note: "Safe doorstep delivery" }
    ]
  },
  {
    id: "ord-74102",
    order_number: "CMC-2026-74102",
    date: "2026-09-28T10:15:00Z",
    status: "Delivered",
    estimated_delivery: "Delivered on Sep 30",
    tracking_number: "DELHIVERY-7741290",
    carrier: "Delhivery",
    subtotal: 10094,
    discount_amount: 500,
    delivery_fee: 0,
    tax_amount: 1726,
    total_amount: 11320,
    payment_method: "Credit Card (HDFC)",
    payment_status: "Completed",
    shipping_address: INITIAL_ADDRESSES[0],
    items: [
      {
        id: "item-2",
        product_id: "prod-3",
        product_name: "Nike Air Max 270 React Premium Sneakers",
        variant: "Size UK 9",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80",
        unit_price: 9495,
        quantity: 1,
        total: 9495
      },
      {
        id: "item-3",
        product_id: "prod-6",
        product_name: "The Ordinary Niacinamide 10% + Zinc 1% Blemish Formula",
        variant: "30 ml",
        image: "https://images.unsplash.com/photo-1608248597359-5776d5e16ec8?w=800&auto=format&fit=crop&q=80",
        unit_price: 599,
        quantity: 1,
        total: 599
      }
    ],
    timeline: [
      { status: "Order Placed", time: "Sep 28, 10:15 AM", completed: true },
      { status: "Packed", time: "Sep 28, 4:20 PM", completed: true },
      { status: "Shipped", time: "Sep 29, 8:40 AM", completed: true },
      { status: "Out for Delivery", time: "Sep 30, 9:10 AM", completed: true },
      { status: "Delivered", time: "Sep 30, 2:45 PM", completed: true, note: "Delivered to Rahul Sharma with OTP verification" }
    ]
  }
];

export const INITIAL_REVIEWS = [
  {
    id: "rev-1",
    product_id: "prod-1",
    user_name: "Vikram Malhotra",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
    rating: 5,
    date: "Oct 2, 2026",
    title: "Unmatched noise cancelling and clarity",
    comment: "Upgraded from XM3 and the jump in comfort and microphone quality is monumental. The auto-NC optimizer works flawlessly during flights.",
    is_verified_purchase: true,
    helpful_count: 42
  },
  {
    id: "rev-2",
    product_id: "prod-1",
    user_name: "Ananya Deshmukh",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80",
    rating: 5,
    date: "Sep 26, 2026",
    title: "Worth every rupee!",
    comment: "Battery lasts for nearly a week with 4-5 hours daily usage. Fast charging gave me 3 hours of play in just 3 minutes when I was rushing.",
    is_verified_purchase: true,
    helpful_count: 19
  },
  {
    id: "rev-3",
    product_id: "prod-3",
    user_name: "Arjun Verma",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
    rating: 4,
    date: "Sep 29, 2026",
    title: "Super comfortable for walking",
    comment: "The React foam cushion is genuinely springy. Looks striking in real life, goes great with joggers or jeans.",
    is_verified_purchase: true,
    helpful_count: 14
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: "notif-1",
    title: "Order Shipped! 🚀",
    message: "Your Sony WH-1000XM5 headphones order #CMC-2026-80912 has been shipped via BlueDart.",
    time: "2 hours ago",
    type: "order",
    link: "/order/ord-80912/tracking",
    is_read: false
  },
  {
    id: "notif-2",
    title: "Price Drop Alert! 📉",
    message: "An item on your wishlist (Apple Watch Series 9) is now available at 11% OFF.",
    time: "Yesterday",
    type: "price_drop",
    link: "/product/prod-2",
    is_read: false
  },
  {
    id: "notif-3",
    title: "Special Festival Coupon Active 🎉",
    message: "Use code BIGSAVER15 to get 15% discount on all purchases today.",
    time: "2 days ago",
    type: "promo",
    link: "/coupons",
    is_read: true
  }
];
