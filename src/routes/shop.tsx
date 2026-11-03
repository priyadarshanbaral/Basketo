import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { Search, ShoppingBag, Sparkles, Truck, SlidersHorizontal, ArrowUpDown, X, Tag } from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { ProductCard } from "@/components/site/ProductCard";
import { listProducts, listCategories } from "@/lib/products.functions";

const productsQO = (category?: string, search?: string) =>
  queryOptions({
    queryKey: ["products", "shop", category ?? null, search ?? null],
    queryFn: () => listProducts({ data: { category, search } }),
  });

const categoriesQO = queryOptions({
  queryKey: ["categories"],
  queryFn: () => listCategories(),
});

type SortOption = "featured" | "price_asc" | "price_desc" | "rating" | "discount";

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>) => ({
    category: (search.category as string) || undefined,
    ...(search.q ? { q: search.q as string } : {}),
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(productsQO(undefined, undefined));
  },
  head: () => ({
    meta: [{ title: "Shop Catalog — Basketo" }],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { category, q } = Route.useSearch();
  const { data: products } = useSuspenseQuery(productsQO(category, q));
  const { data: categories } = useSuspenseQuery(categoriesQO);

  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [onlySale, setOnlySale] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");

  let filtered = products.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (category && p.category_id !== category) return false;
    if (onlySale && !p.is_on_sale) return false;
    if (inStockOnly && p.stock <= 0) return false;
    if (minPrice && p.price < Number(minPrice)) return false;
    if (maxPrice && p.price > Number(maxPrice)) return false;
    if (minRating && p.rating < Number(minRating)) return false;
    return true;
  });

  if (sortBy === "price_asc") {
    filtered = [...filtered].sort((a, b) => a.price - b.price);
  } else if (sortBy === "price_desc") {
    filtered = [...filtered].sort((a, b) => b.price - a.price);
  } else if (sortBy === "rating") {
    filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  } else if (sortBy === "discount") {
    filtered = [...filtered].sort((a, b) => {
      const discA = a.compare_at_price ? (a.compare_at_price - a.price) / a.compare_at_price : 0;
      const discB = b.compare_at_price ? (b.compare_at_price - b.price) / b.compare_at_price : 0;
      return discB - discA;
    });
  }

  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="bk-storefront min-h-screen bg-slate-50/50 pb-28 sm:pb-0">
      <Navbar />

      {/* Header Banner */}
      <section className="relative overflow-hidden border-b border-slate-200 bg-linear-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white">
        <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-xs">
              <Sparkles className="h-3 w-3 text-amber-300" /> 15-Minute Delivery
            </span>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl font-black tracking-tight text-white">
              {activeCategory
                ? `${activeCategory.icon} ${activeCategory.name}`
                : q
                  ? `Search: “${q}”`
                  : "All Grocery & Lifestyle Aisles"}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-emerald-100">
              Showing {filtered.length} products verified for fast delivery
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur-xs">
              <Truck className="h-4 w-4 text-emerald-300" /> Free delivery over ₹499
            </span>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {/* Category Horizontal Scroll Chips */}
        <div className="sticky top-16 z-20 -mx-4 sm:-mx-6 bg-white/95 px-4 sm:px-6 py-3 backdrop-blur-md border-b border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <Link
              to="/shop"
              search={{ category: undefined, q }}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition cursor-pointer ${
                !category
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              🛒 All Aisles
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/shop"
                search={{ category: c.slug, q }}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  category === c.slug
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {c.icon} {c.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Filters and Sort Toolbar */}
        <div className="bk-shop-filters mt-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs sm:p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {filtered.length} Items Found
            </span>
            {q && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                Keyword: &ldquo;{q}&rdquo;
                <Link to="/shop" search={{ category }} className="hover:text-emerald-950">
                  <X className="h-3 w-3" />
                </Link>
              </span>
            )}
            {category && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                {activeCategory?.name || category}
                <Link to="/shop" search={{ q }} className="hover:text-amber-950">
                  <X className="h-3 w-3" />
                </Link>
              </span>
            )}
            <button
              type="button"
              onClick={() => setOnlySale(!onlySale)}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition cursor-pointer ${
                onlySale
                  ? "bg-rose-500 text-white shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              <Tag className="h-3 w-3" />
              On Sale Only
            </button>
            </div>

            <div className="flex items-center gap-2">
            <label htmlFor="shop-sort" className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="h-3.5 w-3.5" /> Sort:
            </label>
            <select
              id="shop-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="featured">Featured / Best Seller</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rated (★)</option>
              <option value="discount">Biggest Discount (%)</option>
            </select>
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-2 border-t border-slate-100 pt-3">
            <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Min price
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="₹0"
              aria-label="Minimum product price"
              className="h-9 w-24 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
            />
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Max price
            <input
              type="number"
              min="0"
              inputMode="numeric"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="No limit"
              aria-label="Maximum product price"
              className="h-9 w-24 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
            />
            </label>
            <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Minimum rating
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              aria-label="Minimum product rating"
              className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
            >
              <option value="">Any rating</option>
              <option value="4">4★ and above</option>
              <option value="4.5">4.5★ and above</option>
            </select>
            </label>
            <button
            type="button"
            aria-pressed={inStockOnly}
            onClick={() => setInStockOnly((value) => !value)}
            className={`h-9 rounded-xl border px-3 text-xs font-bold transition ${
              inStockOnly
                ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-400"
            }`}
            >
            In stock
            </button>
            {(minPrice || maxPrice || minRating || inStockOnly || onlySale) && (
            <button
              type="button"
              onClick={() => {
                setMinPrice("");
                setMaxPrice("");
                setMinRating("");
                setInStockOnly(false);
                setOnlySale(false);
              }}
              className="h-9 px-2 text-xs font-bold text-rose-600 hover:text-rose-700"
            >
              Clear filters
            </button>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {filtered.length === 0 ? (
          <div className="mx-auto mt-14 max-w-md rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-xs">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="mt-4 font-display text-lg font-bold text-slate-900">
              No products found
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              We couldn&apos;t find any matches for your filters. Try clearing your search keyword or switching category.
            </p>
            <Link
              to="/shop"
              search={{ category: undefined, q: undefined }}
              className="mt-5 inline-flex items-center rounded-full bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
            >
              Reset All Filters
            </Link>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 12) * 0.02, duration: 0.3 }}
              >
                <ProductCard product={p} index={i} />
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
