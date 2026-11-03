import { createServerFn } from "@tanstack/react-start";

// All storefront data is fetched from local curated farm inventory + DummyJSON API.
const API = "https://dummyjson.com";

type DJProduct = {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  thumbnail: string;
  images: string[];
};

type DJCategory = { slug: string; name: string; url: string };

export type StoreProduct = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  unit: string;
  stock: number;
  images: string[];
  rating: number;
  sold_count: number;
  is_on_sale: boolean;
  is_featured: boolean;
  category_id: string | null;
  categories: { name: string; slug: string } | null;
};

export type StoreCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  sort_order: number;
};

const ICONS: Record<string, string> = {
  beauty: "💄",
  fragrances: "🌸",
  furniture: "🛋️",
  groceries: "🥦",
  "home-decoration": "🪴",
  "kitchen-accessories": "🍽️",
  laptops: "💻",
  "mens-shirts": "👔",
  "mens-shoes": "👞",
  "mens-watches": "⌚",
  "mobile-accessories": "📱",
  motorcycle: "🏍️",
  "skin-care": "🧴",
  smartphones: "📱",
  "sports-accessories": "🏀",
  sunglasses: "🕶️",
  tablets: "📱",
  tops: "👚",
  vehicle: "🚗",
  "womens-bags": "👜",
  "womens-dresses": "👗",
  "womens-jewellery": "💍",
  "womens-shoes": "👠",
  "womens-watches": "⌚",
};

const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ec4899", "#8b5cf6", "#f43f5e", "#14b8a6"];

// ── CURATED BASKETO FARM-FRESH GROCERY CATALOG ─────────────────────────
const BASE_BASKETO_PRODUCTS: StoreProduct[] = [
  {
    id: "bk-1",
    name: "Devgad Ratnagiri Alphonso Mangoes",
    slug: "bk-1-alphonso-mangoes",
    description:
      "Naturally tree-ripened, GI-tagged premium Alphonso mangoes with rich saffron aroma and zero carbide ripening.",
    price: 499,
    compare_at_price: 699,
    unit: "1 kg box (4-5 pcs)",
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80",
      "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&q=80",
    ],
    rating: 4.9,
    sold_count: 2430,
    is_on_sale: true,
    is_featured: true,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-2",
    name: "Shimla Crisp Royal Gala Apples",
    slug: "bk-2-shimla-gala-apples",
    description:
      "Crisp, naturally sweet apples hand-picked from high-altitude Himachal orchards. Wax-free and washed.",
    price: 149,
    compare_at_price: 199,
    unit: "4 pcs (~600g)",
    stock: 60,
    images: [
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&q=80",
      "https://images.unsplash.com/photo-1579613832125-5d34a13ffe0a?w=800&q=80",
    ],
    rating: 4.8,
    sold_count: 1890,
    is_on_sale: true,
    is_featured: true,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-3",
    name: "Farm Fresh A2 Whole Cow Milk",
    slug: "bk-3-a2-cow-milk",
    description:
      "Single-origin, pasteurised whole milk from grass-fed Gir cows. Rich in A2 beta-casein with creamy natural malai.",
    price: 84,
    compare_at_price: 95,
    unit: "1 Liter Pouch",
    stock: 120,
    images: [
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80",
      "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&q=80",
    ],
    rating: 4.9,
    sold_count: 5120,
    is_on_sale: true,
    is_featured: true,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-4",
    name: "Vedic Bilona Cultured Desi Cow Ghee",
    slug: "bk-4-vedic-bilona-ghee",
    description:
      "Prepared using traditional clay pot and wooden churner bilona method. Danedar texture with authentic aroma.",
    price: 680,
    compare_at_price: 850,
    unit: "500 ml Glass Jar",
    stock: 35,
    images: ["https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=800&q=80"],
    rating: 5.0,
    sold_count: 1240,
    is_on_sale: true,
    is_featured: true,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-5",
    name: "Hydroponic Crisp Baby Spinach (Palak)",
    slug: "bk-5-hydroponic-baby-spinach",
    description:
      "Zero pesticides, hydro-grown tender spinach leaves. Pre-washed in UV filtered water, ready to cook.",
    price: 42,
    compare_at_price: 60,
    unit: "250 g Box",
    stock: 80,
    images: ["https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&q=80"],
    rating: 4.7,
    sold_count: 3100,
    is_on_sale: true,
    is_featured: true,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-6",
    name: "Free-Range Farm Brown Eggs",
    slug: "bk-6-free-range-brown-eggs",
    description:
      "High protein farm eggs from antibiotic-free, free-roaming hens with deep golden yolks. Graded & UV sanitized.",
    price: 89,
    compare_at_price: 110,
    unit: "Pack of 6",
    stock: 95,
    images: [
      "https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=800&q=80",
      "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=800&q=80",
    ],
    rating: 4.9,
    sold_count: 4200,
    is_on_sale: true,
    is_featured: true,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-7",
    name: "Artisanal Herb Sourdough Country Loaf",
    slug: "bk-7-artisanal-herb-sourdough",
    description:
      "Wild yeast slow-fermented for 36 hours with rosemary and sea salt crust. Easy to digest and wonderfully chewy.",
    price: 119,
    compare_at_price: 160,
    unit: "400 g Loaf",
    stock: 25,
    images: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80"],
    rating: 4.8,
    sold_count: 980,
    is_on_sale: true,
    is_featured: true,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-8",
    name: "Fresh Malai Cottage Cheese (Paneer)",
    slug: "bk-8-fresh-malai-paneer",
    description:
      "Soft, spongy cubes made from 100% cow milk with zero starch or artificial whiteners. Melts in curries.",
    price: 95,
    compare_at_price: 120,
    unit: "200 g Vacuum Pack",
    stock: 50,
    images: ["https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&q=80"],
    rating: 4.8,
    sold_count: 2890,
    is_on_sale: true,
    is_featured: true,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-9",
    name: "Organic Mahabaleshwar Sweet Strawberries",
    slug: "bk-9-mahabaleshwar-strawberries",
    description:
      "Deep red, fragrant winter harvest strawberries packed at the farm to preserve freshness and vitamin C.",
    price: 129,
    compare_at_price: 180,
    unit: "200 g Punnet",
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&q=80",
      "https://images.unsplash.com/photo-1587393855524-087f83d95bc9?w=800&q=80",
    ],
    rating: 4.9,
    sold_count: 1750,
    is_on_sale: true,
    is_featured: true,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-10",
    name: "Hass Avocados (Ready to Eat)",
    slug: "bk-10-hass-avocados",
    description:
      "Creamy, nutrient-rich Haas avocados with rich healthy fats. Perfect for morning avocado toast and guacamole.",
    price: 199,
    compare_at_price: 280,
    unit: "2 pcs (~400g)",
    stock: 35,
    images: ["https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&q=80"],
    rating: 4.7,
    sold_count: 1120,
    is_on_sale: true,
    is_featured: true,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-11",
    name: "Fresh Pollachi Tender Coconut",
    slug: "bk-11-tender-coconut",
    description:
      "Sweet electrolyte-rich natural water with soft tender coconut malai inside. Cut & trimmed for easy opening.",
    price: 59,
    compare_at_price: 75,
    unit: "1 pc (~350ml water)",
    stock: 140,
    images: ["https://images.unsplash.com/photo-1544378730-8b5104b18790?w=800&q=80"],
    rating: 4.9,
    sold_count: 6400,
    is_on_sale: true,
    is_featured: true,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-12",
    name: "Fresh White Button Mushrooms",
    slug: "bk-12-white-button-mushrooms",
    description:
      "Plump, spotless white button mushrooms grown in temperature-regulated sterile rooms.",
    price: 52,
    compare_at_price: 70,
    unit: "200 g Box",
    stock: 55,
    images: ["https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80"],
    rating: 4.7,
    sold_count: 1640,
    is_on_sale: true,
    is_featured: false,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-13",
    name: "Cold-Pressed Extra Virgin Olive Oil",
    slug: "bk-13-extra-virgin-olive-oil",
    description:
      "First cold pressed from selected Mediterranean olives. Acidity < 0.3%, rich in antioxidants and polyphenols.",
    price: 549,
    compare_at_price: 720,
    unit: "500 ml Dark Bottle",
    stock: 30,
    images: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80"],
    rating: 4.9,
    sold_count: 850,
    is_on_sale: true,
    is_featured: true,
    category_id: "kitchen-accessories",
    categories: { name: "Kitchen", slug: "kitchen-accessories" },
  },
  {
    id: "bk-14",
    name: "Daawat Rozana Aged Super Basmati Rice",
    slug: "bk-14-daawat-basmati-rice",
    description:
      "Naturally aged long grain basmati rice. Fluffy, non-sticky grains with captivating royal aroma.",
    price: 460,
    compare_at_price: 580,
    unit: "5 kg Zip Bag",
    stock: 70,
    images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80"],
    rating: 4.8,
    sold_count: 2200,
    is_on_sale: true,
    is_featured: true,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-15",
    name: "California Whole Raw Almonds (Badam)",
    slug: "bk-15-california-almonds",
    description:
      "Crisp, premium jumbo California almonds. 100% natural, unpolished and packed with protein & vitamin E.",
    price: 389,
    compare_at_price: 499,
    unit: "500 g Vacuum Pouch",
    stock: 85,
    images: ["https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800&q=80"],
    rating: 4.9,
    sold_count: 3100,
    is_on_sale: true,
    is_featured: true,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-16",
    name: "Roasted Lightly Salted California Pistachios",
    slug: "bk-16-roasted-salted-pistachios",
    description:
      "Slow dry-roasted in shell with natural Himalayan salt. High fiber, crunchy and heart healthy.",
    price: 449,
    compare_at_price: 599,
    unit: "250 g Zip Pouch",
    stock: 45,
    images: ["https://images.unsplash.com/photo-1525441273400-056e9c7517b3?w=800&q=80"],
    rating: 4.8,
    sold_count: 1420,
    is_on_sale: true,
    is_featured: false,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-17",
    name: "Raw Himalayan Multifloral Wild Honey",
    slug: "bk-17-raw-himalayan-honey",
    description:
      "Unfiltered, unpasteurized natural honey collected from wild bees in Uttarakhand pine forests. Rich in pollen enzymes.",
    price: 290,
    compare_at_price: 380,
    unit: "500 g Glass Jar",
    stock: 40,
    images: ["https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80"],
    rating: 4.9,
    sold_count: 1980,
    is_on_sale: true,
    is_featured: true,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-18",
    name: "South Indian Artisan Filter Coffee Blend",
    slug: "bk-18-filter-coffee-blend",
    description:
      "80% Arabica & Robusta beans with 20% high grade chicory. Freshly roasted in Chikmagalur.",
    price: 185,
    compare_at_price: 230,
    unit: "250 g Degassing Pack",
    stock: 65,
    images: ["https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80"],
    rating: 4.9,
    sold_count: 2600,
    is_on_sale: true,
    is_featured: true,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-19",
    name: "Organic Vine-Ripened Cherry Tomatoes",
    slug: "bk-19-cherry-tomatoes",
    description:
      "Sweet, bite-sized burst of sunshine. Naturally ripened on vine with sweet balanced acidity.",
    price: 48,
    compare_at_price: 65,
    unit: "250 g Box",
    stock: 55,
    images: ["https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800&q=80"],
    rating: 4.8,
    sold_count: 1850,
    is_on_sale: true,
    is_featured: false,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-20",
    name: "Crisp Farm Fresh Green Bell Peppers",
    slug: "bk-20-green-bell-peppers",
    description:
      "Glossy, thick-walled green capsicum with mild crunchy sweetness. Farm picked 4 hours before dispatch.",
    price: 39,
    compare_at_price: 55,
    unit: "500 g Pack (2-3 pcs)",
    stock: 75,
    images: ["https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=800&q=80"],
    rating: 4.7,
    sold_count: 2100,
    is_on_sale: true,
    is_featured: false,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-21",
    name: "Epigamia Greek Yogurt (Wild Blueberry)",
    slug: "bk-21-epigamia-wild-blueberry-yogurt",
    description:
      "Thick, strained Greek yogurt blended with real Himalayan wild blueberries. 8g natural protein with zero preservatives.",
    price: 65,
    compare_at_price: 75,
    unit: "120 g Cup",
    stock: 60,
    images: ["https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80"],
    rating: 4.9,
    sold_count: 3400,
    is_on_sale: true,
    is_featured: true,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-22",
    name: "Country Fresh Salted Creamery Butter",
    slug: "bk-22-country-fresh-salted-butter",
    description:
      "Traditional churned butter crafted from sweet farm cream with just a pinch of sea salt. Golden, spreadable and rich.",
    price: 58,
    compare_at_price: 65,
    unit: "100 g Slab",
    stock: 90,
    images: ["https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800&q=80"],
    rating: 4.8,
    sold_count: 5200,
    is_on_sale: true,
    is_featured: true,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-23",
    name: "Kashmiri Mongra Pure Saffron (Grade A1 Kesar)",
    slug: "bk-23-kashmiri-mongra-saffron",
    description:
      "100% pure Pampore harvest saffron stigma threads. Intense deep maroon red, intoxicating floral aroma and rich color.",
    price: 399,
    compare_at_price: 550,
    unit: "1 g Airtight Acrylic Box",
    stock: 40,
    images: ["https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80"],
    rating: 5.0,
    sold_count: 980,
    is_on_sale: true,
    is_featured: true,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-24",
    name: "Zespri SunGold New Zealand Kiwis",
    slug: "bk-24-zespri-sungold-kiwis",
    description:
      "Sun-ripened golden kiwis with sweet, juicy tropical flesh and smooth skin. Packed with 3x more vitamin C than oranges.",
    price: 189,
    compare_at_price: 240,
    unit: "3 pcs Pack (~330g)",
    stock: 50,
    images: ["https://images.unsplash.com/photo-1518492104633-130d0cc84637?w=800&q=80"],
    rating: 4.8,
    sold_count: 1450,
    is_on_sale: true,
    is_featured: true,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-25",
    name: "Organic Cold-Pressed Kachi Ghani Mustard Oil",
    slug: "bk-25-cold-pressed-mustard-oil",
    description:
      "Extracted at low temperatures using traditional wooden kolhu to preserve natural pungency, essential fatty acids and aroma.",
    price: 195,
    compare_at_price: 260,
    unit: "1 Liter Bottle",
    stock: 70,
    images: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80"],
    rating: 4.8,
    sold_count: 2700,
    is_on_sale: true,
    is_featured: false,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-26",
    name: "Organic Unpolished Yellow Moong Dal",
    slug: "bk-26-organic-unpolished-moong-dal",
    description:
      "Pesticide-free split yellow lentils without chemical water polish or synthetic colors. Cook fast and easy on digestion.",
    price: 145,
    compare_at_price: 180,
    unit: "1 kg Zip Pouch",
    stock: 80,
    images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80"],
    rating: 4.9,
    sold_count: 3600,
    is_on_sale: true,
    is_featured: true,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-27",
    name: "Himalayan Pink Rock Salt Fine Crystals",
    slug: "bk-27-himalayan-pink-rock-salt",
    description:
      "Unrefined pink salt mined from ancient Himalayan seabeds. Packed with 84 trace minerals including calcium and magnesium.",
    price: 79,
    compare_at_price: 110,
    unit: "1 kg Pouch",
    stock: 110,
    images: ["https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=800&q=80"],
    rating: 4.9,
    sold_count: 4100,
    is_on_sale: true,
    is_featured: false,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-28",
    name: "Artisanal 70% Dark Chocolate with Sea Salt",
    slug: "bk-28-artisanal-dark-chocolate",
    description:
      "Single-estate Idukki cocoa beans stone-ground for 48 hours. Balanced with crunchy Himalayan pink salt flakes.",
    price: 199,
    compare_at_price: 250,
    unit: "80 g Bar",
    stock: 45,
    images: ["https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800&q=80"],
    rating: 4.9,
    sold_count: 1890,
    is_on_sale: true,
    is_featured: true,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-29",
    name: "Roasted Foxnuts (Peri Peri Makhana)",
    slug: "bk-29-roasted-peri-peri-makhana",
    description:
      "Jumbo lotus seeds slow dry-roasted in olive oil and tossed with smoky peri peri spice mix. Zero trans fat snack.",
    price: 125,
    compare_at_price: 160,
    unit: "100 g Resealable Pouch",
    stock: 65,
    images: ["https://images.unsplash.com/photo-1525441273400-056e9c7517b3?w=800&q=80"],
    rating: 4.7,
    sold_count: 2300,
    is_on_sale: true,
    is_featured: false,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-30",
    name: "Pure Natural Tender Coconut Water (No Sugar)",
    slug: "bk-30-pure-tender-coconut-water",
    description:
      "100% natural, not from concentrate tender coconut water with bio-active enzymes and natural potassium electrolytes.",
    price: 49,
    compare_at_price: 60,
    unit: "200 ml Tetra Pak",
    stock: 130,
    images: ["https://images.unsplash.com/photo-1544378730-8b5104b18790?w=800&q=80"],
    rating: 4.9,
    sold_count: 7500,
    is_on_sale: true,
    is_featured: true,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-31",
    name: "Hydroponic Italian Sweet Basil & Fresh Mint",
    slug: "bk-31-hydroponic-basil-mint",
    description:
      "Living herb bouquet harvested with roots intact in sterile water sponges. Unmatched aroma for pastas, pestos & teas.",
    price: 45,
    compare_at_price: 60,
    unit: "100 g Punnet",
    stock: 50,
    images: ["https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=800&q=80"],
    rating: 4.8,
    sold_count: 1120,
    is_on_sale: true,
    is_featured: false,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
  {
    id: "bk-32",
    name: "Washington Red Delicious Sweet Cherries",
    slug: "bk-32-washington-red-cherries",
    description:
      "Plump, glossy dark crimson cherries with sweet firmness and juicy crunch. Chilled air-freighted for peak freshness.",
    price: 299,
    compare_at_price: 420,
    unit: "250 g Box",
    stock: 35,
    images: ["https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=800&q=80"],
    rating: 4.9,
    sold_count: 1680,
    is_on_sale: true,
    is_featured: true,
    category_id: "groceries",
    categories: { name: "Groceries", slug: "groceries" },
  },
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type AdditionalProduct = Pick<
  StoreProduct,
  "id" | "name" | "description" | "price" | "unit" | "stock" | "images" | "rating" | "category_id"
> &
  Partial<Pick<StoreProduct, "compare_at_price" | "sold_count" | "is_on_sale" | "is_featured">>;

function createAdditionalProduct(product: AdditionalProduct): StoreProduct {
  const category = product.category_id || "groceries";
  return {
    ...product,
    slug: `${product.id}-${slugify(product.name)}`,
    compare_at_price: product.compare_at_price ?? null,
    sold_count: product.sold_count ?? 320,
    is_on_sale: product.is_on_sale ?? false,
    is_featured: product.is_featured ?? product.rating >= 4.7,
    categories: {
      name: category.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase()),
      slug: category,
    },
  };
}

const ADDITIONAL_BASKETO_PRODUCTS: StoreProduct[] = [
  {
    id: "bk-33",
    name: "Alphonso Mango Greek Yogurt",
    description: "Creamy strained yogurt blended with real Alphonso mango pulp.",
    price: 89,
    compare_at_price: 110,
    unit: "150 g cup",
    stock: 38,
    images: ["https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80"],
    rating: 4.7,
    category_id: "groceries",
    is_on_sale: true,
  },
  {
    id: "bk-34",
    name: "Organic Baby Spinach Leaves",
    description: "Tender, washed baby spinach leaves packed fresh from a local farm.",
    price: 65,
    compare_at_price: 85,
    unit: "200 g pack",
    stock: 42,
    images: ["https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&q=80"],
    rating: 4.8,
    category_id: "groceries",
    is_on_sale: true,
  },
  {
    id: "bk-35",
    name: "Sweet Seedless Green Grapes",
    description: "Crisp, naturally sweet green grapes selected for freshness.",
    price: 119,
    compare_at_price: 149,
    unit: "500 g punnet",
    stock: 31,
    images: ["https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800&q=80"],
    rating: 4.7,
    category_id: "groceries",
    is_on_sale: true,
  },
  {
    id: "bk-36",
    name: "Farm Fresh Red Cherry Tomatoes",
    description: "Sweet, juicy cherry tomatoes picked at peak ripeness.",
    price: 79,
    compare_at_price: 99,
    unit: "250 g box",
    stock: 55,
    images: ["https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800&q=80"],
    rating: 4.8,
    category_id: "groceries",
    is_on_sale: true,
  },
  {
    id: "bk-37",
    name: "Cold-Pressed Extra Virgin Olive Oil",
    description: "Aromatic extra virgin olive oil for dressings, dips and everyday cooking.",
    price: 449,
    compare_at_price: 549,
    unit: "500 ml bottle",
    stock: 26,
    images: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80"],
    rating: 4.8,
    category_id: "groceries",
    is_on_sale: true,
  },
  {
    id: "bk-38",
    name: "Stone-Ground Whole Wheat Atta",
    description: "Nutritious whole wheat flour stone-ground in small batches.",
    price: 189,
    compare_at_price: 219,
    unit: "5 kg bag",
    stock: 64,
    images: ["https://images.unsplash.com/photo-1627485937980-221c88ac04f9?w=800&q=80"],
    rating: 4.7,
    category_id: "groceries",
    is_on_sale: true,
  },
  {
    id: "bk-39",
    name: "Raw Forest Honey",
    description: "Unheated wildflower honey with a floral aroma and naturally rich taste.",
    price: 249,
    compare_at_price: 299,
    unit: "350 g jar",
    stock: 29,
    images: ["https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=800&q=80"],
    rating: 4.9,
    category_id: "groceries",
    is_on_sale: true,
  },
  {
    id: "bk-40",
    name: "Crispy Multigrain Breakfast Cereal",
    description: "Toasted whole grains and seeds for a quick, satisfying breakfast.",
    price: 179,
    compare_at_price: 220,
    unit: "400 g box",
    stock: 43,
    images: ["https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=800&q=80"],
    rating: 4.6,
    category_id: "groceries",
    is_on_sale: true,
  },
  {
    id: "bk-41",
    name: "Natural Almond Butter",
    description: "Small-batch roasted almond butter with no added palm oil.",
    price: 329,
    compare_at_price: 399,
    unit: "250 g jar",
    stock: 24,
    images: ["https://images.unsplash.com/photo-1612182062633-9ff3b3598e96?w=800&q=80"],
    rating: 4.8,
    category_id: "groceries",
    is_on_sale: true,
  },
  {
    id: "bk-42",
    name: "Whole Bean Monsoon Malabar Coffee",
    description: "Deep, smooth single-origin coffee beans with a mellow chocolate finish.",
    price: 399,
    compare_at_price: 475,
    unit: "250 g pouch",
    stock: 21,
    images: ["https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80"],
    rating: 4.9,
    category_id: "groceries",
    is_on_sale: true,
  },
  {
    id: "bk-43",
    name: "Cold-Pressed Fresh Orange Juice",
    description: "Bright, refreshing juice pressed from ripe oranges with no added sugar.",
    price: 99,
    compare_at_price: 125,
    unit: "250 ml bottle",
    stock: 34,
    images: ["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80"],
    rating: 4.7,
    category_id: "groceries",
    is_on_sale: true,
  },
  {
    id: "bk-44",
    name: "Organic Turmeric Root Powder",
    description: "Finely milled turmeric with a warm aroma and naturally rich golden color.",
    price: 89,
    compare_at_price: 110,
    unit: "200 g pouch",
    stock: 70,
    images: ["https://images.unsplash.com/photo-1615485500704-8e990f9900f4?w=800&q=80"],
    rating: 4.8,
    category_id: "groceries",
    is_on_sale: true,
  },
  {
    id: "bk-45",
    name: "Gentle Aloe Vera Face Wash",
    description: "A refreshing daily cleanser made with soothing aloe vera extract.",
    price: 159,
    compare_at_price: 199,
    unit: "150 ml tube",
    stock: 48,
    images: ["https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=800&q=80"],
    rating: 4.6,
    category_id: "beauty",
    is_on_sale: true,
  },
  {
    id: "bk-46",
    name: "Hydrating Rose Water Toner",
    description: "A light, alcohol-free facial mist with a delicate rose-water fragrance.",
    price: 199,
    compare_at_price: 249,
    unit: "200 ml bottle",
    stock: 35,
    images: ["https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=800&q=80"],
    rating: 4.7,
    category_id: "beauty",
    is_on_sale: true,
  },
  {
    id: "bk-47",
    name: "Daily Mineral Sunscreen SPF 50",
    description: "Lightweight broad-spectrum sunscreen for comfortable everyday wear.",
    price: 349,
    compare_at_price: 425,
    unit: "50 g tube",
    stock: 27,
    images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80"],
    rating: 4.8,
    category_id: "beauty",
    is_on_sale: true,
  },
  {
    id: "bk-48",
    name: "Bamboo Kitchen Storage Canister Set",
    description: "Reusable airtight pantry canisters with natural bamboo lids.",
    price: 599,
    compare_at_price: 749,
    unit: "Set of 3",
    stock: 18,
    images: ["https://images.unsplash.com/photo-1603199506016-b9a594b593c0?w=800&q=80"],
    rating: 4.7,
    category_id: "kitchen-accessories",
    is_on_sale: true,
  },
  {
    id: "bk-49",
    name: "Reusable Glass Meal Prep Containers",
    description: "Durable glass food containers with secure, easy-clean lids.",
    price: 449,
    compare_at_price: 549,
    unit: "Set of 2",
    stock: 22,
    images: ["https://images.unsplash.com/photo-1606787366850-de6330128bfc?w=800&q=80"],
    rating: 4.6,
    category_id: "kitchen-accessories",
    is_on_sale: true,
  },
  {
    id: "bk-50",
    name: "Handwoven Cotton Market Tote",
    description: "A sturdy reusable cotton tote for daily shopping and errands.",
    price: 299,
    compare_at_price: 375,
    unit: "1 bag",
    stock: 33,
    images: ["https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80"],
    rating: 4.7,
    category_id: "home-decoration",
    is_on_sale: true,
  },
].map(createAdditionalProduct);

export const CURATED_BASKETO_PRODUCTS: StoreProduct[] = [
  ...BASE_BASKETO_PRODUCTS,
  ...ADDITIONAL_BASKETO_PRODUCTS,
];

const USD_TO_INR = 84;
const toINR = (usd: number) => Math.round(usd * USD_TO_INR);

function mapProduct(p: DJProduct): StoreProduct {
  const compareUsd = p.discountPercentage > 0 ? p.price / (1 - p.discountPercentage / 100) : null;
  return {
    id: String(p.id),
    name: p.title,
    slug: `${p.id}-${slugify(p.title)}`,
    description: p.description,
    price: toINR(p.price),
    compare_at_price: compareUsd != null ? toINR(compareUsd) : null,
    unit: p.brand ? `${p.brand}` : "1 pc",
    stock: p.stock,
    images: p.images?.length ? p.images : [p.thumbnail],
    rating: Math.round(p.rating * 10) / 10,
    sold_count: Math.max(0, 1000 - p.stock * 7),
    is_on_sale: p.discountPercentage > 5,
    is_featured: p.rating >= 4.5,
    category_id: p.category,
    categories: { name: p.category.replace(/-/g, " "), slug: p.category },
  };
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

export const listProducts = createServerFn({ method: "GET" })
  .validator(
    (input?: { category?: string; featured?: boolean; search?: string } | undefined) => input ?? {},
  )
  .handler(async ({ data }) => {
    // 1. Filter curated farm-fresh products
    const curatedMatches = CURATED_BASKETO_PRODUCTS.filter((p) => {
      if (data.search) {
        const q = data.search.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.category_id && p.category_id.toLowerCase().includes(q))
        );
      }
      if (data.category && p.category_id !== data.category) {
        return false;
      }
      return true;
    });

    // 2. Fetch DummyJSON products
    let djProducts: StoreProduct[] = [];
    try {
      let url: string;
      if (data.search) {
        url = `${API}/products/search?q=${encodeURIComponent(data.search)}&limit=0`;
      } else if (data.category) {
        url = `${API}/products/category/${encodeURIComponent(data.category)}?limit=0`;
      } else {
        url = `${API}/products?limit=0`;
      }
      const json = await fetchJson<{ products: DJProduct[] }>(url);
      if (json?.products) {
        djProducts = json.products.map(mapProduct);
      }
    } catch {
      // Fallback cleanly to curated list
    }

    // Combine: Farm fresh products first, then external catalog
    let combined = [...curatedMatches, ...djProducts];

    if (data.featured) {
      combined = [...combined].sort((a, b) => b.rating - a.rating);
    }
    return combined;
  });

export const getProduct = createServerFn({ method: "GET" })
  .validator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    // Check curated items first
    const curated = CURATED_BASKETO_PRODUCTS.find(
      (p) => p.slug === data.slug || p.id === data.slug.split("-")[0],
    );
    if (curated) return curated;

    // Check DummyJSON
    const id = data.slug.split("-")[0];
    if (!id || Number.isNaN(Number(id))) return null;
    const p = await fetchJson<DJProduct>(`${API}/products/${id}`);
    if (!p) return null;
    return mapProduct(p);
  });

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const cats = await fetchJson<DJCategory[]>(`${API}/products/categories`);
  const preferred = [
    "groceries",
    "beauty",
    "smartphones",
    "fragrances",
    "laptops",
    "furniture",
    "home-decoration",
    "kitchen-accessories",
    "mens-shoes",
    "womens-dresses",
    "womens-bags",
    "sunglasses",
  ];

  if (!cats || cats.length === 0) {
    return preferred.map((slug, i) => ({
      id: slug,
      name: slug.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      slug,
      icon: ICONS[slug] ?? "🛍️",
      color: COLORS[i % COLORS.length],
      sort_order: i,
    }));
  }

  const ordered = [
    ...(preferred.map((s) => cats.find((c) => c.slug === s)).filter(Boolean) as DJCategory[]),
    ...cats.filter((c) => !preferred.includes(c.slug)),
  ];

  return ordered.map<StoreCategory>((c, i) => ({
    id: c.slug,
    name: c.name,
    slug: c.slug,
    icon: ICONS[c.slug] ?? "🛍️",
    color: COLORS[i % COLORS.length],
    sort_order: i,
  }));
});
