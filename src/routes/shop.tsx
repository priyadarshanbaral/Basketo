import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, ShoppingBag, Sparkles, Truck } from "lucide-react";
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

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>) => ({
    category: (search.category as string) || undefined,
    ...(search.q ? { q: search.q as string } : {}),
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(productsQO(undefined, undefined));
  },
  head: () => ({
    meta: [{ title: "Shop — Basketo" }],
  }),
  component: ShopPage,
});

function ShopPage() {
  const { category, q } = Route.useSearch();
  const { data: products } = useSuspenseQuery(productsQO(category, q));
  const { data: categories } = useSuspenseQuery(categoriesQO);

  const filtered = products.filter((p) => {
    if (q && !p.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (category && p.category_id !== category) return false;
    return true;
  });

  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="min-h-screen bg-bk-background">
      <Navbar />

      {/* Page Hero Banner */}
      <section className="relative overflow-hidden border-b border-bk-border/60 bg-linear-to-r from-bk-primary via-emerald-500 to-amber-500">
        <div className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-amber-500/20 blur-2xl" />
        <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
              <Sparkles className="h-3 w-3" /> Fresh Drops Daily
            </span>
            <h1 className="mt-2 font-display text-3xl font-black tracking-tight text-white drop-shadow-sm sm:text-4xl">
              {activeCategory
                ? `${activeCategory.icon} ${activeCategory.name}`
                : q
                  ? `Results for “${q}”`
                  : "Shop the Market"}
            </h1>
            <p className="mt-1 text-sm font-medium text-emerald-50/90">
              {filtered.length} hand-picked products • quality assured
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm">
              <Truck className="h-4 w-4" /> Free delivery over ₹499
            </span>
          </div>
        </div>
      </section>

      <main className="mx-auto bk-container py-8">
        {/* Category Chips */}
        <div className="sticky top-16 z-20 -mx-4 bg-bk-surface/90 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6 border-b border-bk-border/60">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden">
            <Link
              to="/shop"
              search={{ category: undefined }}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
                !category
                  ? "border-bk-primary bg-linear-to-r from-bk-primary to-emerald-500 text-white shadow-md shadow-bk-primary/30"
                  : "border-bk-border bg-bk-surface text-bk-muted hover:border-bk-primary/40 hover:text-bk-primary"
              }`}
            >
              🛒 All
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                to="/shop"
                search={{ category: c.slug }}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold transition-all hover:scale-105 active:scale-95 ${
                  category === c.slug
                    ? "border-bk-primary bg-linear-to-r from-bk-primary to-emerald-500 text-white shadow-md shadow-bk-primary/30"
                    : "border-bk-border bg-bk-surface text-bk-muted hover:border-bk-primary/40 hover:text-bk-primary"
                }`}
              >
                {c.icon} {c.name}
              </Link>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mx-auto mt-16 max-w-md rounded-2xl border border-dashed border-bk-border bg-bk-surface p-12 text-center shadow-sm">
            <Search className="mx-auto h-12 w-12 text-bk-muted/40" />
            <h3 className="mt-3 font-display text-lg font-bold text-bk-ink">
              No products found
            </h3>
            <p className="mt-1 text-sm text-bk-muted">
              Try a different category or search term.
            </p>
            <Link
              to="/shop"
              search={{ category: undefined, q: undefined }}
              className="mt-5 inline-flex items-center rounded-full bg-linear-to-r from-bk-primary to-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-bk-primary/30 transition hover:scale-105 active:scale-95"
            >
              Clear all filters
            </Link>
          </div>
        ) : (
          <div className="mt-8 bk-grid-products">
            {filtered.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 12) * 0.03, duration: 0.35 }}
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
