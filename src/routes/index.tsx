import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { ProductCard, type Product } from "@/components/site/ProductCard";
import { listCategories, listProducts } from "@/lib/products.functions";
import { ArrowRight, Truck, Leaf, ShieldCheck, Sparkles } from "lucide-react";
import heroProduce from "@/assets/hero-produce.jpg";

const catsQO = () => queryOptions({ queryKey: ["categories"], queryFn: () => listCategories() });
const featuredQO = () =>
  queryOptions({
    queryKey: ["products", "featured"],
    queryFn: () => listProducts({ data: { featured: true } }),
  });

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Basketo — Farm-fresh groceries delivered in minutes" },
      {
        name: "description",
        content:
          "Shop hand-picked fruits, vegetables, dairy and bakery. Delivered fresh in 15 minutes.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(catsQO());
    context.queryClient.ensureQueryData(featuredQO());
  },
  component: HomePage,
});

function HomePage() {
  const { data: cats } = useSuspenseQuery(catsQO());
  const { data: featured } = useSuspenseQuery(featuredQO());

  return (
    <div className="min-h-screen bg-bk-background">
      <Navbar />
      <Hero />

      {/* Promotional Banner Strip */}
      <section className="mx-auto bk-container my-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bk-card relative overflow-hidden rounded-2xl p-5"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="h-8 w-8 text-bk-primary" />
              </div>
              <h3 className="font-display text-lg font-bold text-bk-ink">
                Flat {20 + i * 5}% OFF
              </h3>
              <p className="mt-1 text-sm text-bk-muted">
                On fresh produce essentials
              </p>
              <Link
                to="/shop"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-bk-primary hover:underline"
              >
                Shop now <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto bk-container py-12">
        <div className="bk-section-header">
          <div>
            <h2 className="bk-section-header__title">Shop by Category</h2>
            <p className="bk-section-header__subtitle">
              Everything you need, organised by craving
            </p>
          </div>
          <Link
            to="/shop"
            className="bk-section-header__view-all"
          >
            View all categories <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {cats.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -6 }}
            >
              <Link
                to="/shop"
                search={{ category: c.slug }}
                className="bk-category-card"
              >
                <span className="bk-category-card__icon">{c.icon}</span>
                <span className="bk-category-card__name">{c.name}</span>
                <div className="bk-category-card__glow" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mx-auto bk-container py-12">
        <div className="bk-section-header">
          <div>
            <h2 className="bk-section-header__title">Fresh Today</h2>
            <p className="bk-section-header__subtitle">
              Curated top-rated picks (4.5★+), delivered in 15 minutes
            </p>
          </div>
          <Link
            to="/shop"
            className="bk-section-header__view-all"
          >
            View all {featured.length} products <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="bk-grid-products">
          {featured.slice(0, 10).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <ProductCard product={p as Product} index={i} />
            </motion.div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-center text-center">
          <Link
            to="/shop"
            className="bk-btn bk-btn-primary bk-btn-lg"
          >
            Explore full catalog ({featured.length} items)
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-2 text-xs text-bk-muted">
            Fruits, vegetables, dairy, bakes, cosmetics & tech accessories
          </p>
        </div>
      </section>

      {/* Promise Band */}
      <section className="mx-auto mt-16 bk-container">
        <div className="bk-card relative overflow-hidden rounded-[2rem] p-8 md:p-12">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-bk-primary/20 blur-3xl" />
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div className="relative z-10">
              <h3 className="font-display text-3xl font-bold md:text-5xl">
                The freshest stuff in town.<br />
                Or it&apos;s on us.
              </h3>
              <p className="mt-4 max-w-md text-bk-muted/90">
                Every order is hand-checked. If anything isn&apos;t perfect, we&apos;ll refund it on the spot.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3">
                {[
                  { icon: Truck, label: "15-min delivery" },
                  { icon: Leaf, label: "100% farm fresh" },
                  { icon: ShieldCheck, label: "Quality promise" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-bk-surface-alt text-bk-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-medium text-bk-ink">{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative z-10 h-72 overflow-hidden rounded-2xl md:h-96">
              <img
                src={heroProduce}
                alt="Fresh produce"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto mt-16 max-w-3xl px-4 text-center">
        <div className="bk-card rounded-[2rem] p-8 md:p-12">
          <Sparkles className="mx-auto h-10 w-10 text-bk-primary" />
          <h3 className="mt-4 font-display text-3xl font-bold">Get weekly deals in your inbox</h3>
          <p className="mt-2 text-bk-muted">
            Fresh offers, recipes and seasonal picks — every Sunday.
          </p>
          <form className="mx-auto mt-6 flex max-w-md flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
            <input
              placeholder="you@email.com"
              className="bk-input h-12 flex-1 sm:rounded-l-xl sm:rounded-r-none"
            />
            <button
              className="bk-btn bk-btn-primary flex-1 sm:rounded-l-none sm:rounded-r-xl"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
