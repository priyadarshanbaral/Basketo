import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { HowItWorks } from "@/components/site/HowItWorks";
import { Testimonials } from "@/components/site/Testimonials";
import { ProductCard, type Product } from "@/components/site/ProductCard";
import { listCategories, listProducts } from "@/lib/products.functions";
import { ArrowRight, Clock, Leaf, ShieldCheck, Truck } from "lucide-react";
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
      {
        property: "og:title",
        content: "Basketo — Farm-fresh groceries delivered",
      },
      {
        property: "og:description",
        content: "Hand-picked produce delivered from local farms in 15 minutes.",
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
    <div className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <HowItWorks />

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-6 py-16">
        <SectionHeader
          title="Shop by category"
          subtitle="Everything you need, organised by craving"
        />
        <div className="mt-8 grid grid-cols-3 gap-3 md:grid-cols-6">
          {cats.map((c, i) => {
            const palettes = [
              "from-emerald-100 via-emerald-50 to-white ring-emerald-200/70 hover:shadow-emerald-400/40",
              "from-amber-100 via-orange-50 to-white ring-orange-200/70 hover:shadow-orange-400/40",
              "from-sky-100 via-blue-50 to-white ring-sky-200/70 hover:shadow-sky-400/40",
              "from-fuchsia-100 via-pink-50 to-white ring-pink-200/70 hover:shadow-pink-400/40",
              "from-violet-100 via-purple-50 to-white ring-violet-200/70 hover:shadow-violet-400/40",
              "from-rose-100 via-red-50 to-white ring-rose-200/70 hover:shadow-rose-400/40",
            ];
            const p = palettes[i % palettes.length];
            return (
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
                  className={`group relative flex flex-col items-center gap-2 overflow-hidden rounded-3xl bg-gradient-to-br ${p} p-5 ring-1 transition hover:shadow-xl`}
                >
                  <span className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-white/60 blur-xl" />
                  <span className="relative text-4xl transition group-hover:scale-125 group-hover:-rotate-6">
                    {c.icon}
                  </span>
                  <span className="relative text-sm font-semibold text-slate-800">{c.name}</span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Featured top-rated products limited to a curated set */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="flex items-end justify-between">
          <SectionHeader
            title="Fresh today"
            subtitle="Curated top-rated picks (4.5★+), delivered in 15 minutes"
          />
          <Link
            to="/shop"
            className="hidden items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-50/50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100/60 md:inline-flex"
          >
            View all {featured.length} products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.slice(0, 8).map((p, i) => (
            <ProductCard key={p.id} product={p as Product} index={i} />
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-center text-center">
          <Link
            to="/shop"
            className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-amber-500 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 hover:shadow-xl"
          >
            <span>Explore full market catalog ({featured.length} items)</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <p className="mt-2 text-xs text-muted-foreground">
            Fruits, vegetables, dairy, bakes, cosmetics & tech accessories
          </p>
        </div>
      </section>

      {/* Promise band */}
      <section className="mx-auto mt-16 max-w-7xl px-6">
        <div className="overflow-hidden rounded-[2rem] gradient-leaf p-8 text-primary-foreground md:p-14">
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h3 className="font-display text-3xl font-bold md:text-5xl">
                The freshest stuff in town. <br />
                Or it's on us.
              </h3>
              <p className="mt-4 max-w-md text-primary-foreground/90">
                Every order is hand-checked. If anything isn't perfect, we'll refund it on the spot.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-4 text-sm">
                {[
                  { icon: Truck, label: "15-min delivery" },
                  { icon: Leaf, label: "100% farm fresh" },
                  { icon: ShieldCheck, label: "Quality promise" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                    <Icon className="mb-2 h-5 w-5" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-72 overflow-hidden rounded-2xl md:h-96">
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

      <Testimonials />

      {/* Stats */}
      <section className="mx-auto mt-16 grid max-w-7xl grid-cols-2 gap-4 px-6 md:grid-cols-4">
        {[
          {
            value: "10k+",
            label: "Happy customers",
            grad: "from-emerald-400 via-emerald-500 to-teal-600",
            ring: "shadow-emerald-500/30",
          },
          {
            value: "500+",
            label: "Local farmers",
            grad: "from-amber-400 via-orange-500 to-rose-500",
            ring: "shadow-orange-500/30",
          },
          {
            value: "15 min",
            label: "Avg delivery",
            grad: "from-sky-400 via-blue-500 to-indigo-600",
            ring: "shadow-blue-500/30",
          },
          {
            value: "4.9★",
            label: "App rating",
            grad: "from-fuchsia-400 via-pink-500 to-purple-600",
            ring: "shadow-pink-500/30",
          },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${s.grad} p-6 text-center text-white shadow-xl ${s.ring}`}
          >
            <span className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/20 blur-2xl" />
            <div className="relative font-display text-3xl font-extrabold drop-shadow md:text-4xl">
              {s.value}
            </div>
            <div className="relative mt-1 text-sm font-medium text-white/90">{s.label}</div>
          </motion.div>
        ))}
      </section>

      {/* Newsletter */}
      <section className="mx-auto mt-16 max-w-3xl px-6 text-center">
        <Clock className="mx-auto h-8 w-8 text-primary" />
        <h3 className="mt-3 font-display text-3xl font-bold">Get weekly deals in your inbox</h3>
        <p className="mt-2 text-muted-foreground">
          Fresh offers, recipes and seasonal picks — every Sunday.
        </p>
        <form className="mx-auto mt-6 flex max-w-md gap-2" onSubmit={(e) => e.preventDefault()}>
          <input
            placeholder="you@email.com"
            className="h-12 flex-1 rounded-full border border-border bg-card px-5 outline-none focus:border-primary"
          />
          <button className="rounded-full bg-gradient-to-r from-emerald-500 via-emerald-500 to-amber-500 px-6 font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:scale-[1.03]">
            Subscribe
          </button>
        </form>
      </section>

      <Footer />
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h2 className="font-display text-3xl font-bold md:text-4xl">{title}</h2>
      <p className="mt-1 text-muted-foreground">{subtitle}</p>
    </div>
  );
}
