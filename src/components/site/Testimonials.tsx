import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const REVIEWS = [
  {
    name: "Ananya S.",
    city: "Bhubaneswar",
    text: "Mangoes arrived in 12 minutes and were perfectly ripe. Basketo has replaced my weekly market run.",
    grad: "from-emerald-50 via-white to-teal-50 ring-emerald-200/70",
    avatar: "from-emerald-400 to-teal-500",
  },
  {
    name: "Rohit K.",
    city: "Cuttack",
    text: "The bakery section is next-level. Warm croissants at 8am? Yes please. Best grocery app I've used.",
    grad: "from-amber-50 via-white to-orange-50 ring-orange-200/70",
    avatar: "from-amber-400 to-orange-500",
  },
  {
    name: "Meera P.",
    city: "Puri",
    text: "Prices are honest, delivery is fast, and the AI helper actually suggested a recipe for what I bought!",
    grad: "from-fuchsia-50 via-white to-pink-50 ring-pink-200/70",
    avatar: "from-fuchsia-400 to-pink-500",
  },
];

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent-foreground">
          <Star className="h-3.5 w-3.5 fill-current text-accent" /> 4.9 average rating
        </span>
        <h2 className="mt-3 font-display text-3xl font-bold md:text-4xl">Loved across Odisha</h2>
        <p className="mt-1 text-muted-foreground">Real reviews from real Basketo shoppers.</p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {REVIEWS.map((r, i) => (
          <motion.figure
            key={r.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -6, rotate: -0.5 }}
            className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${r.grad} p-6 ring-1 transition hover:shadow-xl`}
          >
            <Quote className="absolute -right-2 -top-2 h-20 w-20 text-primary/10" />
            <div className="flex gap-1 text-accent">
              {Array.from({ length: 5 }).map((_, k) => (
                <Star key={k} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <blockquote className="mt-3 text-sm leading-relaxed text-slate-800">
              "{r.text}"
            </blockquote>
            <figcaption className="mt-5 flex items-center gap-3">
              <span
                className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${r.avatar} font-display text-sm font-bold text-white shadow-md`}
              >
                {r.name.charAt(0)}
              </span>
              <div>
                <div className="text-sm font-semibold text-slate-900">{r.name}</div>
                <div className="text-xs text-slate-600">{r.city}</div>
              </div>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}
