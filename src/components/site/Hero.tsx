import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Truck, Sparkles, ShieldCheck, Zap, Star, Leaf } from "lucide-react";
import { useRef } from "react";
import apple from "@/assets/floating-apple.png";
import lemon from "@/assets/floating-lemon.png";
import strawberry from "@/assets/floating-strawberry.png";
import carrot from "@/assets/floating-carrot.png";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const stageY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const stageScale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  // Interactive 3D mouse parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 200, mass: 0.5 };
  const stageRotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), springConfig);
  const stageRotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), springConfig);

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
    <section ref={ref} className="relative isolate overflow-hidden gradient-hero">
      {/* animated ambient blobs */}
      <motion.div
        aria-hidden
        animate={{ x: [0, 40, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-300/40 blur-3xl"
      />
      <motion.div
        aria-hidden
        animate={{ x: [0, -30, 0], y: [0, 30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-amber-300/40 blur-3xl"
      />
      {/* sparkle dots */}
      {[...Array(10)].map((_, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute h-1.5 w-1.5 rounded-full bg-primary/60"
          style={{ left: `${(i * 97) % 100}%`, top: `${(i * 53) % 100}%` }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.4, 0.5] }}
          transition={{
            duration: 3 + (i % 4),
            repeat: Infinity,
            delay: i * 0.4,
          }}
        />
      ))}

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
        <motion.div style={{ y: textY }} className="relative z-10 flex flex-col justify-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary shadow-xs"
          >
            <motion.span
              animate={{ rotate: [0, 20, -10, 0] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            >
              <Sparkles className="h-3.5 w-3.5" />
            </motion.span>
            Delivered in 15 minutes
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="font-display text-5xl font-bold leading-[1.05] tracking-tight md:text-7xl"
          >
            <motion.span
              className="block bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500 bg-clip-text text-transparent"
              style={{ backgroundSize: "200% 100%" }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              Farm-fresh,
            </motion.span>
            <span className="relative inline-block">
              delivered
              <motion.svg
                viewBox="0 0 200 14"
                className="absolute -bottom-2 left-0 h-3 w-full text-accent"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
              >
                <motion.path
                  d="M2 10 Q 50 0 100 8 T 198 6"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.8, duration: 1.2, ease: "easeOut" }}
                />
              </motion.svg>
            </span>{" "}
            in minutes.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mt-5 max-w-md text-lg text-muted-foreground"
          >
            Hand-picked produce, daily essentials and artisan bakes — straight from local farms to
            your kitchen.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/shop"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 via-emerald-500 to-amber-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:shadow-emerald-500/50"
              >
                <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                Shop now
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/shop"
                search={{ category: "groceries" }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-6 py-3 text-sm font-semibold shadow-xs backdrop-blur transition hover:bg-muted"
              >
                Browse groceries
              </Link>
            </motion.div>
          </motion.div>

          <div className="mt-10 flex flex-wrap gap-6 text-sm text-muted-foreground">
            {[
              { icon: Truck, label: "Free delivery over ₹2,500" },
              { icon: ShieldCheck, label: "100% fresh promise" },
              { icon: Sparkles, label: "10k+ happy customers" },
            ].map(({ icon: Icon, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                whileHover={{ y: -2 }}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 3D-feel floating produce stage with Interactive Depth */}
        <div
          ref={stageRef}
          onMouseMove={handleStageMouseMove}
          onMouseLeave={handleStageMouseLeave}
          className="relative h-[420px] cursor-grab select-none [perspective:1200px] md:h-[560px]"
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
            {/* Sun disc back layer */}
            <motion.div
              style={{ transform: "translateZ(-40px)" }}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: [1, 1.08, 1], opacity: 0.7 }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute right-0 top-6 h-72 w-72 rounded-full gradient-sun blur-2xl"
            />

            {/* Depth pedestal disc */}
            <motion.div
              style={{ transform: "translateZ(0px)" }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-500/20 bg-gradient-to-br from-card via-card/90 to-emerald-50/30 shadow-2xl shadow-emerald-500/10 md:h-[440px] md:w-[440px]"
            />

            {/* Orbit rings with 3D tilt */}
            <div
              style={{ transform: "translateZ(10px) rotateX(15deg)" }}
              className="absolute left-1/2 top-1/2 h-[480px] w-[480px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-emerald-500/25 spin-slow md:h-[560px] md:w-[560px]"
            />
            <div
              style={{ transform: "translateZ(20px) rotateX(-20deg)" }}
              className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-500/20 md:h-[460px] md:w-[460px]"
            />

            {/* 3D Floating Floating Badges */}
            <motion.div
              style={{ transform: "translateZ(75px)" }}
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute left-[4%] top-[10%] z-30 flex items-center gap-2 rounded-2xl border border-white/40 bg-white/80 px-3.5 py-2 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/80"
            >
              <div className="grid h-7 w-7 place-items-center rounded-full bg-amber-500/20 text-amber-600">
                <Zap className="h-4 w-4 fill-amber-500" />
              </div>
              <div className="text-left text-xs">
                <div className="font-extrabold text-foreground">15 min delivery</div>
                <div className="text-[10px] text-muted-foreground">Doorstep express</div>
              </div>
            </motion.div>

            <motion.div
              style={{ transform: "translateZ(85px)" }}
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute right-[4%] top-[6%] z-30 flex items-center gap-2 rounded-2xl border border-white/40 bg-white/80 px-3.5 py-2 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/80"
            >
              <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500/20 text-emerald-600">
                <Leaf className="h-4 w-4" />
              </div>
              <div className="text-left text-xs">
                <div className="font-extrabold text-foreground">100% Organic</div>
                <div className="text-[10px] text-muted-foreground">Direct farm source</div>
              </div>
            </motion.div>

            <motion.div
              style={{ transform: "translateZ(70px)" }}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute bottom-[4%] left-[28%] z-30 flex items-center gap-2 rounded-2xl border border-white/40 bg-white/80 px-3.5 py-2 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/80"
            >
              <div className="grid h-7 w-7 place-items-center rounded-full bg-rose-500/20 text-rose-600">
                <Star className="h-4 w-4 fill-rose-500" />
              </div>
              <div className="text-left text-xs">
                <div className="font-extrabold text-foreground">4.9/5 Rating</div>
                <div className="text-[10px] text-muted-foreground">Over 10,000 orders</div>
              </div>
            </motion.div>

            {/* Depth-layered Floating Produce */}
            <FloatingFruit
              src={apple}
              alt="Crisp Apple"
              className="left-[6%] top-[22%] w-32 md:w-44"
              delay={0}
              depth={60}
            />
            <FloatingFruit
              src={lemon}
              alt="Juicy Lemon"
              className="right-[6%] top-[18%] w-28 md:w-38"
              delay={0.6}
              depth={50}
              slower
            />
            <FloatingFruit
              src={strawberry}
              alt="Sweet Strawberry"
              className="bottom-[16%] left-[12%] w-32 md:w-42"
              delay={1.2}
              depth={70}
            />
            <FloatingFruit
              src={carrot}
              alt="Crunchy Carrot"
              className="bottom-[12%] right-[8%] w-32 md:w-46"
              delay={1.6}
              depth={45}
              slower
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function FloatingFruit({
  src,
  alt,
  className,
  delay,
  slower,
  depth = 40,
}: {
  src: string;
  alt: string;
  className: string;
  delay: number;
  slower?: boolean;
  depth?: number;
}) {
  return (
    <motion.img
      src={src}
      alt={alt}
      style={{ transform: `translateZ(${depth}px)` }}
      initial={{ opacity: 0, scale: 0.5, y: 40 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 80 }}
      whileHover={{ scale: 1.18, rotate: 10, zIndex: 40 }}
      className={`absolute cursor-pointer drop-shadow-2xl transition-transform ${slower ? "float-slower" : "float-slow"} ${className}`}
    />
  );
}
