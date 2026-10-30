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

  const currentStore = useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store,
  );

  const user = currentStore.currentUser;
  const addresses = currentStore.addresses;
  const coupons = currentStore.coupons;

  // Checkout step state
  const [step, setStep] = useState<1 | 2>(1); // 1: Cart review, 2: Checkout
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || "",
  );
  const [couponCode, setCouponCode] = useState<string>("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  const [placing, setPlacing] = useState(false);

  // Delivery fee logic
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

    if (!selectedAddress) {
      toast.error("Please add or select a delivery address");
      return;
    }

    setPlacing(true);

    // Simulate payment processing
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
      toast.success("Order Placed Successfully! 🎉 Directing to live tracking...");
      navigate({
        to: "/account",
        search: { tab: "tracking", orderId: newOrder.id },
      });
    }, 700);
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Step Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {step === 1 ? "Shopping Cart" : "Secure Checkout"}
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              {count} item{count !== 1 ? "s" : ""} • Delivery in 15 minutes by Shiprocket Express
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span
              className={`rounded-full px-3 py-1 ${step === 1 ? "bg-primary text-primary-foreground font-bold" : "bg-muted text-muted-foreground"}`}
            >
              1. Cart
            </span>
            <span className="text-muted-foreground">→</span>
            <span
              className={`rounded-full px-3 py-1 ${step === 2 ? "bg-primary text-primary-foreground font-bold" : "bg-muted text-muted-foreground"}`}
            >
              2. Delivery & Payment
            </span>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-border bg-card p-16 text-center shadow-xs">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
              <ShoppingBag className="h-10 w-10" />
            </div>
            <h2 className="mt-4 font-display text-xl font-bold">Your cart is empty</h2>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Explore freshly harvested fruits, vegetables and dairy products.
            </p>
            <Link
              to="/shop"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3 text-sm font-bold text-primary-foreground shadow-sm hover:scale-105 transition"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            {/* Left Content Area: Cart or Checkout Steps */}
            <div>
              {step === 1 ? (
                /* STEP 1: CART ITEMS LIST */
                <div className="space-y-4">
                  <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs divide-y divide-border/60">
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
                          <div className="flex items-center gap-3.5">
                            <Link to="/product/$slug" params={{ slug: item.slug }}>
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-20 w-20 rounded-2xl border border-border bg-muted object-cover"
                              />
                            </Link>
                            <div>
                              <Link
                                to="/product/$slug"
                                params={{ slug: item.slug }}
                                className="font-semibold text-foreground hover:text-primary transition line-clamp-1"
                              >
                                {item.name}
                              </Link>
                              <div className="text-xs text-muted-foreground">{item.unit}</div>
                              <div className="mt-1 font-display text-sm font-bold text-foreground">
                                ₹{Math.round(item.price).toLocaleString("en-IN")}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center rounded-full border border-border bg-muted/40 p-1">
                              <button
                                onClick={() => cart.setQty(item.id, item.quantity - 1)}
                                className="grid h-7 w-7 place-items-center rounded-full hover:bg-card active:scale-95 text-foreground"
                              >
                                <Minus className="h-3.5 w-3.5" />
                              </button>
                              <span className="w-8 text-center text-xs font-bold text-foreground">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => cart.setQty(item.id, item.quantity + 1)}
                                className="grid h-7 w-7 place-items-center rounded-full hover:bg-card active:scale-95 text-foreground"
                              >
                                <Plus className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            <button
                              onClick={() => cart.remove(item.id)}
                              className="rounded-full p-2 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 transition"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center justify-between rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Truck className="h-4 w-4 text-emerald-600" />
                      <span>
                        {isFreeDelivery
                          ? "🎉 You've unlocked FREE 15-min delivery!"
                          : "Add ₹" + (499 - subtotal) + " more for FREE delivery"}
                      </span>
                    </div>
                    <Link to="/shop" className="text-xs font-bold text-primary hover:underline">
                      + Add more items
                    </Link>
                  </div>
                </div>
              ) : (
                /* STEP 2: ADDRESS & PAYMENT SELECTION */
                <div className="space-y-6">
                  {/* Select Delivery Address */}
                  <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-600" />
                        <h3 className="font-display text-base font-bold">1. Delivery Address</h3>
                      </div>
                      <Link
                        to="/account"
                        search={{ tab: "addresses" }}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        + Add / Edit Addresses
                      </Link>
                    </div>

                    <div className="mt-4 space-y-3">
                      {addresses.map((a) => (
                        <label
                          key={a.id}
                          className={`flex items-start gap-3 rounded-2xl border p-4 cursor-pointer transition ${
                            selectedAddressId === a.id
                              ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20"
                              : "border-border/80 bg-card hover:bg-muted/40"
                          }`}
                        >
                          <input
                            type="radio"
                            name="deliveryAddress"
                            checked={selectedAddressId === a.id}
                            onChange={() => setSelectedAddressId(a.id)}
                            className="mt-1 accent-emerald-600"
                          />
                          <div className="flex-1 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-foreground">{a.name}</span>
                              <span className="rounded-full bg-muted px-2 py-0.2 text-[10px] font-bold uppercase">
                                {a.type}
                              </span>
                              {a.isDefault && (
                                <span className="text-[10px] text-emerald-600 font-bold">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="mt-1 text-muted-foreground leading-relaxed">
                              {a.houseNo}, {a.street}, {a.city}, {a.state} -{" "}
                              <strong>{a.pinCode}</strong>
                            </p>
                            <div className="mt-1 text-[11px] text-muted-foreground">
                              Mobile: {a.phone}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Payment Method Selection */}
                  <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
                    <div className="flex items-center gap-2 mb-4">
                      <CreditCard className="h-4 w-4 text-emerald-600" />
                      <h3 className="font-display text-base font-bold">2. Payment Method</h3>
                    </div>

                    <div className="space-y-3">
                      <label
                        className={`flex items-center justify-between rounded-2xl border p-4 cursor-pointer transition ${
                          paymentMethod === "razorpay"
                            ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20"
                            : "border-border/80 bg-card hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentOption"
                            checked={paymentMethod === "razorpay"}
                            onChange={() => setPaymentMethod("razorpay")}
                            className="accent-emerald-600"
                          />
                          <div>
                            <div className="font-bold text-xs text-foreground">
                              Razorpay Online Payment (UPI, Cards, NetBanking)
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              Instant verification & faster order dispatch
                            </div>
                          </div>
                        </div>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                          Recommended
                        </span>
                      </label>

                      <label
                        className={`flex items-center justify-between rounded-2xl border p-4 cursor-pointer transition ${
                          paymentMethod === "cod"
                            ? "border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/20"
                            : "border-border/80 bg-card hover:bg-muted/40"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="paymentOption"
                            checked={paymentMethod === "cod"}
                            onChange={() => setPaymentMethod("cod")}
                            className="accent-emerald-600"
                          />
                          <div>
                            <div className="font-bold text-xs text-foreground">
                              Cash on Delivery (COD)
                            </div>
                            <div className="text-[11px] text-muted-foreground">
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
              <div className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <Tag className="h-4 w-4 text-amber-500" />
                  <span>Apply Flipkart Coupons</span>
                </div>

                {appliedCoupon ? (
                  <div className="mt-3 flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 text-xs">
                    <div>
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">
                        {appliedCoupon} applied
                      </span>
                      <div className="text-[11px] text-muted-foreground">
                        You saved ₹{discountAmount}
                      </div>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="font-bold text-rose-600 hover:underline"
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
                      className="h-9 flex-1 rounded-xl border border-border bg-muted/40 px-3 text-xs uppercase outline-none focus:border-primary"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => applyCoupon()}
                      className="rounded-xl bg-primary text-primary-foreground font-bold text-xs px-3"
                    >
                      Apply
                    </Button>
                  </div>
                )}

                {/* Available Coupons list */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {coupons.map((c) => (
                    <button
                      key={c.code}
                      onClick={() => applyCoupon(c.code)}
                      className="rounded-full border border-dashed border-border bg-muted/30 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:border-primary hover:text-foreground"
                    >
                      {c.code}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-3">
                <h3 className="font-display text-sm font-bold border-b border-border/60 pb-3">
                  Price Details ({count} items)
                </h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total MRP / Subtotal</span>
                    <span className="font-semibold text-foreground">
                      ₹{Math.round(subtotal).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Coupon Discount</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">15-Min Delivery Fee</span>
                    <span className="font-semibold text-foreground">
                      {deliveryFee === 0 ? (
                        <span className="text-emerald-600">FREE</span>
                      ) : (
                        `₹${deliveryFee}`
                      )}
                    </span>
                  </div>

                  <div className="my-2 h-px bg-border/60" />

                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-foreground">Total Payable Amount</span>
                    <span className="font-display font-extrabold text-foreground text-lg">
                      ₹{Math.round(total).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  {step === 1 ? (
                    <Button
                      onClick={() => setStep(2)}
                      className="h-12 w-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 font-bold text-white shadow-md shadow-emerald-500/25 transition hover:scale-[1.02]"
                    >
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleConfirmOrder}
                      disabled={placing}
                      className="h-12 w-full rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 font-bold text-white shadow-md shadow-emerald-500/25 transition hover:scale-[1.02]"
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

                <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-muted-foreground text-center">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                  <span>100% Safe & Secure Payments</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
