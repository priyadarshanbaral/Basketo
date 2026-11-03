import { Link, useNavigate } from "@tanstack/react-router";
import { Plus, Minus, Star, Heart, Zap, Check } from "lucide-react";
import { cart, useCart } from "@/lib/cart-store";
import { store } from "@/lib/flipkart-store";
import { toast } from "sonner";
import { useSyncExternalStore, useState } from "react";

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
  useSyncExternalStore(
    (cb) => store.subscribe(cb),
    store.getSnapshotVersion,
    store.getSnapshotVersion,
  );
  const user = store.currentUser;
  const isWishlisted = store.isWishlisted(product.id);
  const { items } = useCart();
  const cartItem = items.find((i) => i.id === product.id);
  const qtyInCart = cartItem?.quantity || 0;

  const navigate = useNavigate();

  const [imgSrc, setImgSrc] = useState(product.images[0] ?? "");
  const off = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate({
        to: "/auth",
        search: { redirect_to: `/product/${product.slug}` },
      });
      toast.info("Please sign in to save items to your wishlist");
      return;
    }
    const added = store.toggleWishlist(product.id);
    if (added) toast.success(`Saved "${product.name}" to wishlist`);
    else toast.info(`Removed from wishlist`);
  }

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate({
        to: "/auth",
        search: { redirect_to: `/product/${product.slug}` },
      });
      toast.info("Please sign in to add items to cart");
      return;
    }
    cart.add({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      image: imgSrc,
      unit: product.unit,
    });
    toast.success(`Added ${product.name} to cart`);
  }

  function handleQuickBuy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate({
        to: "/auth",
        search: { redirect_to: `/product/${product.slug}` },
      });
      toast.info("Please sign in to checkout");
      return;
    }
    cart.add({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      image: imgSrc,
      unit: product.unit,
    });
    navigate({ to: "/cart" });
  }

  function handleIncrement(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    cart.setQty(product.id, qtyInCart + 1);
  }

  function handleDecrement(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    cart.setQty(product.id, qtyInCart - 1);
  }

  const inStock = product.stock > 0;
  const isLowStock = product.stock > 0 && product.stock <= 8;

  return (
    <article className="bk-premium-product-card group relative flex h-full min-h-[21rem] flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-2.5 sm:p-3 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/70 hover:shadow-xl">
      {/* Top Image Container (Perfect square framing) */}
      <div className="bk-product-image-frame relative aspect-square w-full shrink-0 overflow-hidden rounded-xl bg-slate-50">
        {/* Discount Badge */}
        {off > 0 && (
          <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-10 inline-flex items-center gap-0.5 rounded-full bg-linear-to-r from-amber-500 to-rose-500 px-2 py-0.5 text-[10px] sm:text-[11px] font-black uppercase tracking-tight text-white shadow-xs">
            {off}% OFF
          </span>
        )}

        {/* 15m Delivery Tag */}
        <span className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 z-10 inline-flex items-center gap-1 rounded-full bg-slate-900/85 px-2 py-0.5 text-[9px] sm:text-[10px] font-bold text-emerald-400 backdrop-blur-xs">
          <Zap className="h-2.5 w-2.5 fill-current" /> 15 MINS
        </span>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10 grid h-7 w-7 sm:h-8 sm:w-8 place-items-center rounded-full bg-white/90 text-slate-500 shadow-xs backdrop-blur-xs transition hover:scale-110 hover:bg-white active:scale-95"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 transition-colors ${
              isWishlisted ? "fill-rose-500 text-rose-500" : "text-slate-500 hover:text-rose-500"
            }`}
          />
        </button>

        {/* Product Image Link */}
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="block h-full w-full overflow-hidden"
        >
          <img
            src={imgSrc}
            alt={product.name}
            loading="lazy"
            width={600}
            height={600}
            onError={() =>
              setImgSrc("https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80")
            }
            className="bk-product-image transition-transform duration-500 group-hover:scale-105"
          />
        </Link>
      </div>

      {/* Product Details */}
      <div className="mt-2.5 flex flex-1 flex-col justify-between">
        <div>
          {/* Rating & Unit */}
          <div className="flex items-center justify-between text-[11px] sm:text-xs">
            <div className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 font-bold text-amber-800">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
            </div>
            <span className="font-semibold text-slate-500 truncate max-w-[85px]">
              {product.unit}
            </span>
          </div>

          {/* Product Title (Aligned Baseline across cards) */}
          <Link
            to="/product/$slug"
            params={{ slug: product.slug }}
            className="mt-1.5 line-clamp-2 min-h-9 sm:min-h-10 text-xs sm:text-sm font-bold text-slate-900 transition-colors group-hover:text-emerald-700 leading-snug"
            title={product.name}
          >
            {product.name}
          </Link>
        </div>

        {/* Price & Action Row */}
        <div className="mt-2.5 border-t border-slate-100 pt-2">
          <div className="flex items-baseline justify-between gap-1 mb-2">
            <div className="flex flex-wrap items-baseline gap-1">
              <span className="font-display text-base sm:text-lg font-black text-slate-900">
                ₹{Math.round(product.price).toLocaleString("en-IN")}
              </span>
              {product.compare_at_price && (
                <span className="text-[11px] text-slate-400 line-through">
                  ₹{Math.round(Number(product.compare_at_price)).toLocaleString("en-IN")}
                </span>
              )}
            </div>
            {isLowStock ? (
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-amber-600">
                Low Stock
              </span>
            ) : !inStock ? (
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-rose-600">
                Out of Stock
              </span>
            ) : null}
          </div>

          {/* Interactive Stepper or Add to Cart Button */}
          {qtyInCart > 0 ? (
            <div className="flex items-center justify-between rounded-xl bg-emerald-600 px-2 py-1 text-white shadow-xs">
              <button
                type="button"
                onClick={handleDecrement}
                className="grid h-6 w-6 place-items-center rounded-lg bg-emerald-700/80 hover:bg-emerald-800 active:scale-90 transition cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3 w-3 stroke-[3]" />
              </button>
              <span className="font-black text-xs px-2">{qtyInCart} in Cart</span>
              <button
                type="button"
                onClick={handleIncrement}
                className="grid h-6 w-6 place-items-center rounded-lg bg-emerald-700/80 hover:bg-emerald-800 active:scale-90 transition cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="h-3 w-3 stroke-[3]" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={handleQuickBuy}
                disabled={!inStock}
                className="flex-1 rounded-xl bg-slate-900 py-1.5 text-[11px] sm:text-xs font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 active:scale-98"
              >
                Buy Now
              </button>
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!inStock}
                aria-label="Add to cart"
                className="grid h-7 w-7 sm:h-8 sm:w-8 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/90 transition hover:bg-emerald-600 hover:text-white hover:border-emerald-600 disabled:cursor-not-allowed disabled:opacity-40 active:scale-95 cursor-pointer"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
