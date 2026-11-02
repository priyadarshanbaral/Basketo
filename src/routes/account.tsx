import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User as UserIcon,
  Package,
  MapPin,
  Heart,
  CreditCard,
  RotateCcw,
  Star,
  Bell,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  ChevronRight,
  Plus,
  Trash2,
  Pencil,
  AlertCircle,
  ExternalLink,
  ShoppingBag,
  LogOut,
  Sparkles,
  ArrowRight,
  Lock,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { store, type Order, type Address, type User } from "@/lib/flipkart-store";
import { cart } from "@/lib/cart-store";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/account")({
  head: () => ({ meta: [{ title: "My Account — Basketo" }] }),
  component: CustomerAccountPage,
});

type TabType =
  | "overview"
  | "orders"
  | "tracking"
  | "profile"
  | "addresses"
  | "wishlist"
  | "payments"
  | "returns"
  | "reviews"
  | "notifications";

function CustomerAccountPage() {
  const navigate = useNavigate();
  const search = Route.useSearch() as { tab?: TabType; orderId?: string };

  const [activeTab, setActiveTab] = useState<TabType>(search.tab || "overview");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(search.orderId || null);

  const currentStore = useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store,
    () => store,
  );

  const user = currentStore.currentUser;
  const orders = currentStore.orders;
  const addresses = currentStore.addresses;
  const wishlist = currentStore.wishlist;
  const notifications = currentStore.notifications;

  useEffect(() => {
    if (search.tab) setActiveTab(search.tab);
    if (search.orderId) {
      setSelectedOrderId(search.orderId);
      setActiveTab("tracking");
    }
  }, [search.tab, search.orderId]);

  const totalOrders = orders.length;
  const totalProductsPurchased = orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
    0,
  );
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;
  const pendingOrders = orders.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled" && o.status !== "returned",
  ).length;
  const cancelledOrders = orders.filter((o) => o.status === "cancelled").length;
  const totalSpent = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50/50 pb-16 md:pb-0">
        <Navbar />
        <main className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-10 shadow-sm">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 mb-4">
              <UserIcon className="h-8 w-8" />
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-900">
              Your Basketo Account
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              Sign in to view your orders, live track 15-minute shipments, manage delivery addresses and save items to your wishlist.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/auth"
                search={{ redirect_to: "/account" }}
                className="w-full sm:w-auto rounded-full bg-emerald-600 px-6 py-3 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-emerald-700 transition"
              >
                Sign In / Create Account
              </Link>
              <Link
                to="/shop"
                className="w-full sm:w-auto rounded-full border border-slate-200 bg-slate-50 px-6 py-3 text-xs sm:text-sm font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Explore Market
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bk-background">
      <Navbar />

      <main className="mx-auto bk-container pt-6 pb-28 md:py-8">
        {/* Top welcome banner */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-bk-border bg-bk-primary p-6 sm:p-8">
          <div className="flex items-center gap-3.5">
            <img
              src={
                user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
              }
              alt={user?.name || "Customer"}
              className="h-14 w-14 rounded-full border-2 border-white/60 object-cover shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold tracking-tight text-white sm:text-2xl">
                  Hello, {user?.name || "Customer"}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold text-white backdrop-blur-sm">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified
                </span>
              </div>
              <p className="text-xs text-white/90">
                {user?.email} • {user?.phone}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {user?.role === "admin" && (
              <button
                onClick={() => {
                  navigate({ to: "/admin" });
                }}
                className="bk-btn bk-btn-ghost border-white/30 text-white hover:bg-white/20"
              >
                <ShieldCheck className="h-3.5 w-3.5" /> Admin Panel
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Left Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <nav className="overflow-hidden rounded-xl border border-bk-border bg-bk-surface shadow-sm">
                {[
                  { id: "overview", label: "Dashboard Overview", icon: UserIcon },
                  { id: "orders", label: "My Orders", icon: Package, badge: totalOrders },
                  { id: "tracking", label: "Shipment Tracking", icon: Truck },
                  {
                    id: "addresses",
                    label: "Manage Addresses",
                    icon: MapPin,
                    badge: addresses.length,
                  },
                  { id: "wishlist", label: "My Wishlist", icon: Heart, badge: wishlist.length },
                  { id: "payments", label: "Payments & Cards", icon: CreditCard },
                  { id: "returns", label: "Returns & Refunds", icon: RotateCcw },
                  { id: "reviews", label: "My Reviews & Ratings", icon: Star },
                  {
                    id: "notifications",
                    label: "Notifications",
                    icon: Bell,
                    badge: notifications.filter((n) => !n.read).length,
                  },
                  { id: "profile", label: "Profile Information", icon: ShieldCheck },
                ].map(({ id, label, icon: Icon, badge }) => {
                  const isActive = activeTab === id;
                  return (
                    <button
                      key={id}
                      onClick={() => {
                        setActiveTab(id as TabType);
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-left text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-bk-primary text-white shadow-sm"
                          : "text-bk-muted hover:bg-bk-surface-alt hover:text-bk-primary hover:border-bk-primary/30"
                      } border-transparent ${isActive ? "" : "border-bk-border/60"}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-bk-muted"}`} />
                        <span>{label}</span>
                      </div>
                      {badge !== undefined && badge > 0 && (
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-bk-primary/20 text-[10px] font-bold text-bk-primary">
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                <div className="my-2 h-px bg-bk-border/60" />

                <button
                  onClick={() => {
                    store.setCurrentUser(null);
                    toast.info("Signed out");
                    navigate({ to: "/" });
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-bk-error transition hover:bg-rose-50 border-bk-border/60"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              </nav>

              <div className="bk-card rounded-xl p-4 mt-4">
                <div className="flex items-center gap-2 font-bold text-bk-ink">
                  <ShieldCheck className="h-4 w-4 text-bk-primary" />
                  <span className="text-sm">Basketo Buyer Protection</span>
                </div>
                <p className="mt-1.5 text-xs text-bk-muted">
                  100% Genuine Products • 15-Minute Doorstep Delivery • Hassle-Free Returns.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Dashboard Workspace */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {activeTab === "overview" && (
                <OverviewTab
                  key="overview"
                  orders={orders}
                  totalOrders={totalOrders}
                  totalProductsPurchased={totalProductsPurchased}
                  deliveredOrders={deliveredOrders}
                  pendingOrders={pendingOrders}
                  cancelledOrders={cancelledOrders}
                  totalSpent={totalSpent}
                  onTrackOrder={(id) => {
                    setSelectedOrderId(id);
                    setActiveTab("tracking");
                  }}
                  onViewOrders={() => setActiveTab("orders")}
                />
              )}

              {activeTab === "orders" && (
                <OrdersTab
                  key="orders"
                  orders={orders}
                  onTrackOrder={(id) => {
                    setSelectedOrderId(id);
                    setActiveTab("tracking");
                  }}
                  onRequestReturn={(id) => {
                    setSelectedOrderId(id);
                    setActiveTab("returns");
                  }}
                />
              )}

              {activeTab === "tracking" && (
                <ShipmentTrackingTab
                  key="tracking"
                  orders={orders}
                  selectedOrder={selectedOrder}
                  onSelectOrder={setSelectedOrderId}
                />
              )}

              {activeTab === "addresses" && <AddressesTab key="addresses" addresses={addresses} />}
              {activeTab === "wishlist" && <WishlistTab key="wishlist" wishlist={wishlist} />}
              {activeTab === "payments" && <PaymentsTab key="payments" orders={orders} />}
              {activeTab === "returns" && (
                <ReturnsTab key="returns" orders={orders} selectedOrderId={selectedOrderId} />
              )}
              {activeTab === "reviews" && <ReviewsTab key="reviews" orders={orders} />}
              {activeTab === "notifications" && (
                <NotificationsTab key="notifications" notifications={notifications} />
              )}
              {activeTab === "profile" && <ProfileTab key="profile" user={user} />}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function OverviewTab({
  orders,
  totalOrders,
  totalProductsPurchased,
  deliveredOrders,
  pendingOrders,
  cancelledOrders,
  totalSpent,
  onTrackOrder,
  onViewOrders,
}: {
  orders: Order[];
  totalOrders: number;
  totalProductsPurchased: number;
  deliveredOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  onTrackOrder: (id: string) => void;
  onViewOrders: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {[
          {
            label: "Total Orders",
            value: totalOrders,
            icon: Package,
            color: "text-bk-primary",
            bg: "bg-bk-primary/10",
          },
          {
            label: "Products Bought",
            value: totalProductsPurchased,
            icon: ShoppingBag,
            color: "text-bk-error",
            bg: "bg-bk-error/10",
          },
          {
            label: "Delivered",
            value: deliveredOrders,
            icon: CheckCircle2,
            color: "text-bk-success",
            bg: "bg-bk-success/10",
          },
          {
            label: "In Transit",
            value: pendingOrders,
            icon: Clock,
            color: "text-bk-secondary",
            bg: "bg-bk-secondary/10",
          },
          {
            label: "Cancelled",
            value: cancelledOrders,
            icon: AlertCircle,
            color: "text-bk-error",
            bg: "bg-bk-error/10",
          },
          {
            label: "Total Spent",
            value: `₹${Math.round(totalSpent).toLocaleString("en-IN")}`,
            icon: CreditCard,
            color: "text-bk-primary",
            bg: "bg-bk-primary/10",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bk-card p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-bk-muted uppercase tracking-wider">
                  {stat.label}
                </span>
                <div className={`grid h-8 w-8 place-items-center rounded-lg ${stat.bg} ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 font-display text-2xl font-black text-bk-ink">
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {orders.length === 0 && (
        <div className="bk-card p-10 text-center">
          <ShoppingBag className="mx-auto h-12 w-12 text-bk-primary/30" />
          <h2 className="mt-4 font-display text-xl font-bold text-bk-ink">
            Your dashboard is ready — start shopping!
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-bk-muted">
            You haven't placed any orders yet. Your orders, total spending, and live shipment
            tracking will appear here automatically once you make your first purchase.
          </p>
          <Link to="/shop" className="mt-5 bk-btn bk-btn-primary inline-flex">
            Browse Shop & Place First Order <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {orders.length > 0 &&
        orders[0].status !== "delivered" &&
        orders[0].status !== "cancelled" && (
          <div className="bk-card rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-bk-primary/10 px-2.5 py-0.5 text-xs font-bold text-bk-primary">
                  <Truck className="h-3.5 w-3.5" /> Active Delivery
                </span>
                <h3 className="font-display text-lg font-bold text-bk-ink">
                  Order #{orders[0].id} is {orders[0].status.replace("_", " ").toUpperCase()}
                </h3>
                <p className="text-xs text-bk-muted">
                  Current Location:{" "}
                  <span className="font-semibold text-bk-ink">
                    {orders[0].shipment.currentLocation}
                  </span>{" "}
                  • Expected:{" "}
                  <span className="font-semibold text-bk-ink">
                    {orders[0].shipment.estimatedDeliveryDate}
                  </span>
                </p>
              </div>
              <button
                onClick={() => onTrackOrder(orders[0].id)}
                className="bk-btn bk-btn-primary"
              >
                Live Visual Tracking <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

      <div className="bk-card rounded-2xl p-6">
        <div className="flex items-center justify-between border-b border-bk-border/60 pb-4 mb-4">
          <div>
            <h2 className="font-display text-lg font-bold text-bk-ink">Recent Purchases</h2>
            <p className="text-xs text-bk-muted">
              Recent transactions and orders placed on Basketo
            </p>
          </div>
          <button onClick={onViewOrders} className="text-xs font-bold text-bk-primary hover:underline">
            View all orders ({orders.length}) →
          </button>
        </div>

        <div className="mt-4 divide-y divide-bk-border/60">
          {orders.slice(0, 3).map((order) => (
            <div key={order.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-3">
                <img
                  src={
                    order.items[0]?.image ||
                    "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200"
                  }
                  alt={order.items[0]?.name}
                  className="h-16 w-16 rounded-xl border border-bk-border object-cover"
                />
                <div>
                  <div className="font-semibold text-bk-ink">{order.items[0]?.name}</div>
                  <div className="text-xs text-bk-muted">
                    Order #{order.id} • {order.items.length} item{order.items.length > 1 ? "s" : ""}
                  </div>
                  <div className="mt-1 text-xs text-bk-muted">
                    Ordered on{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <div className="font-display text-base font-bold text-bk-ink">
                    ₹{Math.round(order.total).toLocaleString("en-IN")}
                  </div>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      order.status === "delivered"
                        ? "bg-bk-success/10 text-bk-success"
                        : order.status === "cancelled"
                          ? "bg-bk-error/10 text-bk-error"
                          : "bg-bk-secondary/10 text-bk-secondary"
                    }`}
                  >
                    {order.status.replace("_", " ")}
                  </span>
                </div>
                <button
                  onClick={() => onTrackOrder(order.id)}
                  className="rounded-full border border-bk-border bg-bk-surface px-3.5 py-1.5 text-xs font-semibold hover:bg-bk-surface-alt"
                >
                  Track
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function OrdersTab({
  orders,
  onTrackOrder,
  onRequestReturn,
}: {
  orders: Order[];
  onTrackOrder: (id: string) => void;
  onRequestReturn: (id: string) => void;
}) {
  const [filter, setFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = orders.filter((o) => {
    const matchesFilter =
      filter === "all" ||
      (filter === "pending" && o.status === "pending") ||
      (filter === "confirmed" && o.status === "confirmed") ||
      (filter === "processing" && (o.status === "processing" || o.status === "packed")) ||
      (filter === "shipped" && (o.status === "shipped" || o.status === "in_transit")) ||
      (filter === "out_for_delivery" && o.status === "out_for_delivery") ||
      (filter === "delivered" && o.status === "delivered") ||
      (filter === "cancelled" && o.status === "cancelled") ||
      (filter === "returned" && o.status === "returned");

    const matchesSearch =
      !searchQuery ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.items.some((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="bk-card rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-bk-ink">
              My Orders ({orders.length})
            </h2>
            <p className="text-xs text-bk-muted">
              View order invoices, live delivery checkpoints, and return eligibility
            </p>
          </div>

          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by order ID or product..."
            className="bk-input h-9 w-64 text-xs"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          { id: "all", label: "All Orders" },
          { id: "pending", label: "Pending" },
          { id: "confirmed", label: "Confirmed" },
          { id: "processing", label: "Processing" },
          { id: "shipped", label: "Shipped" },
          { id: "out_for_delivery", label: "Out for Delivery" },
          { id: "delivered", label: "Delivered" },
          { id: "cancelled", label: "Cancelled" },
          { id: "returned", label: "Returned" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 ${
              filter === f.id
                ? "border-bk-primary bg-bk-primary text-white shadow-sm"
                : "border-bk-border bg-bk-surface text-bk-muted hover:border-bk-primary hover:text-bk-primary"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bk-card p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-bk-muted/40" />
            <h3 className="mt-3 font-display text-base font-bold text-bk-ink">
              No orders found
            </h3>
            <p className="text-xs text-bk-muted">
              Try selecting another filter or browse our market
            </p>
            <Link
              to="/shop"
              className="mt-4 bk-btn bk-btn-primary inline-flex"
            >
              Browse Shop
            </Link>
          </div>
        ) : (
          filtered.map((order) => (
            <div
              key={order.id}
              className="bk-card rounded-2xl shadow-sm transition hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-bk-border/60 bg-bk-surface-alt/50 px-6 py-4">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div>
                    <span className="text-bk-muted">Order ID: </span>
                    <span className="font-mono font-bold text-bk-ink">{order.id}</span>
                  </div>
                  <div>
                    <span className="text-bk-muted">Order Date: </span>
                    <span className="font-semibold text-bk-ink">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-bk-muted">Payment: </span>
                    <span className="font-semibold uppercase text-bk-ink">
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                    order.status === "delivered"
                      ? "bg-bk-success/10 text-bk-success"
                      : order.status === "cancelled"
                        ? "bg-bk-error/10 text-bk-error"
                        : "bg-bk-secondary/10 text-bk-secondary"
                  }`}
                >
                  {order.status.replace("_", " ")}
                </span>
              </div>

              <div className="divide-y divide-bk-border/60 p-6">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl border border-bk-border object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-bk-ink">{item.name}</h4>
                        <p className="text-xs text-bk-muted">
                          Qty: {item.quantity} × ₹{Math.round(item.price)} • {item.unit || "unit"}
                        </p>
                      </div>
                    </div>
                    <div className="font-display text-base font-bold text-bk-ink">
                      ₹{Math.round(item.price * item.quantity).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-bk-border/60 bg-bk-surface-alt/50 px-6 py-4">
                <div className="text-xs text-bk-muted">
                  Deliver to:{" "}
                  <span className="font-semibold text-bk-ink">
                    {order.shippingAddress.name} ({order.shippingAddress.city} -{" "}
                    {order.shippingAddress.pinCode})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="mr-3 font-display text-base font-bold text-bk-ink">
                    Total: ₹{Math.round(order.total).toLocaleString("en-IN")}
                  </div>

                  <button
                    onClick={() => onTrackOrder(order.id)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-bk-primary px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-bk-primary/90 transition"
                  >
                    <Truck className="h-3.5 w-3.5" />
                    Track Shipment
                  </button>

                  {order.canCancel && (
                    <button
                      onClick={() => {
                        const reason = prompt("Please provide a cancellation reason:");
                        if (reason) {
                          store.cancelOrder(order.id, reason);
                          toast.success("Order cancelled");
                        }
                      }}
                      className="rounded-full border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-bk-error hover:bg-rose-100"
                    >
                      Cancel Order
                    </button>
                  )}

                  {order.canReturn && !order.returnRequest && (
                    <button
                      onClick={() => onRequestReturn(order.id)}
                      className="rounded-full border border-bk-border bg-bk-surface px-3.5 py-2 text-xs font-semibold hover:bg-bk-surface-alt"
                    >
                      Return / Exchange
                    </button>
                  )}

                  {order.returnRequest && (
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                      Return {order.returnRequest.status.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

function ShipmentTrackingTab({
  orders,
  selectedOrder,
  onSelectOrder,
}: {
  orders: Order[];
  selectedOrder: Order;
  onSelectOrder: (id: string) => void;
}) {
  if (!selectedOrder) {
    return (
      <div className="bk-card rounded-2xl p-12 text-center">
        <Truck className="mx-auto h-12 w-12 text-bk-muted/40" />
        <h3 className="mt-3 font-display text-lg font-bold text-bk-ink">
          No active shipment selected
        </h3>
        <p className="text-xs text-bk-muted">
          Select an order from your order history to view live checkpoints.
        </p>
      </div>
    );
  }

  const shipment = selectedOrder.shipment;

  const ALL_CHECKPOINTS = [
    { key: "ORDER_PLACED", label: "Order Placed" },
    { key: "PAYMENT_CONFIRMED", label: "Payment Confirmed" },
    { key: "PROCESSING", label: "Processing at Warehouse" },
    { key: "PACKED", label: "Packed & Label Generated" },
    { key: "SHIPPED", label: "Handed Over to Courier" },
    { key: "IN_TRANSIT", label: "In Transit" },
    { key: "LOCAL_HUB", label: "Reached Local Delivery Hub" },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { key: "DELIVERED", label: "Delivered to Doorstep" },
  ];

  const completedStatuses = new Set(shipment.events.map((e) => e.status));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-bk-border bg-bk-surface p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-bold text-bk-ink">
              Live Shipment Tracking
            </h2>
            <span className="rounded-full bg-bk-primary/15 px-3 py-0.5 text-xs font-bold text-bk-primary">
              Verified Logistics
            </span>
          </div>
          <p className="mt-1 text-xs text-bk-muted">
            Real-time delivery milestones powered by Shiprocket API integration
          </p>
        </div>

        {orders.length > 1 && (
          <select
            value={selectedOrder.id}
            onChange={(e) => onSelectOrder(e.target.value)}
            className="bk-input h-9 text-xs font-bold"
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                Order #{o.id} ({o.status})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bk-card rounded-xl p-4">
          <div className="text-xs font-semibold text-bk-muted">Courier Partner</div>
          <div className="mt-1 font-bold text-bk-ink">{shipment.courierName}</div>
          <div className="mt-1 text-[11px] text-bk-success">Priority Surface Express</div>
        </div>

        <div className="bk-card rounded-xl p-4">
          <div className="text-xs font-semibold text-bk-muted">Tracking ID & AWB</div>
          <div className="mt-1 font-mono font-bold text-bk-ink">{shipment.trackingId}</div>
          <div className="mt-1 font-mono text-[11px] text-bk-muted">
            {shipment.awbNumber}
          </div>
        </div>

        <div className="bk-card rounded-xl p-4">
          <div className="text-xs font-semibold text-bk-muted">
            Current Verified Checkpoint
          </div>
          <div className="mt-1 font-semibold text-bk-ink">{shipment.currentLocation}</div>
          <div className="mt-1 text-[11px] text-bk-secondary">On Schedule</div>
        </div>

        <div className="bk-card rounded-xl p-4">
          <div className="text-xs font-semibold text-bk-muted">Estimated Delivery Date</div>
          <div className="mt-1 font-display text-lg font-bold text-bk-success">
            {shipment.estimatedDeliveryDate}
          </div>
          <div className="mt-1 text-[11px] text-bk-muted">
            {shipment.daysRemaining === 0
              ? "Arriving Today"
              : `${shipment.daysRemaining} Day(s) Remaining`}
          </div>
        </div>
      </div>

      <div className="bk-card rounded-2xl p-6">
        <h3 className="mb-6 font-display text-lg font-bold text-bk-ink">
          Delivery Journey & Milestones
        </h3>

        <div className="bk-timeline">
          {ALL_CHECKPOINTS.map((cp, idx) => {
            const isCompleted = completedStatuses.has(cp.key as any);
            const eventDetail = shipment.events.find((e) => e.status === cp.key);
            const isLatest =
              eventDetail && eventDetail === shipment.events[shipment.events.length - 1];

            return (
              <div key={cp.key} className="bk-timeline__step">
                <div
                  className={`bk-timeline__node ${
                    isCompleted ? "completed" : isLatest ? "current" : "pending"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <span className="text-[11px] font-bold">{idx + 1}</span>
                  )}
                </div>

                <div
                  className={`bk-timeline__content ${
                    isLatest ? "current" : ""
                  }`}
                >
                  <div className="bk-timeline__label">
                    <span className="bk-timeline__title">{cp.label}</span>
                    {isLatest && (
                      <span className="rounded-full bg-bk-primary px-2 py-0.5 text-[10px] font-bold uppercase text-white animate-pulse">
                        Current Status
                      </span>
                    )}
                  </div>
                  {eventDetail && (
                    <span className="bk-timeline__time">{eventDetail.timestamp}</span>
                  )}

                  {eventDetail && (
                    <div className="mt-1.5">
                      <p className="bk-timeline__desc">
                        {eventDetail.description}
                      </p>
                      <p className="bk-timeline__location">
                        <MapPin className="h-3 w-3" /> {eventDetail.location}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-bk-border/60 pt-4 text-xs">
          <span className="text-bk-muted">
            Delivering to:{" "}
            <strong className="text-bk-ink">
              {selectedOrder.shippingAddress.houseNo}, {selectedOrder.shippingAddress.street},{" "}
              {selectedOrder.shippingAddress.city} - {selectedOrder.shippingAddress.pinCode}
            </strong>
          </span>

          <a
            href={shipment.courierUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-bk-primary hover:underline"
          >
            <span>Open Carrier Tracking Page</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

function AddressesTab({ addresses }: { addresses: Address[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState<Address | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [type, setType] = useState<"home" | "work" | "other">("home");
  const [isDefault, setIsDefault] = useState(false);

  function openAddModal() {
    setEditingAddr(null);
    setName("");
    setPhone("");
    setHouseNo("");
    setStreet("");
    setLandmark("");
    setCity("");
    setState("");
    setPinCode("");
    setType("home");
    setIsDefault(addresses.length === 0);
    setModalOpen(true);
  }

  function openEditModal(a: Address) {
    setEditingAddr(a);
    setName(a.name);
    setPhone(a.phone);
    setHouseNo(a.houseNo);
    setStreet(a.street);
    setLandmark(a.landmark || "");
    setCity(a.city);
    setState(a.state);
    setPinCode(a.pinCode);
    setType(a.type);
    setIsDefault(a.isDefault);
    setModalOpen(true);
  }

  function handleSaveAddress(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !phone || !houseNo || !street || !pinCode) {
      toast.error("Please fill in all required address fields");
      return;
    }

    if (editingAddr) {
      store.updateAddress(editingAddr.id, {
        name,
        phone,
        houseNo,
        street,
        landmark,
        city,
        state,
        pinCode,
        type,
        isDefault,
      });
      toast.success("Address updated successfully");
    } else {
      store.addAddress({
        name,
        phone,
        houseNo,
        street,
        landmark,
        city,
        state,
        pinCode,
        type,
        isDefault,
      });
      toast.success("New address added");
    }
    setModalOpen(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-bk-border bg-bk-surface p-6 shadow-sm">
        <div>
          <h2 className="font-display text-xl font-bold text-bk-ink">
            Manage Delivery Addresses
          </h2>
          <p className="text-xs text-bk-muted">
            Save your home, office, and frequent drop-off locations for instant checkout
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 rounded-full bg-bk-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-bk-primary/90 transition"
        >
          <Plus className="h-4 w-4" /> Add New Address
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.length === 0 && (
          <div className="bk-empty-state sm:col-span-2">
            <MapPin className="mx-auto h-10 w-10 text-bk-primary/40" />
            <h3 className="mt-3 font-display text-base font-bold text-bk-ink">
              No saved addresses yet
            </h3>
            <p className="mt-1 text-xs text-bk-muted">
              Add your home or work address for lightning-fast checkout.
            </p>
            <button
              onClick={openAddModal}
              className="bk-btn bk-btn-primary mt-4 inline-flex"
            >
              <Plus className="h-4 w-4" /> Add Your First Address
            </button>
          </div>
        )}
        {addresses.map((a) => (
          <div
            key={a.id}
            className={`relative overflow-hidden rounded-xl border bg-bk-surface p-5 shadow-sm transition-all duration-300 ${
              a.isDefault ? "border-bk-primary bg-bk-primary/5" : "border-bk-border/80"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                  a.type === "home"
                    ? "bg-bk-primary/10 text-bk-primary"
                    : a.type === "work"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-bk-error/10 text-bk-error"
                }`}>
                  {a.type === "home" ? "🏠" : a.type === "work" ? "🏢" : "📍"} {a.type}
                </span>
                {a.isDefault && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-bk-primary px-2.5 py-0.5 text-[10px] font-black text-white shadow-sm">
                    ✓ Default Address
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditModal(a)}
                  className="grid h-8 w-8 place-items-center rounded-full transition-all duration-200 text-bk-muted hover:bg-bk-primary/10 hover:text-bk-primary"
                  title="Edit address"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this address?")) store.deleteAddress(a.id);
                  }}
                  className="grid h-8 w-8 place-items-center rounded-full transition-all duration-200 text-bk-muted hover:bg-rose-50 hover:text-bk-error"
                  title="Delete address"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-3">
              <div className="font-display text-base font-bold text-bk-ink">{a.name}</div>
              <div className="mt-0.5 inline-block rounded-lg px-2 py-0.5 font-mono text-[11px] bg-bk-surface-alt text-bk-muted">
                📱 {a.phone}
              </div>
              <p className="mt-2.5 text-xs leading-relaxed text-bk-muted/80">
                {a.houseNo}, {a.street}
                {a.landmark && `, near ${a.landmark}`}
                <br />
                {a.city}, {a.state} - <span className="font-bold text-bk-primary">{a.pinCode}</span>
              </p>

              {!a.isDefault && (
                <div className="mt-4 border-t border-bk-border/60 pt-3">
                  <button
                    onClick={() => store.setDefaultAddress(a.id)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-bk-primary transition-all"
                  >
                    Set as Default Address <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAddr ? "Edit Address" : "Add Delivery Address"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveAddress} className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="bk-label">Full Name</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bk-input"
                  required
                />
              </label>
              <label className="block">
                <span className="bk-label">Phone Number</span>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="bk-input"
                  required
                />
              </label>
            </div>

            <label className="block">
              <span className="bk-label">Flat / House No / Building Name</span>
              <input
                value={houseNo}
                onChange={(e) => setHouseNo(e.target.value)}
                className="bk-input"
                required
              />
            </label>

            <label className="block">
              <span className="bk-label">Road / Street / Area / Colony</span>
              <input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="bk-input"
                required
              />
            </label>

            <div className="grid grid-cols-3 gap-2">
              <label className="block">
                <span className="bk-label">PIN Code</span>
                <input
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="bk-input"
                  required
                />
              </label>
              <label className="block">
                <span className="bk-label">City</span>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bk-input"
                  required
                />
              </label>
              <label className="block">
                <span className="bk-label">State</span>
                <input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="bk-input"
                  required
                />
              </label>
            </div>

            <label className="block">
              <span className="bk-label">Landmark (Optional)</span>
              <input
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Metro Station"
                className="bk-input"
              />
            </label>

            <div className="flex items-center gap-4 pt-1">
              <span className="text-xs font-semibold text-bk-ink">Type:</span>
              {(["home", "work", "other"] as const).map((t) => (
                <label
                  key={t}
                  className="flex items-center gap-1.5 text-xs capitalize cursor-pointer"
                >
                  <input
                    type="radio"
                    name="addrType"
                    checked={type === t}
                    onChange={() => setType(t)}
                    className="accent-bk-primary"
                  />
                  {t}
                </label>
              ))}
            </div>

            <label className="flex items-center gap-2 pt-1 text-xs cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="accent-bk-primary"
              />
              <span>Set as default delivery address</span>
            </label>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-bk-primary text-white font-bold">
                Save Address
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

function WishlistTab({ wishlist }: { wishlist: string[] }) {
  const items = [
    {
      id: "1",
      name: "Shimla Crisp Red Apples",
      slug: "shimla-apples",
      price: 249,
      unit: "1 kg pack",
      image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400",
      rating: 4.8,
      inStock: true,
    },
    {
      id: "4",
      name: "Artisan Sourdough Country Loaf",
      slug: "artisan-sourdough",
      price: 160,
      unit: "400 g",
      image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
      rating: 4.9,
      inStock: true,
    },
    {
      id: "2",
      name: "Organic Farm Avocados",
      slug: "organic-avocados",
      price: 199,
      unit: "2 pcs pack",
      image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400",
      rating: 4.7,
      inStock: true,
    },
  ].filter((p) => wishlist.includes(p.id));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="bk-card rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold text-bk-ink">
          My Wishlist ({items.length})
        </h2>
        <p className="text-xs text-bk-muted">
          Save favorite grocery and lifestyle items to buy anytime
        </p>
      </div>

      {items.length === 0 ? (
        <div className="bk-empty-state">
          <Heart className="mx-auto h-12 w-12 text-bk-muted/40" />
          <h3 className="mt-3 font-display text-base font-bold text-bk-ink">
            Your wishlist is empty
          </h3>
          <p className="text-xs text-bk-muted">
            Explore farm-fresh groceries and save your favorites
          </p>
          <Link
            to="/shop"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-bk-primary px-5 py-2 text-xs font-bold text-white shadow-sm"
          >
            Explore Shop
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-bk-border bg-bk-surface p-4 shadow-sm transition hover:shadow-md"
            >
              <div className="relative aspect-square overflow-hidden rounded-xl bg-bk-surface-alt">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <button
                  onClick={() => {
                    store.toggleWishlist(item.id);
                    toast.info("Removed from wishlist");
                  }}
                  className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-rose-500 shadow-sm backdrop-blur-xs transition hover:scale-110"
                >
                  <Heart className="h-4 w-4 fill-rose-500" />
                </button>
              </div>

              <div className="mt-3 flex-1">
                <div className="flex items-center gap-1 text-xs text-bk-muted">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-bk-ink">{item.rating}</span>
                </div>
                <h4 className="mt-1 font-semibold text-bk-ink line-clamp-1">{item.name}</h4>
                <p className="text-xs text-bk-muted">{item.unit}</p>
                <div className="mt-2 font-display text-lg font-bold text-bk-ink">
                  ₹{item.price}
                </div>
              </div>

              <button
                onClick={() => {
                  cart.add({
                    id: item.id,
                    name: item.name,
                    slug: item.slug,
                    price: item.price,
                    image: item.image,
                    unit: item.unit,
                  });
                  toast.success("Moved to cart");
                }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-bk-primary py-2 text-xs font-bold text-white shadow-xs hover:opacity-95"
              >
                <ShoppingBag className="h-3.5 w-3.5" /> Move to Cart
              </button>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function PaymentsTab({ orders }: { orders: Order[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="bk-card rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold text-bk-ink">
          Payments & Transactions
        </h2>
        <p className="text-xs text-bk-muted">
          Detailed history of online Razorpay and Cash on Delivery transactions
        </p>
      </div>

      <div className="bk-card rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-bk-border bg-bk-surface-alt font-semibold text-bk-muted">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Method</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bk-border/60">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-bk-surface-alt/50">
                  <td className="p-4 font-mono font-bold text-bk-ink">
                    {o.transactionId || `TXN-${o.id}`}
                  </td>
                  <td className="p-4 font-mono text-bk-muted">#{o.id}</td>
                  <td className="p-4 font-semibold uppercase text-bk-muted">{o.paymentMethod}</td>
                  <td className="p-4 font-display font-bold text-bk-ink">
                    ₹{Math.round(o.total).toLocaleString("en-IN")}
                  </td>
                  <td className="p-4 text-bk-muted">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="p-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                        o.paymentStatus === "paid"
                          ? "bg-bk-success/10 text-bk-success"
                          : o.paymentStatus === "refunded"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-bk-secondary/10 text-bk-secondary"
                      }`}
                    >
                      {o.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}

function ReturnsTab({
  orders,
  selectedOrderId,
}: {
  orders: Order[];
  selectedOrderId: string | null;
}) {
  const [returnOrderId, setReturnOrderId] = useState<string>(
    selectedOrderId || orders[0]?.id || "",
  );
  const [reason, setReason] = useState("Damaged product received");
  const [comments, setComments] = useState("");

  const returnOrders = orders.filter((o) => o.returnRequest || o.status === "returned");

  function submitReturn(e: React.FormEvent) {
    e.preventDefault();
    if (!returnOrderId) {
      toast.error("Please select an eligible delivered order");
      return;
    }
    const success = store.requestReturn(returnOrderId, reason, comments);
    if (success) {
      toast.success("Return request submitted for verification!");
      setComments("");
    } else {
      toast.error("Order is not eligible for return");
    }
  }

  const eligibleOrders = orders.filter((o) => o.canReturn && !o.returnRequest);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="bk-card rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold text-bk-ink">
          Returns & Refund Requests
        </h2>
        <p className="text-xs text-bk-muted">
          Basketo Quality Guarantee: Returns accepted within 48 hours of delivery with instant
          refund
        </p>
      </div>

      {eligibleOrders.length > 0 && (
        <div className="bk-card rounded-2xl p-6">
          <h3 className="font-display text-base font-bold text-bk-ink">
            Request Return / Exchange
          </h3>
          <form onSubmit={submitReturn} className="mt-4 space-y-4">
            <div>
              <label className="bk-label">Select Order</label>
              <select
                value={returnOrderId}
                onChange={(e) => setReturnOrderId(e.target.value)}
                className="bk-input h-10"
              >
                {eligibleOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    Order #{o.id} • Total: ₹{o.total} ({o.items[0]?.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="bk-label">Return Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="bk-input h-10"
              >
                <option value="Damaged product received">Damaged product or broken seal</option>
                <option value="Expired or poor freshness">
                  Expired or poor freshness / quality
                </option>
                <option value="Wrong product received">Wrong product received</option>
                <option value="Missing items in packet">Missing items in packet</option>
              </select>
            </div>

            <div>
              <label className="bk-label">Comments / Evidence</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Describe the issue with the delivered produce..."
                className="bk-input h-24 p-3"
              />
            </div>

            <Button
              type="submit"
              size="sm"
              className="bg-bk-primary text-white font-bold"
            >
              Submit Return Request
            </Button>
          </form>
        </div>
      )}

      <div className="bk-card rounded-2xl p-6">
        <h3 className="font-display text-base font-bold text-bk-ink">
          Return Status & History
        </h3>
        {returnOrders.length === 0 ? (
          <p className="mt-2 text-xs text-bk-muted">No returns requested yet.</p>
        ) : (
          <div className="mt-4 divide-y divide-bk-border/60">
            {returnOrders.map((o) => (
              <div key={o.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-mono text-xs font-bold text-bk-ink">
                    Order #{o.id}
                  </div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 uppercase">
                    {o.returnRequest?.status || o.status}
                  </span>
                </div>
                <div className="mt-1 text-xs text-bk-muted">
                  Reason: <strong className="text-bk-ink">{o.returnRequest?.reason}</strong>
                  {o.returnRequest?.comments && ` — "${o.returnRequest.comments}"`}
                </div>
                <div className="mt-1 text-[11px] text-bk-muted">
                  Requested on{" "}
                  {new Date(o.returnRequest?.requestedAt || o.createdAt).toLocaleDateString(
                    "en-IN",
                  )}
                  • Refund Amount: ₹{o.total}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ReviewsTab({ orders }: { orders: Order[] }) {
  const [rating, setRating] = useState(5);
  const [headline, setHeadline] = useState("");
  const [comment, setComment] = useState("");
  const reviews = store.reviews;

  const purchasedProducts = orders.flatMap((o) => o.items);

  function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!comment) return;

    store.addReview({
      productId: purchasedProducts[0]?.productId || "1",
      rating,
      headline: headline || "Great Fresh Produce",
      comment,
    });
    toast.success("Review submitted! Thank you for rating Basketo.");
    setHeadline("");
    setComment("");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="bk-card rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold text-bk-ink">
          My Reviews & Customer Ratings
        </h2>
        <p className="text-xs text-bk-muted">
          Rate your purchased farm produce and share feedback with the community
        </p>
      </div>

      <div className="bk-card rounded-2xl p-6">
        <h3 className="font-display text-base font-bold text-bk-ink">
          Write a Verified Buyer Review
        </h3>
        <form onSubmit={handleAddReview} className="mt-4 space-y-4">
          <div>
            <label className="bk-label">Select Rating</label>
            <div className="mt-1 flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="rounded-md p-1 transition hover:scale-120"
                >
                  <Star
                    className={`h-6 w-6 ${
                      star <= rating ? "fill-amber-400 text-amber-400" : "text-bk-muted/30"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-bk-ink">
                {rating} out of 5 stars
              </span>
            </div>
          </div>

          <div>
            <label className="bk-label">Review Headline</label>
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Incredibly sweet and juicy apples!"
              className="bk-input h-9"
            />
          </div>

          <div>
            <label className="bk-label">Detailed Review</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike? How was the packaging & delivery speed?"
              className="bk-input h-24 p-3"
              required
            />
          </div>

          <Button
            type="submit"
            size="sm"
            className="bg-bk-primary text-white font-bold"
          >
            Post Customer Review
          </Button>
        </form>
      </div>

      <div className="bk-card rounded-2xl p-6">
        <h3 className="font-display text-base font-bold text-bk-ink">
          My Submitted Reviews ({reviews.length})
        </h3>
        {reviews.length === 0 ? (
          <p className="mt-2 text-xs text-bk-muted">No reviews submitted yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-bk-border/60 bg-bk-surface-alt p-4">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="font-bold text-bk-ink text-sm">{r.headline}</span>
                </div>
                <p className="mt-2 text-xs text-bk-muted">{r.comment}</p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-bk-success">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>
                    Verified Purchase • {new Date(r.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function NotificationsTab({ notifications }: { notifications: store["notifications"] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between rounded-xl border border-bk-border bg-bk-surface p-6 shadow-sm">
        <div>
          <h2 className="font-display text-xl font-bold text-bk-ink">
            Notification Center
          </h2>
          <p className="text-xs text-bk-muted">
            Real-time alerts regarding your orders, dispatch updates and rewards
          </p>
        </div>
        <button
          onClick={() => store.markAllNotificationsRead()}
          className="text-xs font-bold text-bk-primary hover:underline"
        >
          Mark all as read
        </button>
      </div>

      <div className="rounded-xl border border-bk-border bg-bk-surface divide-y divide-bk-border/60 overflow-hidden shadow-sm">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-bk-muted">
            No notifications at the moment.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => store.markNotificationRead(n.id)}
              className={`flex items-start gap-4 p-5 cursor-pointer transition ${
                n.read ? "bg-bk-surface" : "bg-bk-primary/5 font-medium"
              }`}
            >
              <div
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                  n.type === "shipment"
                    ? "bg-blue-100 text-blue-600"
                    : n.type === "order"
                      ? "bg-bk-success/10 text-bk-success"
                      : "bg-amber-100 text-amber-600"
                }`}
              >
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-bk-ink">{n.title}</h4>
                  <span className="text-[11px] text-bk-muted">
                    {new Date(n.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="mt-1 text-xs text-bk-muted leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

function ProfileTab({ user }: { user: User | null }) {
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    store.updateProfile(name, phone);
    toast.success("Profile updated successfully!");
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    toast.success("Password updated securely!");
    setNewPassword("");
    setConfirmPassword("");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="bk-card rounded-2xl p-6">
        <h2 className="font-display text-xl font-bold text-bk-ink">
          Personal Information
        </h2>
        <p className="text-xs text-bk-muted">
          Manage your identity, phone number, and security credentials
        </p>

        <form onSubmit={handleSaveProfile} className="mt-6 max-w-lg space-y-4">
          <label className="block">
            <span className="bk-label">Full Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bk-input"
              required
            />
          </label>

          <label className="block">
            <span className="bk-label">Email Address (Verified)</span>
            <input
              value={user?.email || ""}
              disabled
              className="bk-input bg-bk-surface-alt/50 text-bk-muted"
            />
          </label>

          <label className="block">
            <span className="bk-label">Phone Number</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bk-input"
              required
            />
          </label>

          <Button
            type="submit"
            size="sm"
            className="bg-bk-primary text-white font-bold"
          >
            Save Profile Changes
          </Button>
        </form>
      </div>

      <div className="bk-card rounded-2xl p-6">
        <h3 className="font-display text-base font-bold text-bk-ink">
          Change Password
        </h3>
        <p className="text-xs text-bk-muted">
          Ensure your account uses a strong password
        </p>

        <form onSubmit={handleChangePassword} className="mt-4 max-w-lg space-y-4">
          <label className="block">
            <span className="bk-label">New Password</span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bk-input"
            />
          </label>

          <label className="block">
            <span className="bk-label">Confirm New Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bk-input"
            />
          </label>

          <Button type="submit" size="sm" variant="outline" className="font-bold border-bk-border">
            Update Password
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
