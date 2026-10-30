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
  head: () => ({ meta: [{ title: "My Account & Orders — Basketo" }] }),
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

  // Subscribe to central reactive store
  const currentStore = useSyncExternalStore(
    (cb) => store.subscribe(cb),
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

  // Derived stats
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

  return (
    <div className="min-h-screen bg-muted/20 text-foreground">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Top welcome & quick switch banner */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/80 bg-card p-5 shadow-xs">
          <div className="flex items-center gap-3.5">
            <img
              src={
                user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
              }
              alt={user?.name || "Customer"}
              className="h-13 w-13 rounded-full border-2 border-emerald-500/40 object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                  Hello, {user?.name || "Customer"}
                </h1>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="h-3.5 w-3.5" /> Verified
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {user?.email} • {user?.phone}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                store.switchUser("customer");
                toast.success("Switched to Demo Customer (Aarav)");
              }}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                user?.role === "customer"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border border-border bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              Demo Customer
            </button>
            <button
              onClick={() => {
                store.switchUser("admin");
                toast.success("Switched to Admin profile");
                navigate({ to: "/admin" });
              }}
              className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted"
            >
              Go to Admin Panel
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Left Sidebar Navigation (Flipkart Style) */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              <nav className="overflow-hidden rounded-2xl border border-border/80 bg-card p-2 shadow-xs">
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
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-emerald-500/15 to-emerald-500/5 text-emerald-800 dark:text-emerald-300 font-bold"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-4 w-4 ${isActive ? "text-emerald-600 dark:text-emerald-400" : ""}`}
                        />
                        <span>{label}</span>
                      </div>
                      {badge !== undefined && badge > 0 && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                            isActive
                              ? "bg-emerald-600 text-white"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                <div className="my-2 h-px bg-border/60" />

                <button
                  onClick={() => {
                    store.setCurrentUser(null);
                    toast.info("Signed out");
                    navigate({ to: "/" });
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-destructive transition hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out</span>
                </button>
              </nav>

              {/* Help & 24x7 Guarantee Box */}
              <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-card to-emerald-50/20 p-4 text-xs shadow-xs">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  <span>Basketo Buyer Protection</span>
                </div>
                <p className="mt-1.5 text-muted-foreground">
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

// -------------------------------------------------------------
// TAB 1: OVERVIEW
// -------------------------------------------------------------

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
      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {[
          {
            label: "Total Orders",
            value: totalOrders,
            icon: Package,
            color: "text-emerald-600 bg-emerald-500/10",
          },
          {
            label: "Products Bought",
            value: totalProductsPurchased,
            icon: ShoppingBag,
            color: "text-blue-600 bg-blue-500/10",
          },
          {
            label: "Delivered",
            value: deliveredOrders,
            icon: CheckCircle2,
            color: "text-emerald-600 bg-emerald-500/10",
          },
          {
            label: "In Transit / Pending",
            value: pendingOrders,
            icon: Clock,
            color: "text-amber-600 bg-amber-500/10",
          },
          {
            label: "Cancelled",
            value: cancelledOrders,
            icon: AlertCircle,
            color: "text-rose-600 bg-rose-500/10",
          },
          {
            label: "Total Spending",
            value: `₹${Math.round(totalSpent).toLocaleString("en-IN")}`,
            icon: CreditCard,
            color: "text-purple-600 bg-purple-500/10",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">{stat.label}</span>
                <div className={`grid h-8 w-8 place-items-center rounded-xl ${stat.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 font-display text-2xl font-black text-foreground">
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Shipment Banner */}
      {orders.length > 0 &&
        orders[0].status !== "delivered" &&
        orders[0].status !== "cancelled" && (
          <div className="overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-card to-amber-500/10 p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  <Truck className="h-3.5 w-3.5" /> Active Delivery in Progress
                </div>
                <h3 className="font-display text-lg font-bold">
                  Order #{orders[0].id} is {orders[0].status.replace("_", " ").toUpperCase()}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Current Location:{" "}
                  <span className="font-semibold text-foreground">
                    {orders[0].shipment.currentLocation}
                  </span>{" "}
                  • Expected:{" "}
                  <span className="font-semibold text-foreground">
                    {orders[0].shipment.estimatedDeliveryDate}
                  </span>
                </p>
              </div>
              <button
                onClick={() => onTrackOrder(orders[0].id)}
                className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition hover:scale-105"
              >
                Live Visual Tracking <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

      {/* Recent Purchases List */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div>
            <h2 className="font-display text-lg font-bold">Recent Purchases</h2>
            <p className="text-xs text-muted-foreground">
              Recent transactions and orders placed on Basketo
            </p>
          </div>
          <button onClick={onViewOrders} className="text-xs font-bold text-primary hover:underline">
            View all orders ({orders.length}) →
          </button>
        </div>

        <div className="mt-4 divide-y divide-border/60">
          {orders.slice(0, 3).map((order) => (
            <div key={order.id} className="flex flex-wrap items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-3">
                <img
                  src={
                    order.items[0]?.image ||
                    "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=200"
                  }
                  alt={order.items[0]?.name}
                  className="h-16 w-16 rounded-xl border border-border object-cover"
                />
                <div>
                  <div className="font-semibold text-foreground">{order.items[0]?.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Order #{order.id} • {order.items.length} item{order.items.length > 1 ? "s" : ""}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
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
                  <div className="font-display text-base font-bold text-foreground">
                    ₹{Math.round(order.total).toLocaleString("en-IN")}
                  </div>
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                      order.status === "delivered"
                        ? "bg-emerald-100 text-emerald-800"
                        : order.status === "cancelled"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {order.status.replace("_", " ")}
                  </span>
                </div>
                <button
                  onClick={() => onTrackOrder(order.id)}
                  className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold hover:bg-muted"
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

// -------------------------------------------------------------
// TAB 2: MY ORDERS WITH STATUS FILTERS
// -------------------------------------------------------------

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
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/80 bg-card p-5 shadow-xs">
        <div>
          <h2 className="font-display text-xl font-bold">My Orders ({orders.length})</h2>
          <p className="text-xs text-muted-foreground">
            View order invoices, live delivery checkpoints, and return eligibility
          </p>
        </div>

        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by order ID or product..."
          className="h-9 w-64 rounded-full border border-border bg-muted/40 px-3.5 text-xs outline-none focus:border-primary"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-1">
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
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
              filter === f.id
                ? "bg-primary text-primary-foreground shadow-xs"
                : "border border-border/80 bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
            <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-3 font-display text-base font-bold">No orders found</h3>
            <p className="text-xs text-muted-foreground">
              Try selecting another filter or browse our market
            </p>
            <Link
              to="/shop"
              className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-sm"
            >
              Browse Shop
            </Link>
          </div>
        ) : (
          filtered.map((order) => (
            <div
              key={order.id}
              className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xs transition hover:shadow-md"
            >
              {/* Order Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-muted/20 px-6 py-4">
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Order ID: </span>
                    <span className="font-mono font-bold text-foreground">{order.id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Order Date: </span>
                    <span className="font-semibold text-foreground">
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
                    <span className="text-muted-foreground">Payment: </span>
                    <span className="font-semibold uppercase text-foreground">
                      {order.paymentMethod}
                    </span>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                    order.status === "delivered"
                      ? "bg-emerald-100 text-emerald-800"
                      : order.status === "cancelled"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {order.status.replace("_", " ")}
                </span>
              </div>

              {/* Order Items */}
              <div className="divide-y divide-border/60 p-6">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-16 w-16 rounded-xl border border-border object-cover"
                      />
                      <div>
                        <h4 className="font-semibold text-foreground">{item.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} × ₹{Math.round(item.price)} • {item.unit || "unit"}
                        </p>
                      </div>
                    </div>
                    <div className="font-display text-base font-bold text-foreground">
                      ₹{Math.round(item.price * item.quantity).toLocaleString("en-IN")}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/60 bg-muted/10 px-6 py-4">
                <div className="text-xs text-muted-foreground">
                  Deliver to:{" "}
                  <span className="font-semibold text-foreground">
                    {order.shippingAddress.name} ({order.shippingAddress.city} -{" "}
                    {order.shippingAddress.pinCode})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="mr-3 font-display text-base font-bold text-foreground">
                    Total: ₹{Math.round(order.total).toLocaleString("en-IN")}
                  </div>

                  <button
                    onClick={() => onTrackOrder(order.id)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-xs transition hover:scale-105"
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
                      className="rounded-full border border-rose-300 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                    >
                      Cancel Order
                    </button>
                  )}

                  {order.canReturn && !order.returnRequest && (
                    <button
                      onClick={() => onRequestReturn(order.id)}
                      className="rounded-full border border-border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-muted"
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

// -------------------------------------------------------------
// TAB 3: ADVANCED SHIPMENT TRACKING (CRITICAL FLIPKART FEATURE)
// -------------------------------------------------------------

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
      <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
        <Truck className="mx-auto h-12 w-12 text-muted-foreground/40" />
        <h3 className="mt-3 font-display text-lg font-bold">No active shipment selected</h3>
        <p className="text-xs text-muted-foreground">
          Select an order from your order history to view live checkpoints.
        </p>
      </div>
    );
  }

  const shipment = selectedOrder.shipment;

  // 9 Complete Flipkart/Shiprocket tracking checkpoints
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
      {/* Shipment Header Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-display text-2xl font-bold">Live Shipment Tracking</h2>
            <span className="rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-bold text-emerald-600">
              Verified Logistics
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Real-time delivery milestones powered by Shiprocket API integration
          </p>
        </div>

        {orders.length > 1 && (
          <select
            value={selectedOrder.id}
            onChange={(e) => onSelectOrder(e.target.value)}
            className="rounded-full border border-border bg-muted/40 px-4 py-2 text-xs font-bold outline-none"
          >
            {orders.map((o) => (
              <option key={o.id} value={o.id}>
                Order #{o.id} ({o.status})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Courier & AWB Information Card */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="text-xs font-semibold text-muted-foreground">Courier Partner</div>
          <div className="mt-1 font-bold text-foreground">{shipment.courierName}</div>
          <div className="mt-1 text-[11px] text-emerald-600">Priority Surface Express</div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="text-xs font-semibold text-muted-foreground">Tracking ID & AWB</div>
          <div className="mt-1 font-mono font-bold text-foreground">{shipment.trackingId}</div>
          <div className="mt-1 font-mono text-[11px] text-muted-foreground">
            {shipment.awbNumber}
          </div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="text-xs font-semibold text-muted-foreground">
            Current Verified Checkpoint
          </div>
          <div className="mt-1 font-semibold text-foreground">{shipment.currentLocation}</div>
          <div className="mt-1 text-[11px] text-amber-600">⚡ On Schedule</div>
        </div>

        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="text-xs font-semibold text-muted-foreground">Estimated Delivery Date</div>
          <div className="mt-1 font-display text-lg font-bold text-emerald-600">
            {shipment.estimatedDeliveryDate}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {shipment.daysRemaining === 0
              ? "Arriving Today"
              : `${shipment.daysRemaining} Day(s) Remaining`}
          </div>
        </div>
      </div>

      {/* Visual Shipment Tracking Timeline */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
        <h3 className="mb-6 font-display text-lg font-bold">Delivery Journey & Milestones</h3>

        <div className="relative border-l-2 border-emerald-500/30 pl-6 sm:pl-8 ml-3 space-y-6">
          {ALL_CHECKPOINTS.map((cp, idx) => {
            const isCompleted = completedStatuses.has(cp.key as TrackingEvent["status"]);
            const eventDetail = shipment.events.find((e) => e.status === cp.key);
            const isLatest =
              eventDetail && eventDetail === shipment.events[shipment.events.length - 1];

            return (
              <div key={cp.key} className="relative group">
                {/* Node indicator */}
                <div
                  className={`absolute -left-[31px] sm:-left-[39px] top-0 grid h-7 w-7 place-items-center rounded-full border-2 transition-all ${
                    isCompleted
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-500/30"
                      : "border-border bg-background text-muted-foreground"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <span className="text-[11px] font-bold">{idx + 1}</span>
                  )}
                </div>

                <div
                  className={`rounded-2xl p-4 transition-all ${
                    isLatest
                      ? "border border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-xs"
                      : isCompleted
                        ? "bg-muted/30"
                        : "opacity-40"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-foreground">{cp.label}</span>
                      {isLatest && (
                        <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white animate-pulse">
                          Current Status
                        </span>
                      )}
                    </div>
                    {eventDetail && (
                      <span className="font-mono text-xs text-muted-foreground">
                        {eventDetail.timestamp}
                      </span>
                    )}
                  </div>

                  {eventDetail && (
                    <div className="mt-1.5 text-xs text-muted-foreground">
                      <p className="font-medium text-foreground/90">{eventDetail.description}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-[11px] text-emerald-700 dark:text-emerald-400">
                        <MapPin className="h-3 w-3" /> {eventDetail.location}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Courier external tracking link */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border/60 pt-4 text-xs">
          <span className="text-muted-foreground">
            Delivering to:{" "}
            <strong className="text-foreground">
              {selectedOrder.shippingAddress.houseNo}, {selectedOrder.shippingAddress.street},{" "}
              {selectedOrder.shippingAddress.city} - {selectedOrder.shippingAddress.pinCode}
            </strong>
          </span>

          <a
            href={shipment.courierUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-bold text-emerald-600 hover:underline"
          >
            <span>Open Carrier Tracking Page</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </motion.div>
  );
}

// -------------------------------------------------------------
// TAB 4: MY ADDRESSES (ADD, EDIT, DELETE, DEFAULT)
// -------------------------------------------------------------

function AddressesTab({ addresses }: { addresses: Address[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState<Address | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [city, setCity] = useState("Bangalore");
  const [state, setState] = useState("Karnataka");
  const [pinCode, setPinCode] = useState("560001");
  const [type, setType] = useState<"home" | "work" | "other">("home");
  const [isDefault, setIsDefault] = useState(false);

  function openAddModal() {
    setEditingAddr(null);
    setName("");
    setPhone("");
    setHouseNo("");
    setStreet("");
    setLandmark("");
    setCity("Bangalore");
    setState("Karnataka");
    setPinCode("560001");
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
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
        <div>
          <h2 className="font-display text-xl font-bold">Manage Delivery Addresses</h2>
          <p className="text-xs text-muted-foreground">
            Save your home, office, and frequent drop-off locations for instant checkout
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-xs transition hover:scale-105"
        >
          <Plus className="h-4 w-4" /> Add New Address
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((a) => (
          <div
            key={a.id}
            className={`relative rounded-3xl border p-5 shadow-xs transition-all ${
              a.isDefault
                ? "border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10"
                : "border-border/80 bg-card"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-bold uppercase text-foreground">
                  {a.type}
                </span>
                {a.isDefault && (
                  <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600">
                    Default Address
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(a)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this address?")) store.deleteAddress(a.id);
                  }}
                  className="rounded-full p-1 text-muted-foreground hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-3">
              <div className="font-display font-bold text-foreground">{a.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">{a.phone}</div>
              <p className="mt-2 text-xs leading-relaxed text-foreground/80">
                {a.houseNo}, {a.street}
                {a.landmark && `, near ${a.landmark}`}
                <br />
                {a.city}, {a.state} - <strong>{a.pinCode}</strong>
              </p>
            </div>

            {!a.isDefault && (
              <div className="mt-4 border-t border-border/60 pt-3">
                <button
                  onClick={() => store.setDefaultAddress(a.id)}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Set as Default Address
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Address Form Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAddr ? "Edit Address" : "Add Delivery Address"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSaveAddress} className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-semibold">
                Full Name *
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-border px-3 text-xs outline-none focus:border-primary"
                  required
                />
              </label>
              <label className="block text-xs font-semibold">
                Phone Number *
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-border px-3 text-xs outline-none focus:border-primary"
                  required
                />
              </label>
            </div>

            <label className="block text-xs font-semibold">
              Flat / House No / Building Name *
              <input
                value={houseNo}
                onChange={(e) => setHouseNo(e.target.value)}
                className="mt-1 h-9 w-full rounded-xl border border-border px-3 text-xs outline-none focus:border-primary"
                required
              />
            </label>

            <label className="block text-xs font-semibold">
              Road / Street / Area / Colony *
              <input
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                className="mt-1 h-9 w-full rounded-xl border border-border px-3 text-xs outline-none focus:border-primary"
                required
              />
            </label>

            <div className="grid grid-cols-3 gap-2">
              <label className="block text-xs font-semibold">
                PIN Code *
                <input
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-border px-3 text-xs outline-none focus:border-primary"
                  required
                />
              </label>
              <label className="block text-xs font-semibold">
                City *
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-border px-3 text-xs outline-none focus:border-primary"
                  required
                />
              </label>
              <label className="block text-xs font-semibold">
                State *
                <input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="mt-1 h-9 w-full rounded-xl border border-border px-3 text-xs outline-none focus:border-primary"
                  required
                />
              </label>
            </div>

            <label className="block text-xs font-semibold">
              Landmark (Optional)
              <input
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Near Metro Station"
                className="mt-1 h-9 w-full rounded-xl border border-border px-3 text-xs outline-none focus:border-primary"
              />
            </label>

            <div className="flex items-center gap-4 pt-1">
              <span className="text-xs font-semibold">Type:</span>
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
              />
              <span>Set as default delivery address</span>
            </label>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-primary text-primary-foreground">
                Save Address
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

// -------------------------------------------------------------
// TAB 5: MY WISHLIST
// -------------------------------------------------------------

function WishlistTab({ wishlist }: { wishlist: string[] }) {
  // Sample wishlist showcase items
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
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
        <h2 className="font-display text-xl font-bold">My Wishlist ({items.length})</h2>
        <p className="text-xs text-muted-foreground">
          Save favorite grocery and lifestyle items to buy anytime
        </p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <Heart className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-3 font-display text-base font-bold">Your wishlist is empty</h3>
          <p className="text-xs text-muted-foreground">
            Explore farm-fresh groceries and save your favorites
          </p>
          <Link
            to="/shop"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-xs"
          >
            Explore Shop
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-3xl border border-border/80 bg-card p-4 shadow-xs transition hover:shadow-md"
            >
              <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted/60">
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
                  className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-rose-500 shadow-md backdrop-blur-xs transition hover:scale-110"
                >
                  <Heart className="h-4 w-4 fill-rose-500" />
                </button>
              </div>

              <div className="mt-3 flex-1">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-foreground">{item.rating}</span>
                </div>
                <h4 className="mt-1 font-semibold text-foreground line-clamp-1">{item.name}</h4>
                <p className="text-xs text-muted-foreground">{item.unit}</p>
                <div className="mt-2 font-display text-lg font-bold">₹{item.price}</div>
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
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-2 text-xs font-bold text-primary-foreground shadow-xs transition hover:opacity-95"
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

// -------------------------------------------------------------
// TAB 6: PAYMENTS & TRANSACTIONS
// -------------------------------------------------------------

function PaymentsTab({ orders }: { orders: Order[] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
        <h2 className="font-display text-xl font-bold">Payments & Transactions</h2>
        <p className="text-xs text-muted-foreground">
          Detailed history of online Razorpay and Cash on Delivery transactions
        </p>
      </div>

      <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
              <tr>
                <th className="p-4">Transaction ID</th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Method</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date & Time</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-muted/20">
                  <td className="p-4 font-mono font-bold text-foreground">
                    {o.transactionId || `TXN-${o.id}`}
                  </td>
                  <td className="p-4 font-mono text-muted-foreground">#{o.id}</td>
                  <td className="p-4 font-semibold uppercase">{o.paymentMethod}</td>
                  <td className="p-4 font-display font-bold text-foreground">
                    ₹{Math.round(o.total).toLocaleString("en-IN")}
                  </td>
                  <td className="p-4 text-muted-foreground">
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
                          ? "bg-emerald-100 text-emerald-800"
                          : o.paymentStatus === "refunded"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-amber-100 text-amber-800"
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

// -------------------------------------------------------------
// TAB 7: RETURNS & REFUNDS
// -------------------------------------------------------------

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
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
        <h2 className="font-display text-xl font-bold">Returns & Refund Requests</h2>
        <p className="text-xs text-muted-foreground">
          Basketo Quality Guarantee: Returns accepted within 48 hours of delivery with instant
          refund
        </p>
      </div>

      {eligibleOrders.length > 0 && (
        <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
          <h3 className="font-display text-base font-bold">Request Return / Exchange</h3>
          <form onSubmit={submitReturn} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground">
                Select Order
              </label>
              <select
                value={returnOrderId}
                onChange={(e) => setReturnOrderId(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-xs outline-none focus:border-primary"
              >
                {eligibleOrders.map((o) => (
                  <option key={o.id} value={o.id}>
                    Order #{o.id} • Total: ₹{o.total} ({o.items[0]?.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground">
                Return Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-xs outline-none focus:border-primary"
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
              <label className="block text-xs font-semibold text-muted-foreground">
                Comments / Evidence
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Describe the issue with the delivered produce..."
                className="mt-1 h-20 w-full rounded-xl border border-border bg-card p-3 text-xs outline-none focus:border-primary"
              />
            </div>

            <Button
              type="submit"
              size="sm"
              className="bg-primary text-primary-foreground font-semibold"
            >
              Submit Return Request
            </Button>
          </form>
        </div>
      )}

      {/* Return Requests History */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
        <h3 className="font-display text-base font-bold">Return Status & History</h3>
        {returnOrders.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">No returns requested yet.</p>
        ) : (
          <div className="mt-4 divide-y divide-border/60">
            {returnOrders.map((o) => (
              <div key={o.id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-mono text-xs font-bold text-foreground">Order #{o.id}</div>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 uppercase">
                    {o.returnRequest?.status || o.status}
                  </span>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Reason: <strong className="text-foreground">{o.returnRequest?.reason}</strong>
                  {o.returnRequest?.comments && ` — "${o.returnRequest.comments}"`}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  Requested on{" "}
                  {new Date(o.returnRequest?.requestedAt || o.createdAt).toLocaleDateString(
                    "en-IN",
                  )}{" "}
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

// -------------------------------------------------------------
// TAB 8: REVIEWS & RATINGS
// -------------------------------------------------------------

function ReviewsTab({ orders }: { orders: Order[] }) {
  const [rating, setRating] = useState(5);
  const [headline, setHeadline] = useState("");
  const [comment, setComment] = useState("");
  const reviews = store.reviews;

  // Products available to review
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
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
        <h2 className="font-display text-xl font-bold">My Reviews & Customer Ratings</h2>
        <p className="text-xs text-muted-foreground">
          Rate your purchased farm produce and share feedback with the community
        </p>
      </div>

      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
        <h3 className="font-display text-base font-bold">Write a Verified Buyer Review</h3>
        <form onSubmit={handleAddReview} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground">
              Select Rating
            </label>
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
                      star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-xs font-bold text-foreground">
                {rating} out of 5 stars
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground">
              Review Headline
            </label>
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. Incredibly sweet and juicy apples!"
              className="mt-1 h-9 w-full rounded-xl border border-border px-3 text-xs outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground">
              Detailed Review
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you like or dislike? How was the packaging & delivery speed?"
              className="mt-1 h-24 w-full rounded-xl border border-border p-3 text-xs outline-none focus:border-primary"
              required
            />
          </div>

          <Button
            type="submit"
            size="sm"
            className="bg-primary text-primary-foreground font-semibold"
          >
            Post Customer Review
          </Button>
        </form>
      </div>

      {/* Review History */}
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
        <h3 className="font-display text-base font-bold">
          My Submitted Reviews ({reviews.length})
        </h3>
        {reviews.length === 0 ? (
          <p className="mt-2 text-xs text-muted-foreground">No reviews submitted yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="font-bold text-foreground text-sm">{r.headline}</span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{r.comment}</p>
                <div className="mt-2 flex items-center gap-2 text-[11px] text-emerald-600">
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

// -------------------------------------------------------------
// TAB 9: NOTIFICATIONS
// -------------------------------------------------------------

function NotificationsTab({ notifications }: { notifications: store["notifications"] }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
        <div>
          <h2 className="font-display text-xl font-bold">Notification Center</h2>
          <p className="text-xs text-muted-foreground">
            Real-time alerts regarding your orders, dispatch updates and rewards
          </p>
        </div>
        <button
          onClick={() => store.markAllNotificationsRead()}
          className="text-xs font-bold text-primary hover:underline"
        >
          Mark all as read
        </button>
      </div>

      <div className="rounded-3xl border border-border/80 bg-card divide-y divide-border/60 overflow-hidden shadow-xs">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            No notifications at the moment.
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => store.markNotificationRead(n.id)}
              className={`flex items-start gap-4 p-5 cursor-pointer transition ${
                n.read ? "bg-card" : "bg-emerald-500/5 font-medium"
              }`}
            >
              <div
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                  n.type === "shipment"
                    ? "bg-blue-100 text-blue-600"
                    : n.type === "order"
                      ? "bg-emerald-100 text-emerald-600"
                      : "bg-amber-100 text-amber-600"
                }`}
              >
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-foreground">{n.title}</h4>
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(n.createdAt).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}

// -------------------------------------------------------------
// TAB 10: MY PROFILE & SETTINGS
// -------------------------------------------------------------

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
      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
        <h2 className="font-display text-xl font-bold">Personal Information</h2>
        <p className="text-xs text-muted-foreground">
          Manage your identity, phone number, and security credentials
        </p>

        <form onSubmit={handleSaveProfile} className="mt-6 max-w-lg space-y-4">
          <label className="block text-xs font-semibold">
            Full Name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-xs outline-none focus:border-primary"
              required
            />
          </label>

          <label className="block text-xs font-semibold">
            Email Address (Verified)
            <input
              value={user?.email || ""}
              disabled
              className="mt-1 h-10 w-full rounded-xl border border-border bg-muted/50 px-3 text-xs text-muted-foreground outline-none"
            />
          </label>

          <label className="block text-xs font-semibold">
            Phone Number
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-xs outline-none focus:border-primary"
              required
            />
          </label>

          <Button
            type="submit"
            size="sm"
            className="bg-primary text-primary-foreground font-semibold"
          >
            Save Profile Changes
          </Button>
        </form>
      </div>

      <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
        <h3 className="font-display text-base font-bold">Change Password</h3>
        <p className="text-xs text-muted-foreground">Ensure your account uses a strong password</p>

        <form onSubmit={handleChangePassword} className="mt-4 max-w-lg space-y-4">
          <label className="block text-xs font-semibold">
            New Password
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-xs outline-none focus:border-primary"
            />
          </label>

          <label className="block text-xs font-semibold">
            Confirm New Password
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 h-10 w-full rounded-xl border border-border px-3 text-xs outline-none focus:border-primary"
            />
          </label>

          <Button type="submit" size="sm" variant="outline" className="font-semibold">
            Update Password
          </Button>
        </form>
      </div>
    </motion.div>
  );
}
