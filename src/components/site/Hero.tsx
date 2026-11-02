import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Truck,
  Sparkles,
  ShieldCheck,
  Zap,
  Star,
  Leaf,
  CheckCircle2,
} from "lucide-react";
import { useRef } from "react";
import apple from "@/assets/floating-apple.png";
import lemon from "@/assets/floating-lemon.png";
import strawberry from "@/assets/floating-strawberry.png";
import carrot from "@/assets/floating-carrot.png";
import heroProduce from "@/assets/hero-produce.jpg";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const stageY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const stageScale = useTransform(scrollYProgress, [0, 1], [1, 0.95]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  // Interactive 3D mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const stageRotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const stageRotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig);

  function handleStageMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }

  function handleStageMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-linear-to-b from-emerald-50/60 via-amber-50/20 to-white pt-6 pb-12 sm:pt-10 sm:pb-16 md:py-20"
    >
      {/* Ambient background glows */}
      <motion.div
        aria-hidden
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-20 top-0 h-64 w-64 rounded-full bg-emerald-400/20 blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, -30, 0], y: [0, 20, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl"
      />

      <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12">
        {/* Left: Text & CTA Content */}
        <motion.div
          style={{ y: textY }}
          className="relative z-10 flex flex-col justify-center lg:col-span-7"
        >
          {/* Top 15-Minute Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50/90 px-3 py-1 text-xs font-bold text-emerald-800 shadow-xs backdrop-blur-xs"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
              15-Minute Express Delivery
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-[11px] text-emerald-700 font-semibold">
              Live in Bengaluru, Mumbai & Delhi
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-display text-3xl sm:text-5xl md:text-6xl font-black leading-[1.1] tracking-tight text-slate-900"
          >
            <span className="block">Farm-fresh groceries,</span>
            <span className="bg-linear-to-r from-emerald-600 via-teal-600 to-amber-500 bg-clip-text text-transparent">
              delivered in 15 minutes.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-3 sm:mt-5 max-w-xl text-sm sm:text-base md:text-lg text-slate-600 leading-relaxed"
          >
            Direct harvest from certified regional growers. Crispiest greens, sweetest Alphonso
            mangoes, organic A2 dairy and bakes — rushed to your door before ice melts.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              to="/shop"
              className="group relative inline-flex items-center justify-center gap-2 rounded-full bg-linear-to-r from-emerald-600 to-emerald-500 px-6 sm:px-8 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:shadow-emerald-600/50 hover:scale-102 active:scale-98"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              to="/shop"
              search={{ category: "groceries" }}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 bg-white/90 px-5 sm:px-6 py-3 text-sm font-bold text-slate-800 shadow-xs backdrop-blur-xs transition hover:bg-slate-50 hover:border-slate-400 active:scale-98"
            >
              <span>🥦 Fresh Produce</span>
            </Link>
          </motion.div>

          {/* Quick Feature Badges on Mobile & Desktop */}
          <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-4 border-t border-slate-200/80 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <div className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-lg bg-emerald-100/70 text-emerald-700">
                <Truck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Zero Fee</h4>
                <p className="text-[10px] text-slate-500 hidden sm:block">Above ₹499</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <div className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-lg bg-amber-100/70 text-amber-700">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">100% Refund</h4>
                <p className="text-[10px] text-slate-500 hidden sm:block">Fresh Guarantee</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-2">
              <div className="grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-lg bg-teal-100/70 text-teal-700">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">4.9/5 Rating</h4>
                <p className="text-[10px] text-slate-500 hidden sm:block">50K+ Shoppers</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mobile Showcase Hero Card (320px - 639px) */}
        <div className="sm:hidden relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-3 shadow-md">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100">
            <img
              src={heroProduce}
              alt="Fresh farm produce"
              className="h-full w-full object-cover"
            />
            {/* Scrim overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full bg-emerald-600/95 px-2.5 py-1 text-[10px] font-bold text-white shadow-xs backdrop-blur-xs">
              <Zap className="h-3 w-3 fill-amber-300 text-amber-300" />
              <span>15-Min Delivery</span>
            </div>

            <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-full bg-slate-900/80 px-2 py-1 text-[10px] font-bold text-emerald-400 backdrop-blur-xs">
              <Leaf className="h-3 w-3" />
              <span>100% Farm Fresh</span>
            </div>

            <div className="absolute bottom-2.5 left-3 right-3 text-white">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                Morning Harvest Live
              </div>
              <div className="font-display text-sm font-bold leading-snug">
                Sweet Alphonso Mangoes, Hydroponic Greens & A2 Cow Milk
              </div>
            </div>
          </div>

          {/* Quick Category Jump Pills on Mobile */}
          <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center">
            <Link
              to="/shop"
              search={{ category: "groceries" }}
              className="rounded-xl bg-emerald-50 py-2 text-[11px] font-bold text-emerald-800 border border-emerald-200/60 active:scale-95 transition"
            >
              🥦 Veggies
            </Link>
            <Link
              to="/shop"
              search={{ category: "groceries" }}
              className="rounded-xl bg-amber-50 py-2 text-[11px] font-bold text-amber-800 border border-amber-200/60 active:scale-95 transition"
            >
              🍎 Fruits
            </Link>
            <Link
              to="/shop"
              search={{ category: "groceries" }}
              className="rounded-xl bg-blue-50 py-2 text-[11px] font-bold text-blue-800 border border-blue-200/60 active:scale-95 transition"
            >
              🥛 Dairy
            </Link>
          </div>
        </div>

        {/* Right: Floating Produce Visual Stage (Tablet & Desktop Only) */}
        <div
          ref={stageRef}
          onMouseMove={handleStageMouseMove}
          onMouseLeave={handleStageMouseLeave}
          className="hidden sm:block relative mx-auto w-full max-w-sm sm:max-w-md lg:max-w-none h-[380px] md:h-[460px] lg:col-span-5 select-none [perspective:1000px] overflow-hidden"
        >
          <motion.div
            style={{
              y: stageY,
              scale: stageScale,
              rotateX: stageRotateX,
              rotateY: stageRotateY,
              transformStyle: "preserve-3d",
            }}
            className="relative h-full w-full"
          >
            {/* Center Pedestal Disc */}
            <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] md:h-[360px] md:w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-500/20 bg-linear-to-br from-emerald-100/60 via-white to-amber-50/40 shadow-xl shadow-emerald-500/10" />

            {/* Orbit Ring */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[360px] w-[360px] md:h-[420px] md:w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-emerald-400/30" />

            {/* Floating Live Badge 1: 15m Delivery */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-6 top-8 z-20 flex items-center gap-1.5 rounded-xl border border-white/60 bg-white/90 px-2.5 py-1.5 shadow-lg backdrop-blur-xs"
            >
              <div className="grid h-6 w-6 place-items-center rounded-full bg-amber-50 text-amber-600">
                <Zap className="h-3.5 w-3.5 fill-amber-500" />
              </div>
              <div className="text-left">
                <div className="text-[11px] font-black text-slate-900">15m Delivery</div>
                <div className="text-[9px] text-slate-500">Express rider</div>
              </div>
            </motion.div>

            {/* Floating Live Badge 2: Organic */}
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute right-6 top-12 z-20 flex items-center gap-1.5 rounded-xl border border-white/60 bg-white/90 px-2.5 py-1.5 shadow-lg backdrop-blur-xs"
            >
              <div className="grid h-6 w-6 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                <Leaf className="h-3.5 w-3.5" />
              </div>
              <div className="text-left">
                <div className="text-[11px] font-black text-slate-900">100% Pure</div>
                <div className="text-[9px] text-slate-500">Farm checked</div>
              </div>
            </motion.div>

            {/* Floating Fruit Visuals */}
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 4, 0] }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-12 top-24 h-32 w-32 drop-shadow-xl"
            >
              <img src={apple} alt="Fresh apple" className="h-full w-full object-contain" />
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0], rotate: [0, -4, 0] }}
              transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
              className="absolute right-12 bottom-16 h-32 w-32 drop-shadow-xl"
            >
              <img
                src={strawberry}
                alt="Fresh strawberry"
                className="h-full w-full object-contain"
              />
            </motion.div>

            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, 6, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
              className="absolute left-1/2 -translate-x-1/2 top-14 h-36 w-36 drop-shadow-2xl"
            >
              <img src={lemon} alt="Fresh lemon" className="h-full w-full object-contain" />
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0], rotate: [0, -6, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              className="absolute left-16 bottom-8 h-28 w-28 drop-shadow-lg"
            >
              <img src={carrot} alt="Fresh carrot" className="h-full w-full object-contain" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
