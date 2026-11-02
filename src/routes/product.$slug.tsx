import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, useQuery, queryOptions } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  Minus,
  Plus,
  Star,
  Truck,
  ShieldCheck,
  ArrowLeft,
  Heart,
  Zap,
  ShoppingBag,
  Tag,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  MapPin,
  ThumbsUp,
  MessageSquare,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { getProduct, listProducts } from "@/lib/products.functions";
import { cart } from "@/lib/cart-store";
import { store, type Review } from "@/lib/flipkart-store";
import { toast } from "sonner";

const productQO = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => getProduct({ data: { slug } }),
  });

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ context, params }) => {
    const p = await context.queryClient.ensureQueryData(productQO(params.slug));
    if (!p) throw notFound();
  },
  head: ({ loaderData: _ld, params }) => ({
    meta: [
      { title: `${params.slug.replace(/-/g, " ")} — Basketo` },
      {
        name: "description",
        content: "Fresh, hand-picked groceries and essentials delivered to your door.",
      },
    ],
  }),
  component: ProductPage,
  notFoundComponent: () => (
    <div className="min-h-screen bg-bk-background">
      <Navbar />
      <div className="mx-auto max-w-xl px-6 py-32 text-center">
        <h1 className="font-display text-3xl font-bold text-bk-ink">Product not found</h1>
        <Link to="/shop" className="mt-4 inline-flex font-semibold text-bk-primary">
          ← Back to shop
        </Link>
      </div>
    </div>
  ),
});

interface RecentItem {
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
}

function ProductPage() {
  const { slug } = Route.useParams();
  const { data: product } = useSuspenseQuery(productQO(slug));
  const navigate = useNavigate();

  const [qty, setQty] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [pinCode, setPinCode] = useState("751019");
  const [pinVerified, setPinVerified] = useState(false);
  const [activeTab, setActiveTab] = useState<"specs" | "reviews">("specs");
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const [, setTick] = useState(0);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [headlineInput, setHeadlineInput] = useState("");
  const [commentInput, setCommentInput] = useState("");

  useEffect(() => {
    return store.subscribe(() => setTick((t) => t + 1));
  }, []);

  const user = store.currentUser;

  useEffect(() => {
    if (!product) return;
    try {
      const stored = localStorage.getItem("basketo_recently_viewed");
      let list: RecentItem[] = stored ? JSON.parse(stored) : [];
      list = list.filter((item) => item.id !== product.id);
      list.unshift({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        compare_at_price: product.compare_at_price,
        unit: product.unit,
        stock: product.stock,
        images: product.images,
        rating: product.rating,
        is_on_sale: product.is_on_sale,
      });
      list = list.slice(0, 6);
      localStorage.setItem("basketo_recently_viewed", JSON.stringify(list));
      setRecentItems(list.filter((item) => item.id !== product.id));
    } catch {
      // Ignore storage errors
    }
  }, [product]);

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ["related-products", product?.category_id],
    queryFn: () => listProducts({ data: { category: product?.category_id || undefined } }),
    enabled: !!product?.category_id,
  });

  if (!product) return null;
  const p = product;
  const images =
    p.images?.length > 0 ? p.images : ["https://placehold.co/600x600/png?text=Product"];
  const activeImg = images[activeImageIndex] || images[0];

  const off = product.compare_at_price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : 0;

  const isSavedInWishlist = store.isWishlisted(product.id);

  function handleAddToCart() {
    if (!user) {
      navigate({ to: "/auth", search: { redirect_to: `/product/${slug}` } });
      toast.info("Please sign in to add items to cart");
      return;
    }
    if (user.role === "admin") {
      toast.error("Administrators cannot purchase products.");
      navigate({ to: "/admin" });
      return;
    }
    cart.add(
      {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        image: activeImg,
        unit: p.unit,
      },
      qty,
    );
    toast.success(`Added ${qty} × ${p.name} to cart`);
  }

  function handleBuyNow() {
    if (!user) {
      navigate({ to: "/auth", search: { redirect_to: `/product/${slug}` } });
      toast.info("Please sign in to proceed with checkout");
      return;
    }
    if (user.role === "admin") {
      toast.error("Administrators cannot purchase products.");
      navigate({ to: "/admin" });
      return;
    }
    cart.add(
      {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: Number(p.price),
        image: activeImg,
        unit: p.unit,
      },
      qty,
    );
    toast.success("Proceeding to checkout");
    navigate({ to: "/cart" });
  }

  function handleToggleWishlist() {
    const added = store.toggleWishlist(product.id);
    if (added) {
      toast.success(`Saved ${product.name} to wishlist`);
    } else {
      toast.info(`Removed ${product.name} from wishlist`);
    }
  }

  function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!headlineInput.trim() || !commentInput.trim()) {
      toast.error("Please enter a headline and comment for your review");
      return;
    }
    store.addReview({
      productId: product.id,
      rating: ratingInput,
      headline: headlineInput.trim(),
      comment: commentInput.trim(),
    });
    toast.success("Thank you! Your verified review has been posted.");
    setHeadlineInput("");
    setCommentInput("");
    setShowReviewForm(false);
  }

  const productReviews: Review[] = [
    ...store.reviews.filter((r) => r.productId === product.id),
    {
      id: "seed-1",
      productId: product.id,
      userId: "u-101",
      userName: "Rahul Verma",
      rating: 5,
      headline: "Outstanding quality and super fresh!",
      comment:
        "Arrived in secure chilled packaging within 25 minutes. Genuine product, exactly as described. Highly recommended!",
      isVerifiedPurchase: true,
      createdAt: "2 days ago",
      helpfulCount: 14,
    },
    {
      id: "seed-2",
      productId: product.id,
      userId: "u-102",
      userName: "Pooja Hegde",
      rating: 4,
      headline: "Good value for money",
      comment:
        "Very competitive price compared to local supermarkets. Delivered right to the doorstep.",
      isVerifiedPurchase: true,
      createdAt: "5 days ago",
      helpfulCount: 7,
    },
  ];

  return (
    <div className="min-h-screen bg-bk-background">
      <Navbar />

      <main className="mx-auto bk-container py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-1 text-xs text-bk-muted sm:text-sm">
          <Link to="/" className="hover:text-bk-primary transition">
            Home
          </Link>
          <span className="mx-1 text-bk-muted/50">/</span>
          <Link to="/shop" className="hover:text-bk-primary transition">
            Shop
          </Link>
          {product.categories && (
            <>
              <span className="mx-1 text-bk-muted/50">/</span>
              <Link
                to="/shop"
                search={{ category: product.categories.slug }}
                className="capitalize hover:text-bk-primary transition"
              >
                {product.categories.name}
              </Link>
            </>
          )}
          <span className="mx-1 text-bk-muted/50">/</span>
          <span className="truncate max-w-[200px] font-medium text-bk-ink sm:max-w-none">
            {product.name}
          </span>
        </nav>

        {/* Product Hero Section */}
        <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Images Section (Left, 5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 space-y-4">
              {/* Main Image Stage */}
              <div className="group relative aspect-square overflow-hidden rounded-2xl border border-bk-border bg-bk-surface p-2 shadow-sm">
                <motion.img
                  key={activeImg}
                  initial={{ opacity: 0.6, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  src={activeImg}
                  alt={product.name}
                  className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105"
                />

                {off > 0 && (
                  <span className="absolute left-3 top-3 z-20 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-rose-500 px-2.5 py-0.5 text-[10px] font-black text-white shadow-sm uppercase tracking-tighter">
                    {off}% OFF
                  </span>
                )}

                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-bk-primary/90 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-xs">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Basketo Assured</span>
                </div>

                <button
                  onClick={handleToggleWishlist}
                  className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full bg-white/95 backdrop-blur shadow-sm transition-all duration-200 hover:scale-110 active:scale-95"
                  aria-label="Save to Wishlist"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isSavedInWishlist ? "fill-rose-500 text-rose-500" : "text-slate-600"
                    }`}
                  />
                </button>
              </div>

              {/* Multi-Image Thumbnails */}
              {images.length > 1 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-bk-surface p-1 transition-all duration-200 ${
                        activeImageIndex === i
                          ? "border-bk-primary shadow-sm scale-105 ring-2 ring-bk-primary/20"
                          : "border-bk-border/70 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-contain" />
                    </button>
                  ))}
                </div>
              )}

              {/* Desktop Action Buttons */}
              <div className="hidden grid-cols-2 gap-3 pt-2 sm:grid">
                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 rounded-xl border-2 border-bk-primary bg-bk-primary/5 py-3 font-bold text-bk-primary transition hover:bg-bk-primary/10 active:scale-[0.99]"
                >
                  <ShoppingBag className="h-5 w-5" /> Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 font-bold text-white shadow-md transition hover:brightness-105 active:scale-[0.99]"
                >
                  <Zap className="h-5 w-5 fill-white" /> Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* Product Details Section (Right, 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Title & Brand */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-bk-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{product.categories?.name || "Premium Selection"}</span>
              </div>
              <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-bk-ink sm:text-3xl md:text-4xl">
                {product.name}
              </h1>
              <p className="mt-1 text-sm text-bk-muted">{product.unit}</p>
            </div>

            {/* Ratings & Reviews summary pill */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 rounded-lg bg-bk-primary px-2.5 py-1 text-xs font-bold text-white">
                <span>{product.rating}</span>
                <Star className="h-3.5 w-3.5 fill-white" />
              </div>
              <span className="text-sm font-medium text-bk-muted">
                {(product.sold_count * 3).toLocaleString("en-IN")} Ratings &amp;{" "}
                {productReviews.length} Reviews
              </span>
              <span className="text-xs text-bk-muted">•</span>
              <span className="text-xs font-semibold text-bk-success">
                {product.sold_count} verified buyers this month
              </span>
            </div>

            {/* Pricing Section */}
            <div className="bk-card rounded-2xl p-5">
              <div className="flex items-baseline gap-3">
                <span className="font-display font-extrabold text-bk-ink text-3xl">
                  ₹{Math.round(product.price).toLocaleString("en-IN")}
                </span>
                {product.compare_at_price && (
                  <>
                    <span className="text-lg text-bk-muted line-through">
                      ₹{Math.round(product.compare_at_price).toLocaleString("en-IN")}
                    </span>
                    <span className="font-bold text-bk-success">{off}% off</span>
                  </>
                )}
              </div>
              <div className="mt-1 text-xs text-bk-muted">
                Inclusive of all taxes. Free delivery on orders over ₹499.
              </div>

              <div className="mt-4 space-y-2 border-t border-bk-border/60 pt-4">
                <div className="text-xs font-bold uppercase tracking-wider text-bk-ink">
                  Available Offers
                </div>
                <div className="flex items-start gap-2 text-xs text-bk-muted">
                  <Tag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bk-success" />
                  <span>
                    <strong className="text-bk-ink">Bank Offer:</strong> 5% Unlimited Cashback
                    on Axis Bank Card
                  </span>
                </div>
                <div className="flex items-start gap-2 text-xs text-bk-muted">
                  <Tag className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bk-success" />
                  <span>
                    <strong className="text-bk-ink">Special Offer:</strong> Flat ₹50 off with code{" "}
                    <code className="rounded bg-bk-border px-1 py-0.5 font-bold text-bk-ink">
                      FLIPKART50
                    </code>
                  </span>
                </div>
              </div>
            </div>

            {/* Stock Availability & Delivery Check */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="bk-card rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-bk-muted">
                  <CheckCircle2 className="h-4 w-4 text-bk-success" />
                  <span>Availability Status</span>
                </div>
                <div className="mt-2 text-base font-bold text-bk-success">
                  {product.stock > 10 ? (
                    "In Stock (Ready to Ship)"
                  ) : product.stock > 0 ? (
                    `Hurry! Only ${product.stock} units left`
                  ) : (
                    <span className="text-bk-error">Temporarily Out of Stock</span>
                  )}
                </div>
                <p className="mt-1 text-xs text-bk-muted">
                  Fulfilled by certified Basketo Darkstore Hub
                </p>
              </div>

              <div className="bk-card rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-bk-muted">
                  <MapPin className="h-4 w-4 text-bk-primary" />
                  <span>Delivery Check</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={pinCode}
                    onChange={(e) => {
                      setPinCode(e.target.value);
                      setPinVerified(false);
                    }}
                    placeholder="Enter PIN Code"
                    className="w-28 rounded-lg border border-bk-border bg-bk-surface px-2.5 py-1 text-xs font-semibold outline-none focus:ring-1 focus:ring-bk-primary"
                  />
                  <button
                    onClick={() => {
                      if (pinCode.length >= 6) {
                        setPinVerified(true);
                        toast.success(`Express delivery confirmed for PIN ${pinCode}!`);
                      } else {
                        toast.error("Please enter a valid 6-digit PIN code");
                      }
                    }}
                    className="rounded-lg bg-bk-surface-alt px-2.5 py-1 text-xs font-bold text-bk-ink hover:bg-bk-border"
                  >
                    Check
                  </button>
                </div>
                {pinVerified && (
                  <p className="mt-1.5 text-xs text-bk-success font-medium">
                    ⚡ Delivery by Tomorrow, 9 PM | Free on orders over ₹499
                  </p>
                )}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 rounded-xl border border-bk-border bg-bk-surface p-4">
              <span className="text-sm font-semibold text-bk-ink">Quantity:</span>
              <div className="flex items-center gap-1 rounded-xl border border-bk-border bg-bk-surface-alt p-0.5">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="grid h-8 w-8 place-items-center rounded-lg hover:bg-bk-border"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-bold">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="grid h-8 w-8 place-items-center rounded-lg hover:bg-bk-border"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="text-xs text-bk-muted">
                Total: <strong>₹{Math.round(product.price * qty).toLocaleString("en-IN")}</strong>
              </span>
            </div>

            {/* Mobile Action Buttons */}
            <div className="grid grid-cols-2 gap-3 sm:hidden">
              <button
                onClick={handleAddToCart}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-bk-primary bg-bk-primary/5 py-3 font-bold text-bk-primary"
              >
                <ShoppingBag className="h-4 w-4" /> Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 font-bold text-white shadow-md"
              >
                <Zap className="h-4 w-4 fill-white" /> Buy Now
              </button>
            </div>

            {/* Highlights Bar */}
            <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
              <div className="rounded-xl bg-bk-surface-alt p-3">
                <Truck className="mx-auto h-5 w-5 text-bk-primary" />
                <span className="mt-1 block font-bold text-bk-ink">Fast Dispatch</span>
                <span className="text-bk-muted">Within 15 mins</span>
              </div>
              <div className="rounded-xl bg-bk-surface-alt p-3">
                <RotateCcw className="mx-auto h-5 w-5 text-bk-primary" />
                <span className="mt-1 block font-bold text-bk-ink">7 Days Return</span>
                <span className="text-bk-muted">Hassle-free refund</span>
              </div>
              <div className="rounded-xl bg-bk-surface-alt p-3">
                <ShieldCheck className="mx-auto h-5 w-5 text-bk-primary" />
                <span className="mt-1 block font-bold text-bk-ink">100% Authentic</span>
                <span className="text-bk-muted">Direct from source</span>
              </div>
            </div>

            {/* Tabs: Specifications & Customer Reviews */}
            <div className="border-t border-bk-border/80 pt-6">
              <div className="flex border-b border-bk-border">
                <button
                  onClick={() => setActiveTab("specs")}
                  className={`border-b-2 px-6 py-3 text-sm font-bold transition-colors ${
                    activeTab === "specs"
                      ? "border-bk-primary text-bk-primary"
                      : "border-transparent text-bk-muted hover:text-bk-primary"
                  }`}
                >
                  Specifications &amp; Details
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`border-b-2 px-6 py-3 text-sm font-bold transition-colors ${
                    activeTab === "reviews"
                      ? "border-bk-primary text-bk-primary"
                      : "border-transparent text-bk-muted hover:text-bk-primary"
                  }`}
                >
                  Customer Reviews ({productReviews.length})
                </button>
              </div>

              {activeTab === "specs" ? (
                <div className="space-y-6 pt-6">
                  <div>
                    <h3 className="text-sm font-bold text-bk-ink">Description</h3>
                    <p className="mt-2 text-sm leading-relaxed text-bk-muted">
                      {product.description}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-bk-ink">General Specifications</h3>
                    <div className="mt-3 overflow-hidden rounded-xl border border-bk-border text-xs sm:text-sm">
                      <div className="grid grid-cols-3 border-b border-bk-border bg-bk-surface-alt p-3">
                        <span className="font-semibold text-bk-muted">Brand / Type</span>
                        <span className="col-span-2 font-medium text-bk-ink">
                          {product.unit}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 border-b border-bk-border p-3">
                        <span className="font-semibold text-bk-muted">Category</span>
                        <span className="col-span-2 capitalize font-medium text-bk-ink">
                          {product.categories?.name || "General Goods"}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 border-b border-bk-border bg-bk-surface-alt p-3">
                        <span className="font-semibold text-bk-muted">
                          Model Number / SKU
                        </span>
                        <span className="col-span-2 font-mono font-medium text-bk-ink">
                          BSK-{product.id}-IN
                        </span>
                      </div>
                      <div className="grid grid-cols-3 border-b border-bk-border p-3">
                        <span className="font-semibold text-bk-muted">
                          Country of Origin
                        </span>
                        <span className="col-span-2 font-medium text-bk-ink">India</span>
                      </div>
                      <div className="grid grid-cols-3 border-b border-bk-border bg-bk-surface-alt p-3">
                        <span className="font-semibold text-bk-muted">Return Policy</span>
                        <span className="col-span-2 font-medium text-bk-ink">
                          7 Days Replacement &amp; Full Refund Guarantee
                        </span>
                      </div>
                      <div className="grid grid-cols-3 p-3">
                        <span className="font-semibold text-bk-muted">
                          Storage Instructions
                        </span>
                        <span className="col-span-2 font-medium text-bk-ink">
                          Store in a cool, dry place away from direct sunlight.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6 pt-6">
                  <div className="flex flex-col gap-6 rounded-xl border border-bk-border bg-bk-surface p-6 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-center sm:text-left">
                      <div className="flex items-center justify-center gap-2 sm:justify-start">
                        <span className="font-display text-4xl font-extrabold text-bk-ink">
                          {product.rating}
                        </span>
                        <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                      </div>
                      <p className="mt-1 text-xs text-bk-muted">
                        Based on {productReviews.length} verified ratings
                      </p>
                    </div>

                    <div className="flex-1 max-w-xs space-y-1.5">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const pct = stars === 5 ? 78 : stars === 4 ? 16 : stars === 3 ? 4 : 2;
                        return (
                          <div key={stars} className="flex items-center gap-2 text-xs">
                            <span className="w-4 text-bk-muted font-semibold">
                              {stars}★
                            </span>
                            <div className="h-2 flex-1 rounded-full bg-bk-border overflow-hidden">
                              <div
                                className="h-full rounded-full bg-bk-primary"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-8 text-right text-bk-muted">{pct}%</span>
                          </div>
                        );
                      })}
                    </div>

                    <div>
                      <button
                        onClick={() => setShowReviewForm(!showReviewForm)}
                        className="rounded-xl border-2 border-bk-primary bg-bk-primary/5 px-4 py-2.5 text-xs font-bold text-bk-primary transition hover:bg-bk-primary/10"
                      >
                        Rate Product
                      </button>
                    </div>
                  </div>

                  {showReviewForm && (
                    <motion.form
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      onSubmit={handleSubmitReview}
                      className="rounded-xl border border-bk-border bg-bk-surface p-6 space-y-4 shadow-sm"
                    >
                      <h4 className="font-bold text-bk-ink">Write a Verified Review</h4>
                      <div>
                        <label className="block mb-1 text-xs font-semibold text-bk-muted uppercase tracking-wider">
                          Your Rating
                        </label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((num) => (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setRatingInput(num)}
                              className="p-1 hover:scale-110 transition"
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  num <= ratingInput
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-bk-muted/40"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block mb-1 text-xs font-semibold text-bk-muted uppercase tracking-wider">
                          Review Title / Headline
                        </label>
                        <input
                          type="text"
                          required
                          value={headlineInput}
                          onChange={(e) => setHeadlineInput(e.target.value)}
                          placeholder="e.g., Must buy! Outstanding freshness"
                          className="bk-input"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-xs font-semibold text-bk-muted uppercase tracking-wider">
                          Detailed Feedback
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          placeholder="Share your experience with product quality, packaging, and delivery..."
                          className="bk-input"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setShowReviewForm(false)}
                          className="rounded-xl px-4 py-2 text-xs font-semibold text-bk-muted hover:bg-bk-border"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bk-btn bk-btn-primary px-5 py-2"
                        >
                          Submit Review
                        </button>
                      </div>
                    </motion.form>
                  )}

                  <div className="space-y-4">
                    {productReviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="rounded-xl border border-bk-border/60 bg-bk-surface p-5 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 rounded bg-bk-primary px-2 py-0.5 text-xs font-bold text-white">
                              <span>{rev.rating}</span>
                              <Star className="h-3 w-3 fill-white" />
                            </div>
                            <span className="font-bold text-sm text-bk-ink">
                              {rev.headline}
                            </span>
                          </div>
                          <span className="text-xs text-bk-muted">
                            {rev.createdAt.includes("T")
                              ? new Date(rev.createdAt).toLocaleDateString("en-IN")
                              : rev.createdAt}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm text-bk-muted leading-relaxed">
                          {rev.comment}
                        </p>

                        <div className="flex items-center justify-between pt-2 text-xs text-bk-muted border-t border-bk-border/40">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-bk-ink">{rev.userName}</span>
                            {rev.isVerifiedPurchase && (
                              <span className="flex items-center gap-0.5 text-bk-success font-medium">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Certified Buyer
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => toast.success("Marked review as helpful")}
                            className="flex items-center gap-1 hover:text-bk-primary"
                          >
                            <ThumbsUp className="h-3 w-3" />
                            <span>Helpful ({rev.helpfulCount})</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recently Viewed Products Strip */}
        {recentItems.length > 0 && (
          <section className="mt-16 border-t border-bk-border/80 pt-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-bk-ink">
                  Recently Viewed
                </h2>
                <p className="text-xs text-bk-muted mt-0.5">
                  Items you checked out recently
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {recentItems.map((item, idx) => (
                <ProductCard key={item.id} product={item as Product} index={idx} />
              ))}
            </div>
          </section>
        )}

        {/* Related Products Section */}
        {relatedProducts.length > 1 && (
          <section className="mt-16 border-t border-bk-border/80 pt-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-bk-ink">
                  Similar &amp; Related Products
                </h2>
                <p className="text-xs text-bk-muted mt-0.5">
                  Explore recommendations in{" "}
                  <span className="capitalize font-semibold text-bk-ink">
                    {product.categories?.name || "this category"}
                  </span>
                </p>
              </div>
              <Link
                to="/shop"
                search={{ category: product.category_id || undefined }}
                className="text-xs font-bold text-bk-primary hover:underline"
              >
                View all in {product.categories?.name} →
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 md:grid-cols-4">
              {relatedProducts
                .filter((p) => p.id !== product.id)
                .slice(0, 4)
                .map((relProduct, idx) => (
                  <ProductCard key={relProduct.id} product={relProduct as Product} index={idx} />
                ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
