import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  Leaf,
  Plus,
  Trash2,
  Pencil,
  Truck,
  RotateCcw,
  Tag,
  Shield,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { store, type Order, type TrackingEvent } from "@/lib/flipkart-store";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin Portal — Basketo Operations" }] }),
  component: AdminPage,
});

type AdminTab = "overview" | "orders" | "products" | "returns" | "coupons" | "customers";

function AdminPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<AdminTab>("overview");

  // Subscribe to live store
  const currentStore = useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store,
  );

  const orders = currentStore.orders;
  const coupons = currentStore.coupons;
  const currentUser = currentStore.currentUser;

  // Local state for shipment dispatch modal
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [selectedOrderForDispatch, setSelectedOrderForDispatch] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<Order["status"]>("shipped");
  const [newLocation, setNewLocation] = useState("Koramangala Sorting Hub, Bangalore");
  const [newDescription, setNewDescription] = useState("Package scanned and departed facility");

  // New coupon modal
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [discountVal, setDiscountVal] = useState(50);
  const [minOrder, setMinOrder] = useState(499);
  const [couponType, setCouponType] = useState<"flat" | "percent">("flat");

  // Order search
  const [orderSearch, setOrderSearch] = useState("");

  // Key metrics
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + o.total, 0);
  const totalOrders = orders.length;
  const deliveredCount = orders.filter((o) => o.status === "delivered").length;
  const pendingCount = orders.filter(
    (o) => o.status !== "delivered" && o.status !== "cancelled" && o.status !== "returned",
  ).length;
  const returnsCount = orders.filter((o) => o.returnRequest).length;

  function handleDispatchEvent(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedOrderForDispatch) return;

    store.updateOrderStatus(selectedOrderForDispatch.id, newStatus, newLocation, newDescription);
    toast.success(`Shipment milestone dispatched for Order #${selectedOrderForDispatch.id}!`);
    setDispatchModalOpen(false);
  }

  function handleAddCoupon(e: React.FormEvent) {
    e.preventDefault();
    if (!newCode) return;

    store.coupons.push({
      id: `coup-${Date.now()}`,
      code: newCode.toUpperCase(),
      discountType: couponType,
      discountValue: discountVal,
      minOrder,
      expiryDate: "2026-12-31",
      description: `${couponType === "flat" ? `₹${discountVal}` : `${discountVal}%`} OFF on orders above ₹${minOrder}`,
    });
    toast.success(`Coupon ${newCode.toUpperCase()} created!`);
    setNewCode("");
    setCouponModalOpen(false);
  }

  return (
    <div className="min-h-screen bg-muted/20 text-foreground">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Admin Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/15 p-1 text-emerald-600">
                <Shield className="h-5 w-5" />
              </span>
              <h1 className="font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Store Operations & Logistics Center
              </h1>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Shiprocket courier dispatcher, order fulfillment, return approvals & inventory
              management
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/account"
              className="rounded-full border border-border bg-card px-4 py-2 text-xs font-bold text-foreground shadow-xs hover:bg-muted"
            >
              Switch to Customer View
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-border/60 pb-3">
          {[
            { id: "overview", label: "Overview & Analytics", icon: DollarSign },
            {
              id: "orders",
              label: "Order & Shipment Dispatcher",
              icon: Truck,
              badge: orders.length,
            },
            {
              id: "returns",
              label: "Returns & Refund Requests",
              icon: RotateCcw,
              badge: returnsCount,
            },
            { id: "coupons", label: "Coupon Discounts", icon: Tag, badge: coupons.length },
            { id: "customers", label: "Registered Customers", icon: Users },
          ].map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setTab(id as AdminTab)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
                tab === id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "border border-border/80 bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
              {badge !== undefined && badge > 0 && (
                <span className="rounded-full bg-white/20 px-1.5 py-0.2 text-[10px]">{badge}</span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW */}
        {tab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
                <div className="text-xs font-semibold text-muted-foreground">Gross Revenue</div>
                <div className="mt-2 font-display text-2xl font-black text-foreground">
                  ₹{Math.round(totalRevenue).toLocaleString("en-IN")}
                </div>
                <div className="mt-1 text-[11px] text-emerald-600 font-semibold">
                  +18% this week
                </div>
              </div>

              <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
                <div className="text-xs font-semibold text-muted-foreground">Total Orders</div>
                <div className="mt-2 font-display text-2xl font-black text-foreground">
                  {totalOrders}
                </div>
                <div className="mt-1 text-[11px] text-muted-foreground">From web & mobile app</div>
              </div>

              <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
                <div className="text-xs font-semibold text-muted-foreground">Active Dispatches</div>
                <div className="mt-2 font-display text-2xl font-black text-amber-600">
                  {pendingCount}
                </div>
                <div className="mt-1 text-[11px] text-amber-600 font-semibold">
                  In transit / out for delivery
                </div>
              </div>

              <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-xs">
                <div className="text-xs font-semibold text-muted-foreground">
                  Completed Deliveries
                </div>
                <div className="mt-2 font-display text-2xl font-black text-emerald-600">
                  {deliveredCount}
                </div>
                <div className="mt-1 text-[11px] text-emerald-600 font-semibold">
                  99.4% on-time SLA
                </div>
              </div>
            </div>

            {/* Recent Orders quick table */}
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
              <h2 className="font-display text-lg font-bold">Latest Incoming Orders</h2>
              <div className="mt-4 divide-y divide-border/60">
                {orders.slice(0, 5).map((o) => (
                  <div
                    key={o.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                  >
                    <div>
                      <div className="font-mono text-xs font-bold text-foreground">
                        Order #{o.id}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {o.customerName} • {o.items.length} items • {o.shippingAddress.city}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-display text-sm font-bold">₹{Math.round(o.total)}</div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">
                          {o.paymentMethod}
                        </span>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                          o.status === "delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {o.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ORDER & SHIPMENT DISPATCHER */}
        {tab === "orders" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/80 bg-card p-5 shadow-xs">
              <div>
                <h2 className="font-display text-xl font-bold">
                  Fulfillment & Shipment Dispatcher
                </h2>
                <p className="text-xs text-muted-foreground">
                  Update package status and broadcast live checkpoints directly to customer tracking
                  timelines
                </p>
              </div>

              <input
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                placeholder="Search by order ID or customer..."
                className="h-9 w-64 rounded-full border border-border bg-muted/40 px-3.5 text-xs outline-none focus:border-primary"
              />
            </div>

            <div className="space-y-4">
              {orders
                .filter(
                  (o) =>
                    !orderSearch ||
                    o.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
                    o.customerName.toLowerCase().includes(orderSearch.toLowerCase()),
                )
                .map((o) => (
                  <div
                    key={o.id}
                    className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-foreground">
                            Order #{o.id}
                          </span>
                          <span className="rounded-full bg-muted px-2 py-0.2 text-[10px] font-bold uppercase">
                            {o.paymentMethod} ({o.paymentStatus})
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          Customer: <strong className="text-foreground">{o.customerName}</strong> (
                          {o.customerPhone}) • Destination: {o.shippingAddress.city} -{" "}
                          {o.shippingAddress.pinCode}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          value={o.status}
                          onChange={(e) => {
                            const stat = e.target.value as Order["status"];
                            store.updateOrderStatus(o.id, stat);
                            toast.success(`Order #${o.id} status updated to ${stat}`);
                          }}
                          className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-bold outline-none uppercase"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="packed">Packed</option>
                          <option value="shipped">Shipped</option>
                          <option value="in_transit">In Transit</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>

                        <button
                          onClick={() => {
                            setSelectedOrderForDispatch(o);
                            setNewStatus(o.status);
                            setDispatchModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700"
                        >
                          <Truck className="h-3.5 w-3.5" />
                          <span>Dispatch Checkpoint</span>
                        </button>
                      </div>
                    </div>

                    {/* Order details & items */}
                    <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Items: </span>
                        <span className="font-semibold text-foreground">
                          {o.items.map((i) => `${i.name} (×${i.quantity})`).join(", ")}
                        </span>
                      </div>

                      <div className="font-display text-sm font-bold">
                        Total Invoice: ₹{Math.round(o.total).toLocaleString("en-IN")}
                      </div>
                    </div>

                    {/* Live Tracking Checkpoints Summary */}
                    <div className="rounded-2xl border border-border/60 bg-muted/20 p-3 text-xs">
                      <div className="font-semibold text-muted-foreground flex items-center justify-between">
                        <span>
                          Shiprocket AWB: {o.shipment.awbNumber} • {o.shipment.courierName}
                        </span>
                        <span className="text-emerald-600 font-bold">
                          Current Hub: {o.shipment.currentLocation}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2 text-[11px]">
                        {o.shipment.events.map((e, idx) => (
                          <span
                            key={e.id}
                            className="inline-flex items-center gap-1 rounded-full bg-card border border-border px-2 py-0.5 font-medium"
                          >
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            {e.status}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 3: RETURNS REVIEW */}
        {tab === "returns" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
              <h2 className="font-display text-xl font-bold">Customer Return & Refund Requests</h2>
              <p className="text-xs text-muted-foreground">
                Approve or reject customer requests to initiate automated payment gateway refunds
              </p>
            </div>

            <div className="space-y-4">
              {returnsCount === 0 ? (
                <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center text-xs text-muted-foreground">
                  No return requests pending review.
                </div>
              ) : (
                orders
                  .filter((o) => o.returnRequest)
                  .map((o) => (
                    <div
                      key={o.id}
                      className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs space-y-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="font-mono text-xs font-bold text-foreground">
                            Order #{o.id}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Customer: {o.customerName} ({o.customerEmail})
                          </div>
                        </div>

                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold uppercase text-amber-800">
                          {o.returnRequest?.status}
                        </span>
                      </div>

                      <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-xs">
                        <div className="font-semibold text-foreground">
                          Reason: {o.returnRequest?.reason}
                        </div>
                        {o.returnRequest?.comments && (
                          <div className="mt-1 text-muted-foreground">
                            "{o.returnRequest.comments}"
                          </div>
                        )}
                        <div className="mt-2 text-muted-foreground">
                          Refund Amount: <strong className="text-foreground">₹{o.total}</strong>{" "}
                          (Payment Method: {o.paymentMethod})
                        </div>
                      </div>

                      {o.returnRequest?.status === "pending" && (
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              store.approveReturn(o.id);
                              toast.success(
                                `Return for order #${o.id} approved and refund issued!`,
                              );
                            }}
                            className="bg-emerald-600 text-white font-bold"
                          >
                            Approve Return & Refund
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: COUPONS */}
        {tab === "coupons" && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
              <div>
                <h2 className="font-display text-xl font-bold">Discount Coupons & Offers</h2>
                <p className="text-xs text-muted-foreground">
                  Manage active discount vouchers for cart checkout
                </p>
              </div>

              <button
                onClick={() => setCouponModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground shadow-xs"
              >
                <Plus className="h-4 w-4" /> Create Coupon
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className="rounded-3xl border border-border/80 bg-card p-5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-base font-extrabold text-foreground">
                      {c.code}
                    </span>
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-bold text-emerald-600">
                      {c.discountType === "flat"
                        ? `₹${c.discountValue} FLAT`
                        : `${c.discountValue}% OFF`}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{c.description}</p>
                  <div className="mt-4 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
                    Min order: ₹{c.minOrder} • Valid until {c.expiryDate}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: CUSTOMERS */}
        {tab === "customers" && (
          <div className="space-y-6">
            <div className="rounded-3xl border border-border/80 bg-card p-6 shadow-xs">
              <h2 className="font-display text-xl font-bold">Registered Customers</h2>
              <p className="text-xs text-muted-foreground">
                Customer identity, contact information, and lifetime value
              </p>
            </div>

            <div className="rounded-3xl border border-border/80 bg-card overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/30 font-semibold text-muted-foreground">
                  <tr>
                    <th className="p-4">Customer Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr className="hover:bg-muted/20">
                    <td className="p-4 font-bold text-foreground">Aarav Sharma</td>
                    <td className="p-4 text-muted-foreground">aarav.sharma@example.com</td>
                    <td className="p-4 font-mono text-muted-foreground">+91 98765 43210</td>
                    <td className="p-4 uppercase font-semibold">Customer</td>
                    <td className="p-4">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                        Verified
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-muted/20">
                    <td className="p-4 font-bold text-foreground">Priyadarshan (Admin)</td>
                    <td className="p-4 text-muted-foreground">admin@basketo.in</td>
                    <td className="p-4 font-mono text-muted-foreground">+91 98111 22334</td>
                    <td className="p-4 uppercase font-semibold text-primary">Admin</td>
                    <td className="p-4">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                        Verified
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* DISPATCH TRACKING CHECKPOINT MODAL */}
      <Dialog open={dispatchModalOpen} onOpenChange={setDispatchModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Broadcast Courier Checkpoint</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleDispatchEvent} className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              Posting a checkpoint for Order{" "}
              <strong className="text-foreground">#{selectedOrderForDispatch?.id}</strong>. This
              milestone will appear instantly on the customer's visual shipment timeline.
            </p>

            <div>
              <label className="block text-xs font-semibold">Milestone Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as Order["status"])}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-xs outline-none focus:border-primary"
              >
                <option value="processing">PROCESSING (At Sorting Facility)</option>
                <option value="packed">PACKED (Thermal Box Sealed)</option>
                <option value="shipped">SHIPPED (Handed to Carrier)</option>
                <option value="in_transit">IN TRANSIT (On Line Haul Vehicle)</option>
                <option value="out_for_delivery">OUT FOR DELIVERY (With Local Rider)</option>
                <option value="delivered">DELIVERED (Doorstep Delivery Complete)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold">Checkpoint Location</label>
              <input
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="e.g. HSR Sector 2 Hub, Bangalore"
                className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-xs outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold">Checkpoint Description</label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="e.g. Package arrived at local delivery hub, rider Suresh assigned."
                className="mt-1 h-20 w-full rounded-xl border border-border bg-card p-3 text-xs outline-none focus:border-primary"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDispatchModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" className="bg-emerald-600 text-white font-bold">
                Broadcast Event
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* CREATE COUPON MODAL */}
      <Dialog open={couponModalOpen} onOpenChange={setCouponModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Discount Voucher</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddCoupon} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold">Coupon Code</label>
              <input
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                placeholder="e.g. MEGA100"
                className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-xs font-mono uppercase outline-none focus:border-primary"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold">Discount Type</label>
                <select
                  value={couponType}
                  onChange={(e) => setCouponType(e.target.value as "flat" | "percent")}
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-xs outline-none focus:border-primary"
                >
                  <option value="flat">Flat Amount (₹)</option>
                  <option value="percent">Percentage (%)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold">Discount Value</label>
                <input
                  type="number"
                  value={discountVal}
                  onChange={(e) => setDiscountVal(Number(e.target.value))}
                  className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-xs outline-none focus:border-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold">Minimum Order Spend (₹)</label>
              <input
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(Number(e.target.value))}
                className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-xs outline-none focus:border-primary"
                required
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCouponModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="bg-primary text-primary-foreground font-bold"
              >
                Save Coupon
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
