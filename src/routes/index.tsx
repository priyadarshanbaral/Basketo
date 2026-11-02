import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Hero } from "@/components/site/Hero";
import { ProductCard, type Product } from "@/components/site/ProductCard";
import { listCategories, listProducts, CURATED_BASKETO_PRODUCTS } from "@/lib/products.functions";
import {
  ArrowRight,
  Truck,
  Leaf,
  ShieldCheck,
  Sparkles,
  Zap,
  Clock,
  Tag,
  Star,
  Copy,
  Check,
  Percent,
  Flame,
} from "lucide-react";
import heroProduce from "@/assets/hero-produce.jpg";
import { toast } from "sonner";

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
          "Shop hand-picked fruits, vegetables, dairy, beauty and daily essentials. Delivered fresh in 15 minutes.",
      },
    ],
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(catsQO());
    context.queryClient.ensureQueryData(featuredQO());
  },
  component: HomePage,
});

const VOUCHERS = [
  {
    code: "SUPER100",
    title: "Instant ₹100 OFF",
    sub: "On orders above ₹999",
    color: "from-amber-500 to-rose-500",
    badge: "Most Popular",
  },
  {
    code: "FLIPKART50",
    title: "Flat ₹50 OFF",
    sub: "On orders above ₹499",
    color: "from-emerald-600 to-teal-500",
    badge: "Daily Essential",
  },
  {
    code: "FREESHIP",
    title: "Zero Delivery Fee",
    sub: "On all fresh orders above ₹299",
    color: "from-blue-600 to-indigo-600",
    badge: "15-Min Express",
  },
  {
    code: "FRESH20",
    title: "Flat 20% OFF",
    sub: "Valid on first grocery checkout",
    color: "from-purple-600 to-pink-500",
    badge: "New User",
  },
];

const TESTIMONIALS = [
  {
    name: "Pooja Sharma",
    city: "Bengaluru",
    rating: 5,
    comment:
      "Ordered organic spinach and strawberries at 8:05 AM, rider arrived at 8:18 AM! Crisp leaves, zero bruising.",
    product: "Organic Greens Box",
  },
  {
    name: "Arjun Verma",
    city: "Mumbai",
    rating: 5,
    comment:
      "Basketo has completely replaced my weekend supermarket trips. Pricing is fair, discounts work automatically.",
    product: "Daily Dairy & Bakery",
  },
  {
    name: "Sneha Reddy",
    city: "Hyderabad",
    rating: 5,
    comment:
      "Love the instant refund guarantee and live delivery tracking. Top-tier quality and responsive support.",
    product: "Fresh Alphonso Mangoes",
  },
];

function HomePage() {
  const { data: cats } = useSuspenseQuery(catsQO());
  const { data: featured } = useSuspenseQuery(featuredQO());

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  // Flash Sale Timer calculation
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 18, seconds: 45 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 4, minutes: 30, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  function handleCopyVoucher(code: string) {
    navigator.clipboard?.writeText(code);
    setCopiedCode(code);
    toast.success(`Coupon code ${code} copied! Apply at checkout.`);
    setTimeout(() => setCopiedCode(null), 3000);
  }

  function handleSubscribeNewsletter(e: React.FormEvent) {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSubscribed(true);
    toast.success("Thank you for subscribing! Check your inbox for ₹150 welcome discount.");
    setNewsletterEmail("");
  }

  const filteredFeatured =
    activeCategoryFilter === "all"
      ? featured
      : featured.filter((p) => p.category_id === activeCategoryFilter);

  // Curated subsets for dedicated aisles
  const fruitAndVeggiePicks = CURATED_BASKETO_PRODUCTS.filter((p) =>
    [
      "bk-1",
      "bk-2",
      "bk-5",
      "bk-9",
      "bk-10",
      "bk-11",
      "bk-19",
      "bk-20",
      "bk-24",
      "bk-31",
      "bk-32",
    ].includes(p.id),
  );
  const dairyAndBakeryPicks = CURATED_BASKETO_PRODUCTS.filter((p) =>
    ["bk-3", "bk-4", "bk-6", "bk-7", "bk-8", "bk-21", "bk-22"].includes(p.id),
  );
  const pantryAndDryFruitsPicks = CURATED_BASKETO_PRODUCTS.filter((p) =>
    [
      "bk-13",
      "bk-14",
      "bk-15",
      "bk-16",
      "bk-17",
      "bk-18",
      "bk-23",
      "bk-25",
      "bk-26",
      "bk-27",
      "bk-28",
      "bk-29",
      "bk-30",
    ].includes(p.id),
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-28 sm:pb-0 overflow-x-hidden">
      <Navbar />
      <Hero />

      {/* Interactive Voucher / Deals Strip */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 my-6 sm:my-8">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {VOUCHERS.map((v) => (
            <div
              key={v.code}
              className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-xs transition hover:shadow-md hover:border-slate-300"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                    {v.badge}
                  </span>
                  <h3 className="font-display text-sm sm:text-base font-extrabold text-slate-900">
                    {v.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">{v.sub}</p>
                </div>
                <div
                  className={`grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-xl bg-linear-to-r ${v.color} text-white shadow-xs`}
                >
                  <Percent className="h-4 w-4" />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                <span className="font-mono text-xs font-black tracking-widest text-slate-800 bg-slate-100 px-2 py-0.5 rounded-lg">
                  {v.code}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyVoucher(v.code)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  {copiedCode === v.code ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Horizontal / Grid Section */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4 sm:mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>Full Aisle Experience</span>
            </div>
            <h2 className="font-display text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Shop by Category
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Over 2,500+ fresh items curated straight from certified farms & brands
            </p>
          </div>
          <Link
            to="/shop"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            <span>View All Categories</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Categories Grid (Responsive: 2 cols on mobile, 3 tablet, 6 desktop) */}
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {cats.slice(0, 12).map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.04, 0.4) }}
            >
              <Link
                to="/shop"
                search={{ category: c.slug }}
                className="group flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-3 sm:p-4 text-center shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/60 hover:shadow-lg"
              >
                <div
                  className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl text-xl sm:text-2xl shadow-xs transition group-hover:scale-110"
                  style={{ backgroundColor: `${c.color}15` }}
                >
                  <span>{c.icon}</span>
                </div>
                <h3 className="mt-2.5 text-xs sm:text-sm font-bold text-slate-800 group-hover:text-emerald-700 line-clamp-1">
                  {c.name}
                </h3>
                <span className="mt-0.5 text-[10px] sm:text-[11px] font-medium text-slate-400">
                  ⚡ 15m Delivery
                </span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AISLE 1: Farm-Fresh Fruits & Greens */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 py-6">
        <div className="flex items-end justify-between gap-2 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <Leaf className="h-3.5 w-3.5 text-emerald-600" />
              <span>Direct Farm Harvest</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Fresh Fruits & Hydroponic Greens
            </h2>
            <p className="text-xs text-slate-500">
              Naturally ripened, pesticide-free, delivered fresh in 15 mins
            </p>
          </div>
          <Link
            to="/shop"
            search={{ category: "groceries" }}
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>See All ({fruitAndVeggiePicks.length})</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4">
          {fruitAndVeggiePicks.slice(0, 4).map((p, i) => (
            <ProductCard key={p.id} product={p as Product} index={i} />
          ))}
        </div>
      </section>

      {/* Flash Deals / Lightning Picks Strip */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 my-6">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-slate-900 via-emerald-950 to-slate-900 p-5 sm:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-300">
                <Flame className="h-3.5 w-3.5 fill-current" /> Lightning Fresh Deals
              </div>
              <h3 className="font-display text-xl sm:text-3xl font-black mt-2">
                Up to 45% OFF Today's Harvest
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-md">
                Limited daily stock direct from hydroponic & organic orchards. Delivered before ice
                melts!
              </p>
            </div>

            {/* Countdown Clock */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-white/10 shrink-0 self-start sm:self-auto">
              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-400 shrink-0 ml-1" />
              <div className="text-center px-1.5 sm:px-2">
                <span className="block font-mono text-lg sm:text-2xl font-black">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-300">
                  Hours
                </span>
              </div>
              <span className="font-bold text-amber-400">:</span>
              <div className="text-center px-1.5 sm:px-2">
                <span className="block font-mono text-lg sm:text-2xl font-black">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-300">
                  Mins
                </span>
              </div>
              <span className="font-bold text-amber-400">:</span>
              <div className="text-center px-1.5 sm:px-2">
                <span className="block font-mono text-lg sm:text-2xl font-black">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="block text-[8px] sm:text-[9px] uppercase tracking-wider text-slate-300">
                  Secs
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AISLE 2: Daily Dairy, Free-Range Eggs & Bakery */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 py-6">
        <div className="flex items-end justify-between gap-2 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              <span>Morning Essentials</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              A2 Cow Milk, Bilona Desi Ghee & Fresh Paneer
            </h2>
            <p className="text-xs text-slate-500">
              Pure, unadulterated dairy from grass-fed regional cows
            </p>
          </div>
          <Link
            to="/shop"
            search={{ category: "groceries" }}
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>See All Dairy</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {dairyAndBakeryPicks.map((p, i) => (
            <ProductCard key={p.id} product={p as Product} index={i} />
          ))}
        </div>
      </section>

      {/* AISLE 3: Gourmet Pantry, Basmati Rice & Dry Fruits */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 py-6">
        <div className="flex items-end justify-between gap-2 mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-700">
              <Tag className="h-3.5 w-3.5 text-purple-600" />
              <span>Pantry Staples & Dry Fruits</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              Premium California Almonds, Basmati & Raw Honey
            </h2>
            <p className="text-xs text-slate-500">100% natural, vacuum-sealed pantry nutrition</p>
          </div>
          <Link
            to="/shop"
            search={{ category: "groceries" }}
            className="text-xs font-bold text-emerald-700 hover:underline flex items-center gap-1"
          >
            <span>Browse Staples</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
          {pantryAndDryFruitsPicks.map((p, i) => (
            <ProductCard key={p.id} product={p as Product} index={i} />
          ))}
        </div>
      </section>

      {/* Featured / Fresh Today Product Section with Category Tab Filters */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>4.5★+ Top Rated</span>
            </div>
            <h2 className="font-display text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Customer Favorites & Full Catalog
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Showing {filteredFeatured.length} live products ready to dispatch
            </p>
          </div>

          {/* Category Filter Pills on Homepage */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: "all", label: "All Items" },
              { id: "groceries", label: "🥦 Groceries" },
              { id: "beauty", label: "💄 Beauty" },
              { id: "smartphones", label: "📱 Mobiles" },
              { id: "kitchen-accessories", label: "🍽️ Kitchen" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCategoryFilter(tab.id)}
                className={`whitespace-nowrap rounded-full px-3 py-1 sm:px-3.5 sm:py-1.5 text-xs font-bold transition cursor-pointer ${
                  activeCategoryFilter === tab.id
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid (2 cols mobile, 3 cols tablet, 4 cols laptop, 5 cols desktop) */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
          {filteredFeatured.slice(0, 15).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
            >
              <ProductCard product={p as Product} index={i} />
            </motion.div>
          ))}
        </div>

        <div className="mt-8 sm:mt-10 flex flex-col items-center justify-center text-center">
          <Link
            to="/shop"
            search={activeCategoryFilter !== "all" ? { category: activeCategoryFilter } : {}}
            className="inline-flex items-center gap-2 rounded-full bg-linear-to-r from-emerald-600 to-emerald-500 px-6 sm:px-8 py-3 text-xs sm:text-sm font-bold text-white shadow-md hover:shadow-emerald-600/30 transition hover:scale-102 active:scale-98"
          >
            <span>Explore Full Catalog ({featured.length} products)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-2 text-xs text-slate-400">
            Instant 15-minute dispatch from your nearest dark store hub
          </p>
        </div>
      </section>

      {/* 4-Pillar Trust Guarantee */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 my-10 sm:my-12">
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: Zap,
              title: "15-Minute Delivery",
              desc: "Hyperlocal dark stores ensure groceries reach your door while ice is cold.",
              color: "text-amber-500 bg-amber-50",
            },
            {
              icon: Leaf,
              title: "100% Farm Fresh",
              desc: "Daily morning procurement straight from verified regional growers and dairies.",
              color: "text-emerald-600 bg-emerald-50",
            },
            {
              icon: ShieldCheck,
              title: "Instant Replacement",
              desc: "Not 100% satisfied with freshness? Instant refund with zero questions asked.",
              color: "text-blue-600 bg-blue-50",
            },
            {
              icon: Truck,
              title: "Free Delivery > ₹499",
              desc: "Enjoy zero delivery charges across India on all qualifying household carts.",
              color: "text-purple-600 bg-purple-50",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex items-start gap-3 sm:gap-3.5 rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-xs"
            >
              <div
                className={`grid h-9 w-9 sm:h-10 sm:w-10 shrink-0 place-items-center rounded-xl ${item.color}`}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-display text-sm font-bold text-slate-900">{item.title}</h4>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quality Promise Hero Banner */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 my-10 sm:my-12">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 sm:p-10 shadow-sm">
          <div className="grid items-center gap-6 sm:gap-8 md:grid-cols-2">
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 mb-3">
                <Leaf className="h-3.5 w-3.5 text-emerald-600" />
                The Basketo Standard
              </span>
              <h3 className="font-display text-2xl sm:text-4xl font-black text-slate-900 leading-tight">
                Crispest greens & ripest fruits.
                <br />
                Or it&apos;s 100% on us.
              </h3>
              <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md">
                Every apple, leafy bunch, and carton of milk is temperature-controlled and inspected
                before leaving our hubs. If anything fails your freshness test, tap one button in
                your orders tab for an instant refund.
              </p>
              <div className="mt-5 sm:mt-6 flex flex-wrap gap-3">
                <Link
                  to="/shop"
                  search={{ category: "groceries" }}
                  className="rounded-full bg-emerald-600 px-5 sm:px-6 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                >
                  Shop Fresh Greens
                </Link>
                <Link
                  to="/p/sustainability"
                  className="rounded-full border border-slate-300 px-4 sm:px-5 py-2.5 text-xs font-bold text-slate-700 hover:border-slate-400 transition"
                >
                  Learn Our Standards
                </Link>
              </div>
            </div>

            <div className="relative h-56 sm:h-80 overflow-hidden rounded-2xl shadow-inner bg-slate-100">
              <img
                src={heroProduce}
                alt="Fresh farm produce"
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Real Customer Testimonials */}
      <section className="mx-auto max-w-7xl px-3 sm:px-6 my-10 sm:my-12">
        <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Real Customer Love
          </span>
          <h3 className="font-display text-xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Loved by 50,000+ Indian Households
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Here is what verified shoppers across Bengaluru, Mumbai & Delhi say about our 15-minute
            delivery.
          </p>
        </div>

        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-2">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed italic">
                  &ldquo;{t.comment}&rdquo;
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-bold text-slate-900">{t.name}</h5>
                  <span className="text-[10px] text-slate-400">{t.city} • Verified Buyer</span>
                </div>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  {t.product}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter Signup Strip */}
      <section className="mx-auto max-w-3xl px-3 sm:px-4 my-10 sm:my-14 text-center">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-12 shadow-sm">
          <div className="mx-auto grid h-10 w-10 sm:h-12 sm:w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 mb-3 sm:mb-4">
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <h3 className="font-display text-xl sm:text-3xl font-black text-slate-900">
            Get ₹150 OFF on Your Next Order
          </h3>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Subscribe for secret Sunday flash coupons, organic recipe guides and seasonal produce
            alerts.
          </p>

          <form
            onSubmit={handleSubscribeNewsletter}
            className="mx-auto mt-5 sm:mt-6 flex max-w-md flex-col sm:flex-row gap-2"
          >
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Enter your email address..."
              required
              className="flex-1 rounded-xl sm:rounded-r-none border border-slate-200 bg-slate-50 px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-slate-900 outline-none focus:border-emerald-500 focus:bg-white"
            />
            <button
              type="submit"
              className="rounded-xl sm:rounded-l-none bg-emerald-600 px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-emerald-700 transition"
            >
              {subscribed ? "Subscribed!" : "Subscribe"}
            </button>
          </form>
          <p className="mt-2 text-[10px] text-slate-400">
            No spam ever. Unsubscribe with 1-click anytime.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
