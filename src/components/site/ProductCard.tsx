import { Link, useNavigate } from "@tanstack/react-router";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Plus, Star } from "lucide-react";
import { cart } from "@/lib/cart-store";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-hook";
import { useRef } from "react";

export type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  unit: string;
  stock: number;
  images: string[];
  rating: number;
  is_on_sale: boolean;
};

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 260, mass: 0.4 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), springConfig);
  const glareOpacity = useSpring(useTransform(mouseY, [-0.5, 0.5], [0.15, 0]), springConfig);

  const img = product.images[0] ?? "";
  const off = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  function handleAddToCart() {
    if (!user) {
      navigate({
        to: "/auth",
        search: { redirect_to: `/product/${product.slug}` },
      });
      toast.info("Please sign in to add items to your cart");
      return;
    }
    cart.add({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      image: img,
      unit: product.unit,
    });
    toast.success(`${product.name} added to cart`);
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: Math.min(index, 8) * 0.04 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={{ scale: 1.02 }}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card p-3 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-emerald-500/10 hover:border-emerald-500/30"
    >
      {/* 3D Dynamic Glare Effect */}
      <motion.div
        style={{ opacity: glareOpacity }}
        className="pointer-events-none absolute inset-0 z-20 rounded-3xl bg-gradient-to-tr from-transparent via-white/40 to-transparent transition-opacity"
      />

      <div
        className="relative block aspect-square overflow-hidden rounded-2xl bg-muted/60"
        style={{ transform: "translateZ(25px)", transformStyle: "preserve-3d" }}
      >
        <Link to="/product/$slug" params={{ slug: product.slug }} className="block h-full w-full">
          {off > 0 && (
            <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-2.5 py-0.5 text-[11px] font-extrabold text-white shadow-md">
              -{off}%
            </span>
          )}
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        </Link>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const added = store.toggleWishlist(product.id);
            if (added) toast.success(`Saved ${product.name} to wishlist ❤️`);
            else toast.info(`Removed ${product.name} from wishlist`);
          }}
          className="absolute right-2.5 top-2.5 z-20 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-rose-500 shadow-sm backdrop-blur-xs transition hover:scale-115 active:scale-95"
          aria-label="Toggle Wishlist"
        >
          <Heart
            className={`h-4 w-4 ${
              store.isWishlisted(product.id) ? "fill-rose-500 text-rose-500" : "text-slate-600"
            }`}
          />
        </button>
      </div>

      <div
        className="mt-3 flex flex-1 flex-col gap-1 px-1"
        style={{ transform: "translateZ(15px)" }}
      >
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-foreground">{product.rating}</span>
          <span className="text-[11px] opacity-70">★</span>
        </div>
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="line-clamp-1 font-semibold text-foreground transition-colors group-hover:text-primary"
        >
          {product.name}
        </Link>
        <div className="text-xs text-muted-foreground">{product.unit}</div>
        <div className="mt-2 flex items-end justify-between pt-1">
          <div>
            <div className="font-display text-lg font-extrabold text-foreground">
              ₹{Math.round(product.price).toLocaleString("en-IN")}
            </div>
            {product.compare_at_price && (
              <div className="text-xs text-muted-foreground line-through">
                ₹{Math.round(Number(product.compare_at_price)).toLocaleString("en-IN")}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                cart.add({
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: Number(product.price),
                  image: img,
                  unit: product.unit,
                });
                navigate({ to: "/cart" });
              }}
              className="rounded-full border border-emerald-500/30 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300"
            >
              Buy
            </button>

            <button
              onClick={handleAddToCart}
              className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/30 transition hover:scale-115 hover:shadow-lg active:scale-95"
              aria-label="Add to cart"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
