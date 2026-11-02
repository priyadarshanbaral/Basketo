import { Link, useNavigate } from "@tanstack/react-router";
import { Plus, Star, Heart } from "lucide-react";
import { cart } from "@/lib/cart-store";
import { store } from "@/lib/flipkart-store";
import { toast } from "sonner";
import { useRef, useState, useSyncExternalStore } from "react";

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

const cardStyle = {
  border: `1px solid var(--bk-border)`,
  background: `var(--bk-surface)`,
  borderRadius: "0.75rem",
  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  transition: "all 250ms cubic-bezier(0.4, 0, 0.2, 1)",
};
const cardHoverStyle = {
  transform: "translateY(-4px)",
  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
  borderColor: "var(--bk-primary)",
};
const imageStyle = { borderRadius: "0.5rem", background: "var(--bk-surface-alt)" };
const badgeStyle = {
  position: "absolute",
  left: "0.5rem",
  top: "0.5rem",
  zIndex: 20,
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  borderRadius: "9999px",
  background: "linear-gradient(to right, #f59e0b, #f43f5e)",
  padding: "0.5rem 0.75rem",
  fontSize: "0.75rem",
  fontWeight: "900",
  color: "#fff",
  textTransform: "uppercase",
  letterSpacing: "-0.025em",
  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
};
const wishlistStyle = {
  position: "absolute",
  right: "0.5rem",
  top: "0.5rem",
  zIndex: 20,
  display: "grid",
  height: "2rem",
  width: "2rem",
  placeItems: "center",
  borderRadius: "9999px",
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(4px)",
  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
};
const contentStyle = { marginTop: "0.75rem", display: "flex", flexDirection: "column", gap: "0.25rem", paddingLeft: "0.5rem", paddingRight: "0.5rem" };
const ratingStyle = { display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem" };
const titleStyle = { fontWeight: "600", color: "var(--bk-ink)", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden", fontSize: "0.875rem" };
const unitStyle = { fontSize: "0.6875rem", color: "var(--bk-muted)" };
const priceRowStyle = { marginTop: "0.5rem", display: "flex", alignItems: "end", justifyContent: "between", paddingTop: "0.25rem" };
const priceStyle = { fontFamily: "var(--font-display)", fontWeight: "800", color: "var(--bk-ink)", fontSize: "1.125rem" };
const compareStyle = { fontSize: "0.75rem", color: "var(--bk-muted)", textDecoration: "line-through", marginLeft: "0.25rem" };
const discountStyle = { fontSize: "0.75rem", fontWeight: "700", color: "var(--bk-success)" };
const actionsStyle = { marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" };
const buyBtnStyle = {
  flex: 1,
  borderRadius: "0.5rem",
  background: "var(--bk-primary)",
  padding: "0.375rem 0.75rem",
  fontSize: "0.6875rem",
  fontWeight: "700",
  color: "#fff",
  transition: "background-color 200ms cubic-bezier(0.4, 0, 0.2, 1)",
};
const addBtnStyle = {
  height: "2rem",
  width: "2rem",
  display: "grid",
  placeItems: "center",
  borderRadius: "9999px",
  background: "linear-gradient(to right, var(--bk-primary), var(--bk-primary-hover))",
  color: "#fff",
  boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
};
const stockStyle = { marginTop: "0.25rem", fontSize: "0.625rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "-0.025em" };

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const user = useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.currentUser,
    () => store.currentUser,
  );
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);

  const img = product.images[0] ?? "";
  const off = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const [isWishlisted] = useState(() => store.isWishlisted(product.id));

  function handleToggleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate({
        to: "/auth",
        search: { redirect_to: `/product/${product.slug}` },
      });
      toast.info("Please sign in to save items");
      return;
    }
    const added = store.toggleWishlist(product.id);
    if (added) toast.success(`Saved ${product.name} to wishlist`);
    else toast.info(`Removed from wishlist`);
  }

  function handleAddToCart() {
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
      image: img,
      unit: product.unit,
    });
    toast.success(`${product.name} added to cart`);
  }

  function handleQuickBuy() {
    if (!user) {
      navigate({
        to: "/auth",
        search: { redirect_to: `/product/${product.slug}` },
      });
      toast.info("Please sign in to continue");
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
    navigate({ to: "/cart" });
  }

  const stockLabel = product.stock > 10 ? "In Stock" : product.stock > 0 ? `Only ${product.stock} left` : "Out of Stock";
  const stockColor = product.stock > 10 ? "var(--bk-success)" : product.stock > 0 ? "var(--bk-warning)" : "var(--bk-error)";

  return (
    <article
      ref={cardRef}
      style={cardStyle}
      className="relative flex flex-col overflow-hidden transition-all duration-300 hover:border-bk-primary hover:shadow-bk-xl"
      onMouseEnter={(e) => { Object.assign(cardRef.current!.style, cardHoverStyle); }}
      onMouseLeave={(e) => { Object.assign(cardRef.current!.style, cardStyle); }}
    >
      <div style={imageStyle} className="relative block aspect-square overflow-hidden">
        {off > 0 && (
          <span style={badgeStyle}>-{off}%</span>
        )}

        <Link to="/product/$slug" params={{ slug: product.slug }} className="block h-full w-full">
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover hover:scale-105 duration-500"
          />
        </Link>

        <button
          onClick={handleToggleWishlist}
          style={wishlistStyle}
          className="hover:scale-110 active:scale-95"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`h-5 w-5 ${isWishlisted ? "fill-rose-500 text-rose-500" : "text-slate-600"}`}
          />
        </button>
      </div>

      <div style={contentStyle}>
        <div style={ratingStyle} className="text-xs">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-semibold text-bk-ink">{product.rating}</span>
        </div>
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          style={titleStyle}
          className="hover:text-bk-primary transition-colors duration-200"
        >
          {product.name}
        </Link>
        <div style={unitStyle} className="text-bk-muted">{product.unit}</div>

        <div style={priceRowStyle}>
          <div>
            <div style={priceStyle}>
              ₹{Math.round(product.price).toLocaleString("en-IN")}
            </div>
            {product.compare_at_price && (
              <div style={compareStyle}>
                ₹{Math.round(Number(product.compare_at_price)).toLocaleString("en-IN")}
              </div>
            )}
            {off > 0 && <span style={discountStyle}>{off}% off</span>}
          </div>

          <div style={actionsStyle} className="flex items-center gap-1.5">
            <button
              onClick={handleQuickBuy}
              style={buyBtnStyle}
              className="hover:opacity-95"
              disabled={product.stock === 0}
            >
              Buy
            </button>
            <button
              onClick={handleAddToCart}
              style={addBtnStyle}
              className="hover:scale-105 active:scale-95"
              aria-label="Add to cart"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div style={{ ...stockStyle, color: stockColor }}>{stockLabel}</div>
      </div>
    </article>
  );
}
