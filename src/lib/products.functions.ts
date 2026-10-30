import { createServerFn } from "@tanstack/react-start";

// All storefront data is fetched from the public DummyJSON API.
// https://dummyjson.com/docs/products

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
const COLORS = ["#34d399", "#f59e0b", "#60a5fa", "#f472b6", "#a78bfa", "#fb7185"];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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
    const r = await fetch(url);
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

export const listProducts = createServerFn({ method: "GET" })
  .inputValidator(
    (input?: { category?: string; featured?: boolean; search?: string } | undefined) => input ?? {},
  )
  .handler(async ({ data }) => {
    let url: string;
    if (data.search) {
      url = `${API}/products/search?q=${encodeURIComponent(data.search)}&limit=0`;
    } else if (data.category) {
      url = `${API}/products/category/${encodeURIComponent(data.category)}?limit=0`;
    } else {
      url = `${API}/products?limit=0`;
    }
    const json = await fetchJson<{ products: DJProduct[] }>(url);
    if (!json) return [];
    let list = json.products.map(mapProduct);
    if (data.featured) {
      // Highest-rated first — but return the FULL catalog, no cap.
      list = [...list].sort((a, b) => b.rating - a.rating);
    }
    return list;
  });

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((input: { slug: string }) => input)
  .handler(async ({ data }) => {
    const id = data.slug.split("-")[0];
    if (!id || Number.isNaN(Number(id))) return null;
    const p = await fetchJson<DJProduct>(`${API}/products/${id}`);
    if (!p) return null;
    return mapProduct(p);
  });

export const listCategories = createServerFn({ method: "GET" }).handler(async () => {
  const cats = await fetchJson<DJCategory[]>(`${API}/products/categories`);
  if (!cats) return [];
  const preferred = [
    "groceries",
    "smartphones",
    "laptops",
    "fragrances",
    "beauty",
    "furniture",
    "home-decoration",
    "kitchen-accessories",
    "mens-shoes",
    "womens-dresses",
    "womens-bags",
    "sunglasses",
  ];
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
