import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  MapPin,
  Tag,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Truck,
  ArrowRight,
  Lock,
  ChevronRight,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { cart, useCart } from "@/lib/cart-store";
import { store, type Address, type OrderItem } from "@/lib/flipkart-store";
import { toast } from "sonner";
import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/cart")({
  head: () => ({ meta: [{ title: "My Shopping Cart & Checkout — Basketo" }] }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, count } = useCart();
  const navigate = useNavigate();

  useSyncExternalStore(
    (cb) => store.subscribe(cb),
    store.getSnapshotVersion,
    store.getSnapshotVersion,
  );

  const user = store.currentUser;
  const addresses = store.addresses;
  const coupons = store.coupons;

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || "",
  );
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [placing, setPlacing] = useState(false);

  const isFreeDelivery = subtotal >= 499 || appliedCoupon === "FREESHIP";
  const deliveryFee = subtotal === 0 ? 0 : isFreeDelivery ? 0 : 40;
  const total = Math.max(0, subtotal + deliveryFee - discountAmount);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId) || addresses[0];

  function applyCoupon(codeToApply?: string) {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    const coupon = coupons.find((c) => c.code === code);

    if (!coupon) {
      toast.error("Invalid coupon code");
      return;
    }

    if (subtotal < coupon.minOrder) {
      toast.error(`Minimum order amount of ₹${coupon.minOrder} required for ${coupon.code}`);
      return;
    }

    let discount = 0;
    if (coupon.discountType === "flat") {
      discount = coupon.discountValue;
    } else {
      discount = Math.min(
        coupon.maxDiscount || 500,
        Math.round((subtotal * coupon.discountValue) / 100),
      );
    }

    setDiscountAmount(discount);
    setAppliedCoupon(coupon.code);
    toast.success(`Coupon ${coupon.code} applied! Saved ₹${discount}`);
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
    toast.info("Coupon removed");
  }

  async function handleConfirmOrder() {
    if (!user) {
      toast.info("Please sign in to proceed with checkout");
      navigate({ to: "/auth", search: { redirect_to: "/cart" } });
      return;
    }

    if (user.role === "admin") {
      toast.error("Administrators cannot place orders.");
      navigate({ to: "/admin" });
      return;
    }

    if (!selectedAddress) {
      toast.error("Please add or select a delivery address");
      return;
    }

    setPlacing(true);

    setTimeout(() => {
      const orderItems: OrderItem[] = items.map((i) => ({
        id: `ord-item-${Date.now()}-${i.id}`,
        productId: i.id,
        name: i.name,
        slug: i.slug,
        price: i.price,
        quantity: i.quantity,
        image: i.image,
        unit: i.unit,
      }));

      const newOrder = store.createOrder({
        items: orderItems,
        subtotal,
        deliveryFee,
        discount: discountAmount,
        total,
        paymentMethod,
        shippingAddress: selectedAddress,
      });

      cart.clear();
      setPlacing(false);
      toast.success("Order Placed Successfully! Directing to live tracking...");
      navigate({
        to: "/account",
        search: { tab: "tracking", orderId: newOrder.id },
      });
    }, 700);
  }

  return (
    <div className="min-h-screen bg-bk-background">
      <Navbar />

      <main className="mx-auto bk-container pt-4 pb-28 sm:py-8">
        {/* Step Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-bk-ink sm:text-4xl">
              {step === 1 ? "Shopping Cart" : "Secure Checkout"}
            </h1>
            <p className="mt-1 text-xs text-bk-muted">
              {count} item{count !== 1 ? "s" : ""} • Express delivery by Basketo
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span
              className={`rounded-full px-3 py-1 ${
                step === 1
                  ? "bg-bk-primary text-white font-bold shadow-sm"
                  : "bg-bk-border text-bk-muted"
              }`}
            >
              1. Cart
            </span>
            <span className="text-bk-muted">→</span>
            <span
              className={`rounded-full px-3 py-1 ${
                step === 2
                  ? "bg-bk-primary text-white font-bold shadow-sm"
                  : "bg-bk-border text-bk-muted"
              }`}
            >
              2. Delivery & Payment
            </span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 bk-empty-state">
            <div className="bk-empty-state__icon">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <h2 className="bk-empty-state__title">Your cart is empty</h2>
            <p className="bk-empty-state__subtitle">
              Explore freshly harvested fruits, vegetables and dairy products.
            </p>
            <Link to="/shop" className="mt-6 bk-btn bk-btn-primary bk-btn-lg">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            {/* Left Content Area */}
            <div>
              {step === 1 ? (
                <div className="space-y-4">
                  <div className="bk-card rounded-2xl p-5 divide-y divide-bk-border/60">
                    <AnimatePresence initial={false}>
                      {items.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                        >
                          <div className="flex items-center gap-3">
                            <Link to="/product/$slug" params={{ slug: item.slug }}>
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-20 w-20 rounded-xl border border-bk-border bg-bk-surface-alt object-cover"
                              />
                            </Link>
                            <div>
                              <Link
                                to="/product/$slug"
                                params={{ slug: item.slug }}
                                className="font-semibold text-bk-ink hover:text-bk-primary transition line-clamp-1"
                              >
                                {item.name}
                              </Link>
                              <div className="text-xs text-bk-muted">{item.unit}</div>
                              <div className="mt-1 font-display text-sm font-bold text-bk-ink">
                                ₹{Math.round(item.price).toLocaleString("en-IN")}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center rounded-full border border-bk-border bg-bk-surface-alt p-1">
                              <button
                                onClick={() => cart.setQty(item.id, item.quantity - 1)}
                                className="grid h-7 w-7 place-items-center rounded-full hover:bg-bk-border active:scale-95 text-bk-ink"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-8 text-center text-xs font-bold text-bk-ink">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => cart.setQty(item.id, item.quantity + 1)}
                                className="grid h-7 w-7 place-items-center rounded-full hover:bg-bk-border active:scale-95 text-bk-ink"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <button
                              onClick={() => cart.remove(item.id)}
                              className="rounded-full p-2 text-bk-muted hover:bg-rose-50 hover:text-bk-error transition"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center justify-between rounded-xl border border-bk-border/80 bg-bk-surface p-4 shadow-sm">
                    <div className="flex items-center gap-2 text-xs text-bk-muted">
                      <Truck className="h-4 w-4 text-bk-success" />
                      <span>
                        {isFreeDelivery
                          ? "🎉 You've unlocked FREE express delivery!"
                          : `Add ₹${499 - subtotal} more for FREE delivery`}
                      </span>
                    </div>
                    <Link to="/shop" className="text-xs font-bold text-bk-primary hover:underline">
                      + Add more items
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Delivery Address */}
                  <div className="bk-card rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-bk-success" />
                        <h3 className="font-display text-base font-bold text-bk-ink">
                          1. Delivery Address
                        </h3>
                      </div>
                      <Link
                        to="/account"
                        search={{ tab: "addresses" }}
                        className="text-xs font-bold text-bk-primary hover:underline"
                      >
                        + Add / Edit Addresses
                      </Link>
                    </div>

                    <div className="mt-4 space-y-3">
                      {addresses.length === 0 && (
                        <div className="bk-empty-state p-8">
                          <MapPin className="mx-auto h-8 w-8 text-bk-muted/40" />
                          <p className="mt-2 text-xs font-bold text-bk-ink">
                            No delivery address yet
                          </p>
                          <p className="mt-1 text-[11px] text-bk-muted">
                            Add your first address to place an order.
                          </p>
                          <Link
                            to="/account"
                            search={{ tab: "addresses" }}
                            className="mt-3 inline-flex items-center rounded-full bg-bk-primary px-4 py-1.5 text-[11px] font-bold text-white shadow-sm hover:opacity-90"
                          >
                            + Add Address
                          </Link>
                        </div>
                      )}
                      {addresses.map((a) => (
                        <label
                          key={a.id}
                          className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition ${
                            selectedAddressId === a.id
                              ? "border-bk-primary bg-bk-primary/5 dark:bg-bk-primary/10"
                              : "border-bk-border/80 bg-bk-surface hover:bg-bk-surface-alt"
                          }`}
                        >
                          <input
                            type="radio"
                            name="deliveryAddress"
                            checked={selectedAddressId === a.id}
                            onChange={() => setSelectedAddressId(a.id)}
                            className="mt-1 accent-bk-primary"
                          />
                          <div className="flex-1 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-bk-ink">{a.name}</span>
                              <span className="rounded-full bg-bk-border px-2 py-0.5 text-[10px] font-bold uppercase">
                                {a.type}
                              </span>
                              {a.isDefault && (
                                <span className="text-[10px] text-bk-success font-bold">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-bk-muted leading-relaxed">
                              {a.houseNo}, {a.street}, {a.city}, {a.state} -{" "}
                              <strong>{a.pinCode}</strong>
                            </p>
                            <div className="mt-1 text-[11px] text-bk-muted">Mobile: {a.phone}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="bk-card rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="h-4 w-4 text-bk-success" />
                      <h3 className="font-display text-base font-bold text-bk-ink">
                        2. Payment Method
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <label
                        className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition ${
                          paymentMethod === "razorpay"
                            ? "border-bk-primary bg-bk-primary/5"
                            : "border-bk-border/80 bg-bk-surface hover:bg-bk-surface-alt"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentOption"
                            checked={paymentMethod === "razorpay"}
                            onChange={() => setPaymentMethod("razorpay")}
                            className="accent-bk-primary"
                          />
                          <div>
                            <div className="font-bold text-xs text-bk-ink">
                              Razorpay Online Payment (UPI, Cards, NetBanking)
                            </div>
                            <div className="text-[11px] text-bk-muted">
                              Instant verification & faster order dispatch
                            </div>
                          </div>
                        </div>
                        <span className="rounded-full bg-bk-primary/10 px-2 py-0.5 text-[10px] font-bold text-bk-success">
                          Recommended
                        </span>
                      </label>

                      <label
                        className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer transition ${
                          paymentMethod === "cod"
                            ? "border-bk-primary bg-bk-primary/5"
                            : "border-bk-border/80 bg-bk-surface hover:bg-bk-surface-alt"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentOption"
                            checked={paymentMethod === "cod"}
                            onChange={() => setPaymentMethod("cod")}
                            className="accent-bk-primary"
                          />
                          <div>
                            <div className="font-bold text-xs text-bk-ink">
                              Cash on Delivery (COD)
                            </div>
                            <div className="text-[11px] text-bk-muted">
                              Pay with cash or UPI at your doorstep
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Summary Sidebar */}
            <div className="space-y-4">
              {/* Coupons & Offers */}
              <div className="bk-card rounded-2xl p-5">
                <div className="flex items-center gap-2 text-xs font-bold text-bk-ink">
                  <Tag className="h-4 w-4 text-amber-500" />
                  <span>Apply Coupons</span>
                </div>

                {appliedCoupon ? (
                  <div className="mt-3 flex items-center justify-between rounded-xl border border-bk-primary/30 bg-bk-primary/5 p-3 text-xs">
                    <div>
                      <span className="font-bold text-bk-success">{appliedCoupon} applied</span>
                      <div className="text-[11px] text-bk-muted">You saved ₹{discountAmount}</div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="font-bold text-bk-error hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="mt-3 flex gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="e.g. FLIPKART50"
                      className="bk-input h-9 flex-1 text-xs uppercase"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => applyCoupon()}
                      className="rounded-xl bg-bk-primary text-white font-bold text-xs px-3"
                    >
                      Apply
                    </Button>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {coupons.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => applyCoupon(c.code)}
                      className="rounded-full border border-dashed border-bk-border bg-bk-surface-alt px-2.5 py-1 text-[11px] font-semibold text-bk-muted hover:border-bk-primary hover:text-bk-primary"
                    >
                      {c.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bk-card rounded-2xl p-6 space-y-3">
                <h3 className="font-display text-sm font-bold border-b border-bk-border/60 pb-3 text-bk-ink">
                  Price Details ({count} items)
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-bk-muted">Total MRP / Subtotal</span>
                    <span className="font-semibold text-bk-ink">
                      ₹{Math.round(subtotal).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-bk-success font-semibold">
                      <span>Coupon Discount</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-bk-muted">Express Delivery Fee</span>
                    <span className="font-semibold text-bk-ink">
                      {deliveryFee === 0 ? (
                        <span className="text-bk-success">FREE</span>
                      ) : (
                        `₹${deliveryFee}`
                      )}
                    </span>
                  </div>

                  <div className="my-2 h-px bg-bk-border/60" />

                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-bk-ink">Total Payable Amount</span>
                    <span className="font-display font-extrabold text-bk-ink text-lg">
                      ₹{Math.round(total).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  {step === 1 ? (
                    <Button
                      onClick={() => setStep(2)}
                      className="h-12 w-full rounded-full bg-gradient-to-r from-bk-primary to-emerald-500 font-bold text-white shadow-md shadow-bk-primary/25 transition hover:scale-[1.02]"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleConfirmOrder}
                      disabled={placing}
                      className="h-12 w-full rounded-full bg-gradient-to-r from-bk-primary to-emerald-500 font-bold text-white shadow-md shadow-bk-primary/25 transition hover:scale-[1.02]"
                    >
                      <Lock className="h-4 w-4 mr-1.5" />
                      <span>
                        {placing
                          ? "Authorizing Order..."
                          : `Pay ₹${Math.round(total).toLocaleString("en-IN")}`}
                      </span>
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-bk-muted text-center">
                  <ShieldCheck className="h-3.5 w-3.5 text-bk-success" />
                  <span>100% Safe & Secure Payments</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Sticky Checkout Bar (above mobile bottom nav) */}
      {items.length > 0 && (
        <div className="fixed bottom-16 sm:hidden left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-4 py-2.5 flex items-center justify-between gap-3 shadow-lg">
          <div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
              Total ({count} items)
            </div>
            <div className="font-display text-base font-black text-slate-900">
              ₹{Math.round(total).toLocaleString("en-IN")}
            </div>
          </div>

          <div>
            {step === 1 ? (
              <Button
                onClick={() => setStep(2)}
                className="h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-md active:scale-95 transition"
              >
                <span>Checkout</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleConfirmOrder}
                disabled={placing}
                className="h-10 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2 text-xs font-bold text-white shadow-md active:scale-95 transition"
              >
                <Lock className="h-3.5 w-3.5 mr-1" />
                <span>{placing ? "Authorizing..." : "Pay Now"}</span>
              </Button>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
