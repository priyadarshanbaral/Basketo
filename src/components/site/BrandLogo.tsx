import { motion } from "framer-motion";

export function BrandLogo({ size = 40 }: { size?: number }) {
  return (
    <motion.svg
      whileHover={{ rotate: -8, scale: 1.08 }}
      transition={{ type: "spring", stiffness: 300 }}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className="drop-shadow-[0_6px_16px_rgba(52,211,153,0.35)]"
    >
      <defs>
        <linearGradient id="bl-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="55%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="bl-leaf" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
      </defs>
      {/* rounded gradient tile */}
      <rect x="2" y="2" width="44" height="44" rx="13" fill="url(#bl-grad)" />
      {/* basket */}
      <path
        d="M13 20h22l-2.4 15.2a3 3 0 0 1-3 2.5H18.4a3 3 0 0 1-3-2.5L13 20Z"
        fill="white"
        opacity="0.95"
      />
      <path
        d="M18 15c1.6-3.4 4-5 6-5s4.4 1.6 6 5"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        fill="none"
      />
      {/* leaf accent */}
      <path d="M31 12c3.5-.5 6 1 6.5 4-3.5.6-5.8-.6-6.5-4Z" fill="url(#bl-leaf)" />
      {/* fruit dots */}
      <circle cx="20" cy="27" r="2.2" fill="#f97316" />
      <circle cx="27" cy="30" r="2.2" fill="#ef4444" />
      <circle cx="22" cy="32" r="2" fill="#a78bfa" />
    </motion.svg>
  );
}

export const BRAND_NAME = "Basketo";
export const BRAND_TAGLINE = "Fresh markets, delivered in minutes";
