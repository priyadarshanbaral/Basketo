import { motion } from "framer-motion";

export const BRAND_NAME = "Basketo";
export const BRAND_TAGLINE = "Fresh markets, delivered in minutes";

export type BrandLogoSize = "xs" | "sm" | "md" | "lg" | "xl" | "hero";
export type BrandLogoVariant = "icon" | "full" | "stack";
export type BrandLogoTheme = "auto" | "light" | "dark";

const SIZE_MAP: Record<
  BrandLogoSize,
  { mark: number; word: string; tagline?: string; gap: string; px: string }
> = {
  xs: { mark: 26, word: "text-[15px]", tagline: undefined, gap: "gap-1.5", px: "px-0" },
  sm: { mark: 32, word: "text-base", tagline: undefined, gap: "gap-2", px: "px-0" },
  md: { mark: 38, word: "text-xl", tagline: undefined, gap: "gap-2", px: "px-0" },
  lg: { mark: 44, word: "text-2xl", tagline: undefined, gap: "gap-2.5", px: "px-0" },
  xl: { mark: 56, word: "text-3xl", tagline: "text-[11px]", gap: "gap-3", px: "px-0" },
  hero: { mark: 72, word: "text-5xl", tagline: "text-sm", gap: "gap-4", px: "px-0" },
};

/**
 * Premium Basketo brand mark.
 *
 * - `size` controls overall scale (icon + wordmark together).
 * - `variant` controls whether to render the icon alone, the icon + wordmark inline,
 *   or the icon stacked above the wordmark with tagline.
 * - `theme` controls the wordmark color so the logo sits correctly on light/dark
 *   backgrounds without callers having to wrap it in extra classes.
 */
export function BrandLogo({
  size = "md",
  variant = "full",
  theme = "auto",
  withWordmark = true,
  animate = true,
  className = "",
}: {
  size?: BrandLogoSize;
  variant?: BrandLogoVariant;
  theme?: BrandLogoTheme;
  /** Force-hide the wordmark even when variant is `full` or `stack`. */
  withWordmark?: boolean;
  /** Disable the hover micro-animation (useful inside buttons). */
  animate?: boolean;
  className?: string;
}) {
  const cfg = SIZE_MAP[size];
  const gradientId = `bl-grad-${size}`;
  const leafId = `bl-leaf-${size}`;
  const innerId = `bl-inner-${size}`;

  const wordColor =
    theme === "dark"
      ? "text-white"
      : theme === "light"
        ? "text-slate-900"
        : "text-slate-900 dark:text-white";

  const taglineColor = theme === "dark" ? "text-slate-300" : "text-slate-500 dark:text-slate-400";

  const Mark = (
    <motion.svg
      initial={false}
      whileHover={animate ? { rotate: -6, scale: 1.06 } : undefined}
      transition={{ type: "spring", stiffness: 280, damping: 18 }}
      width={cfg.mark}
      height={cfg.mark}
      viewBox="0 0 48 48"
      role="img"
      aria-label="Basketo logo"
      className="shrink-0 drop-shadow-[0_6px_18px_rgba(16,185,129,0.28)]"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="55%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        <linearGradient id={leafId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id={innerId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Outer rounded tile with subtle border */}
      <rect
        x="1.5"
        y="1.5"
        width="45"
        height="45"
        rx="13"
        fill={`url(#${gradientId})`}
        stroke="rgba(255,255,255,0.35)"
        strokeWidth="1"
      />
      {/* Subtle inner highlight */}
      <rect x="3" y="3" width="42" height="20" rx="11" fill={`url(#${innerId})`} />

      {/* Basket handle */}
      <path
        d="M17 16c1.8-3.6 4.2-5.4 7-5.4s5.2 1.8 7 5.4"
        stroke="white"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Basket body */}
      <path
        d="M11.5 19.5h25l-2.6 16.4a3 3 0 0 1-3 2.5H17.1a3 3 0 0 1-3-2.5L11.5 19.5Z"
        fill="white"
        fillOpacity="0.96"
      />

      {/* Basket weave lines for premium detail */}
      <path
        d="M14.5 24.5h19M15.2 29h17.6M15.9 33.5h16.2"
        stroke="#a7f3d0"
        strokeWidth="0.9"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Leaf accent (top-right) */}
      <path
        d="M30.5 11.5c3.6-.6 6.3.9 7 4-3.7.7-6.3-.5-7-4Z"
        fill={`url(#${leafId})`}
        stroke="white"
        strokeWidth="0.6"
        strokeLinejoin="round"
      />

      {/* Fruit dots */}
      <circle cx="20" cy="27" r="2.3" fill="#f97316" />
      <circle cx="27.5" cy="29.5" r="2.3" fill="#ef4444" />
      <circle cx="22.5" cy="32.5" r="2.1" fill="#a78bfa" />
    </motion.svg>
  );

  const Word = (
    <span
      className={`font-display font-black tracking-tight leading-none ${cfg.word} ${wordColor}`}
    >
      {BRAND_NAME}
      {cfg.tagline && (
        <span
          className={`block mt-1 font-sans font-medium tracking-wide ${cfg.tagline} ${taglineColor}`}
        >
          {BRAND_TAGLINE}
        </span>
      )}
    </span>
  );

  // Icon only.
  if (variant === "icon" || !withWordmark) {
    return <span className={`inline-flex items-center ${className}`}>{Mark}</span>;
  }

  // Icon stacked above wordmark.
  if (variant === "stack") {
    return (
      <span className={`inline-flex flex-col items-center text-center ${cfg.gap} ${className}`}>
        {Mark}
        {Word}
      </span>
    );
  }

  // Default: inline icon + wordmark.
  return (
    <span className={`inline-flex items-center ${cfg.gap} ${className}`}>
      {Mark}
      {Word}
    </span>
  );
}
