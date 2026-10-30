import { motion } from "framer-motion";
import { Search, ShoppingBag, Truck } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "Pick your basket",
    desc: "Browse thousands of hand-picked essentials from local farms and stores.",
    grad: "from-emerald-400 via-emerald-500 to-teal-600",
    ring: "shadow-emerald-500/30",
  },
  {
    icon: ShoppingBag,
    title: "Checkout in a tap",
    desc: "Secure payments, saved addresses and instant order confirmation.",
    grad: "from-amber-400 via-orange-500 to-rose-500",
    ring: "shadow-orange-500/30",
  },
  {
    icon: Truck,
    title: "Delivered in 15 min",
    desc: "Track your Basketo rider live from store to your doorstep.",
    grad: "from-sky-400 via-blue-500 to-indigo-600",
    ring: "shadow-blue-500/30",
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          How Basketo works
        </span>
        <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Three taps to fresh</h2>
        <p className="mt-1 text-muted-foreground">
          From craving to kitchen in under fifteen minutes.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -6 }}
            className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-sm transition hover:shadow-xl"
          >
            <span
              className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition group-hover:opacity-40 group-hover:scale-125"
              style={{
                backgroundImage: "linear-gradient(135deg, currentColor, currentColor)",
              }}
            />
            <div
              className={`inline-grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${s.grad} text-white shadow-lg ${s.ring}`}
            >
              <s.icon className="h-6 w-6" />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span className="font-display text-xs font-bold text-muted-foreground">
                STEP 0{i + 1}
              </span>
            </div>
            <h3 className="mt-1 font-display text-xl font-bold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
