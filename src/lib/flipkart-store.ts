// Advanced Flipkart-Style E-Commerce Data Layer & State Store
// Features: Local-first persistence, real-time event simulation, Shiprocket-style courier tracking

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "customer" | "admin";
  isVerified: boolean;
  avatar: string;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  houseNo: string;
  street: string;
  landmark?: string;
  city: string;
  state: string;
  pinCode: string;
  type: "home" | "work" | "other";
  isDefault: boolean;
}

export interface TrackingEvent {
  id: string;
  status:
    | "ORDER_PLACED"
    | "PAYMENT_CONFIRMED"
    | "PROCESSING"
    | "PACKED"
    | "SHIPPED"
    | "IN_TRANSIT"
    | "LOCAL_HUB"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "CANCELLED";
  location: string;
  description: string;
  timestamp: string;
  completed: boolean;
}

export interface ShipmentInfo {
  trackingId: string;
  courierName: string;
  courierUrl: string;
  awbNumber: string;
  currentLocation: string;
  estimatedDeliveryDate: string;
  daysRemaining: number;
  events: TrackingEvent[];
}

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  quantity: number;
  image: string;
  unit?: string;
  brand?: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: "razorpay" | "cod" | "upi" | "card";
  paymentStatus: "paid" | "pending" | "failed" | "refunded";
  transactionId?: string;
  shippingAddress: Address;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "packed"
    | "shipped"
    | "in_transit"
    | "out_for_delivery"
    | "delivered"
    | "cancelled"
    | "returned";
  shipment: ShipmentInfo;
  createdAt: string;
  deliveredAt?: string;
  canCancel: boolean;
  canReturn: boolean;
  returnRequest?: {
    id: string;
    reason: string;
    comments?: string;
    images?: string[];
    status: "pending" | "approved" | "rejected" | "refunded";
    requestedAt: string;
  };
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  headline: string;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  helpfulCount: number;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "flat" | "percent";
  discountValue: number;
  minOrder: number;
  maxDiscount?: number;
  expiryDate: string;
  description: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "order" | "shipment" | "promo" | "auth";
  link?: string;
  read: boolean;
  createdAt: string;
}

// -------------------------------------------------------------
// SEED DATA (DISABLED — real-website mode)
// No demo users / orders / notifications are seeded anymore.
// Every account, order, and notification is created by a real
// signup / purchase and persisted in MongoDB.
// -------------------------------------------------------------

export const DEFAULT_USERS: User[] = [];

export const DEFAULT_ADDRESSES: Address[] = [];
export const DEFAULT_ORDERS: Order[] = [];
export const DEFAULT_NOTIFICATIONS: NotificationItem[] = [];
export const DEFAULT_COUPONS: Coupon[] = [
  {
    id: "coup-1",
    code: "FLIPKART50",
    discountType: "flat",
    discountValue: 50,
    minOrder: 499,
    expiryDate: "2026-12-31",
    description: "Flat ₹50 OFF on orders above ₹499",
  },
  {
    id: "coup-2",
    code: "SUPER100",
    discountType: "flat",
    discountValue: 100,
    minOrder: 999,
    expiryDate: "2026-12-31",
    description: "Instant ₹100 discount on orders above ₹999",
  },
  {
    id: "coup-3",
    code: "FREESHIP",
    discountType: "flat",
    discountValue: 40,
    minOrder: 299,
    expiryDate: "2026-12-31",
    description: "Free Delivery on orders above ₹299",
  },
  {
    id: "coup-4",
    code: "FESTIVE15",
    discountType: "percent",
    discountValue: 15,
    minOrder: 1499,
    maxDiscount: 300,
    expiryDate: "2026-12-31",
    description: "15% OFF up to ₹300 on festive specials",
  },
];

// Helper to construct a Shiprocket tracking timeline
export function createShipmentTimeline(
  orderId: string,
  currentStatus: Order["status"],
): ShipmentInfo {
  const now = Date.now();
  const trackingId = `SR-${orderId.replace(/[^0-9]/g, "").slice(0, 8) || "8849201"}`;
  const awbNumber = `AWB-${Math.floor(100000000 + Math.random() * 900000000)}`;

  const steps: Array<{
    status: TrackingEvent["status"];
    location: string;
    desc: string;
    hoursAgo: number;
  }> = [
    {
      status: "ORDER_PLACED",
      location: "Online / Bhubaneswar Web Server",
      desc: "Order verified and payment authorized successfully.",
      hoursAgo: 28,
    },
    {
      status: "PAYMENT_CONFIRMED",
      location: "Razorpay Payment Gateway",
      desc: "Payment of invoice confirmed. Merchant notified.",
      hoursAgo: 27.5,
    },
    {
      status: "PROCESSING",
      location: "Khandagiri Fulfillment Center, Bhubaneswar",
      desc: "Items assigned to packing line and quality inspection passed.",
      hoursAgo: 24,
    },
    {
      status: "PACKED",
      location: "Khandagiri Fulfillment Center, Bhubaneswar",
      desc: "Eco-friendly thermal insulated box sealed with security tamper tape.",
      hoursAgo: 18,
    },
    {
      status: "SHIPPED",
      location: "Shiprocket Logistics Hub, Bhubaneswar South",
      desc: "Handed over to Shiprocket Express courier partner.",
      hoursAgo: 14,
    },
    {
      status: "IN_TRANSIT",
      location: "Outer Ring Road Transit Terminal",
      desc: "Vehicle in transit to local delivery hub.",
      hoursAgo: 8,
    },
    {
      status: "LOCAL_HUB",
      location: "Khandagiri Sector 2 Delivery Center",
      desc: "Shipment arrived at your local neighborhood dispatch station.",
      hoursAgo: 3,
    },
    {
      status: "OUT_FOR_DELIVERY",
      location: "Khandagiri Delivery Route #4",
      desc: "Delivery executive Suresh K (+91 98450 11223) is en route with your package.",
      hoursAgo: 0.5,
    },
    {
      status: "DELIVERED",
      location: "Customer Doorstep, Bhubaneswar 751019",
      desc: "Package handed over to customer. OTP verified.",
      hoursAgo: 0,
    },
  ];

  // Map order status to highest step index
  const statusLevels: Record<Order["status"], number> = {
    pending: 0,
    confirmed: 1,
    processing: 2,
    packed: 3,
    shipped: 4,
    in_transit: 5,
    out_for_delivery: 7,
    delivered: 8,
    cancelled: 0,
    returned: 0,
  };

  const currentLevel = statusLevels[currentStatus] ?? 4;

  const events: TrackingEvent[] = steps.slice(0, currentLevel + 1).map((s, idx) => ({
    id: `evt-${idx}`,
    status: s.status,
    location: s.location,
    description: s.desc,
    timestamp: new Date(now - s.hoursAgo * 3600000).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }),
    completed: true,
  }));

  const estDate = new Date(now + 86400000 * (currentStatus === "delivered" ? 0 : 1));

  return {
    trackingId,
    courierName: "Shiprocket Express (BlueDart Partner)",
    courierUrl: `https://shiprocket.co/tracking/${trackingId}`,
    awbNumber,
    currentLocation: steps[currentLevel]?.location || "Bhubaneswar Central Hub",
    estimatedDeliveryDate: estDate.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
    daysRemaining: currentStatus === "delivered" ? 0 : 1,
    events,
  };
}

// -------------------------------------------------------------
// PERSISTENCE: MongoDB (server API) — client-safe fetch only.
// The mongodb driver never loads in the browser; all DB traffic goes
// through /api/mongo-sync so the client bundle stays clean.
// -------------------------------------------------------------

async function loadCollection<T>(name: string, fallback: T): Promise<T> {
  try {
    const id = StoreManager.instance?.currentUser?.id || "guest";
    const res = await fetch(`/api/mongo-sync?userId=${encodeURIComponent(id)}`);
    if (!res.ok) return fallback;
    const json = await res.json();
    return (json[name] ?? fallback) as T;
  } catch (err) {
    console.warn(`[mongo] load ${name} failed, using fallback`, err);
    return fallback;
  }
}

async function saveCollection(name: string, rows: unknown[]): Promise<void> {
  const s = StoreManager.instance;
  if (!s) return;
  // Guests (pre-signup) persist under the shared "guest" bucket so account
  // registration still reaches MongoDB before any user session exists.
  const id = s.currentUser?.id || "guest";
  try {
    await fetch("/api/mongo-sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: id,
        data: {
          users: s.registeredUsers,
          coupons: s.coupons,
          addresses: s.addresses,
          orders: s.orders,
          notifications: s.notifications,
          wishlist: s.wishlist,
          reviews: s.reviews,
          [name]: rows,
        },
      }),
    });
  } catch (err) {
    console.warn(`[mongo] save ${name} failed`, err);
  }
}

/** Persist the whole store to MongoDB (debounced). */
let persistTimer: ReturnType<typeof setTimeout> | null = null;
function schedulePersist(s: StoreManager) {
  if (typeof window === "undefined") return;
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistTimer = null;
    saveCollection("users", s.registeredUsers);
    saveCollection("coupons", s.coupons);
    saveCollection("addresses", s.addresses);
    saveCollection("orders", s.orders);
    saveCollection("notifications", s.notifications);
    saveCollection("wishlist", s.wishlist);
    saveCollection("reviews", s.reviews);
  }, 400);
}

// Legacy localStorage helpers (used only as a fallback when MongoDB is down).
function getStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(`basketo_${key}`);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`basketo_${key}`, JSON.stringify(value));
  } catch (err) {
    console.warn("Storage save failed", err);
  }
}

// Global state container
export class StoreManager {
  private static instance: StoreManager;

  currentUser: User | null = null;
  addresses: Address[] = [];
  orders: Order[] = [];
  coupons: Coupon[] = [];
  notifications: NotificationItem[] = [];
  wishlist: string[] = []; // product IDs or slugs
  reviews: Review[] = [];
  /** Every account ever registered. Used to block duplicate emails/phones. */
  registeredUsers: User[] = [];

  private listeners: Set<() => void> = new Set();

  private constructor() {
    this.init();
  }

  static getInstance(): StoreManager {
    if (!StoreManager.instance) {
      StoreManager.instance = new StoreManager();
    }
    return StoreManager.instance;
  }

  /** Hydrate the in-memory store from MongoDB (via the server API). Safe to call repeatedly. */
  async hydrateFromMongo(): Promise<void> {
    const id = this.currentUser?.id;

    // Shared collections (coupons, registered users) load fully.
    this.coupons = await loadCollection("coupons", DEFAULT_COUPONS);
    const mongoUsers = await loadCollection("users", DEFAULT_USERS);
    // Merge: never let a Mongo hydration wipe accounts registered locally in
    // this browser (e.g. a signup that happened moments ago).
    const local = getStorage<User[]>("registered_users", []);
    const merged = new Map<string, User>();
    for (const u of [...mongoUsers, ...local]) {
      if (u?.id && !merged.has(u.id)) merged.set(u.id, u);
    }
    this.registeredUsers = [...merged.values()];
    setStorage("registered_users", this.registeredUsers);

    if (!id) {
      this.addresses = [];
      this.orders = [];
      this.notifications = [];
      this.wishlist = [];
      this.reviews = [];
      return;
    }

    {
      // Per-user collections are stored under a namespaced key inside a
      // single document so they survive reloads and stay isolated.
      this.addresses = await loadCollection("addresses", []);
      this.orders = await loadCollection("orders", []);
      this.notifications = await loadCollection("notifications", [
        {
          id: `ntf-welcome-${Date.now()}`,
          userId: id,
          title: "Welcome to Basketo!",
          message: "Your account is ready. Start shopping fresh groceries delivered in 15 minutes.",
          type: "auth",
          read: false,
          createdAt: new Date().toISOString(),
        },
      ]);
      this.wishlist = await loadCollection("wishlist", []);
      this.reviews = await loadCollection("reviews", []);
    }
    this.notify();
  }

  private init() {
    // REAL WEBSITE MODE — never auto-login. A visitor is always a guest
    // until they sign in / sign up themselves.
    this.currentUser = null;
    this.coupons = getStorage<Coupon[]>("coupons", DEFAULT_COUPONS);
    this.registeredUsers = getStorage<User[]>("registered_users", []);
    // Kick off the real MongoDB hydration in the background.
    if (typeof window !== "undefined") {
      this.hydrateFromMongo();
    }
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  /** Persist the current in-memory state to MongoDB (debounced). */
  private persist() {
    schedulePersist(this);
  }

  // --- AUTH METHODS ---
  setCurrentUser(user: User | null) {
    this.currentUser = user;
    setStorage("user", user);
    if (user) {
      // Track every distinct account so duplicate email/phone can be blocked later.
      if (!this.registeredUsers.some((u) => u.id === user.id)) {
        this.registeredUsers = [user, ...this.registeredUsers];
        setStorage("registered_users", this.registeredUsers);
      }
    }
    // Switch to the new account's MongoDB data (async, non-blocking).
    this.hydrateFromMongo();
    this.notify();
  }

  switchUser(role: "customer" | "admin") {
    // Demo account switching disabled in real-website mode.
    return this.currentUser;
  }

  /** Returns an existing user with the same email (case-insensitive) or phone, else null. */
  findExistingUser(email: string, phone: string): User | null {
    const e = (email || "").trim().toLowerCase();
    const p = (phone || "").trim();
    return (
      this.registeredUsers.find(
        (u) => u.email.toLowerCase() === e || (p && u.phone.trim() === p),
      ) || null
    );
  }

  /** Register a brand-new account. Returns the user, or null if credentials collide. */
  registerUser(user: Omit<User, "id" | "createdAt"> & { id?: string; createdAt?: string }): User | null {
    if (this.findExistingUser(user.email, user.phone)) return null;
    const newUser: User = {
      ...user,
      id: user.id || `user-${Date.now()}`,
      createdAt: user.createdAt || new Date().toISOString(),
    };
    this.registeredUsers = [newUser, ...this.registeredUsers];
    // Persist IMMEDIATELY and synchronously to localStorage so the account
    // survives even if the Mongo round-trip fails or a hydration races it.
    setStorage("registered_users", this.registeredUsers);
    // Then persist the full store to MongoDB (debounced, guest-bucket).
    this.persist();
    return newUser;
  }

  updateProfile(name: string, phone: string, avatar?: string) {
    if (!this.currentUser) return;
    this.currentUser = {
      ...this.currentUser,
      name,
      phone,
      avatar: avatar || this.currentUser.avatar,
    };
    setStorage("user", this.currentUser);
    this.persist();
    this.notify();
  }

  // --- ADDRESS METHODS ---
  addAddress(address: Omit<Address, "id" | "userId">): Address {
    const newAddr: Address = {
      ...address,
      id: `addr-${Date.now()}`,
      userId: this.currentUser?.id || "guest",
    };
    if (newAddr.isDefault) {
      this.addresses = this.addresses.map((a) => ({ ...a, isDefault: false }));
    }
    this.addresses = [newAddr, ...this.addresses];
    this.persist();
    this.notify();
    return newAddr;
  }

  updateAddress(id: string, updates: Partial<Address>) {
    this.addresses = this.addresses.map((a) => {
      if (a.id === id) {
        return { ...a, ...updates };
      }
      if (updates.isDefault) {
        return { ...a, isDefault: false };
      }
      return a;
    });
    this.persist();
    this.notify();
  }

  deleteAddress(id: string) {
    this.addresses = this.addresses.filter((a) => a.id !== id);
    if (this.addresses.length > 0 && !this.addresses.some((a) => a.isDefault)) {
      this.addresses[0].isDefault = true;
    }
    this.persist();
    this.notify();
  }

  setDefaultAddress(id: string) {
    this.addresses = this.addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    this.persist();
    this.notify();
  }

  // --- WISHLIST METHODS ---
  toggleWishlist(productId: string): boolean {
    const exists = this.wishlist.includes(productId);
    if (exists) {
      this.wishlist = this.wishlist.filter((id) => id !== productId);
    } else {
      this.wishlist = [...this.wishlist, productId];
    }
    this.persist();
    this.notify();
    return !exists;
  }

  isWishlisted(productId: string): boolean {
    return this.wishlist.includes(productId);
  }

  // --- ORDER METHODS ---
  createOrder(params: {
    items: OrderItem[];
    subtotal: number;
    deliveryFee: number;
    discount: number;
    total: number;
    paymentMethod: Order["paymentMethod"];
    shippingAddress: Address;
  }): Order {
    const orderId = `OD-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const newOrder: Order = {
      id: orderId,
      userId: this.currentUser?.id || "guest",
      customerName: params.shippingAddress.name || this.currentUser?.name || "Customer",
      customerEmail: this.currentUser?.email || "customer@example.com",
      customerPhone: params.shippingAddress.phone || this.currentUser?.phone || "",
      items: params.items,
      subtotal: params.subtotal,
      deliveryFee: params.deliveryFee,
      discount: params.discount,
      total: params.total,
      paymentMethod: params.paymentMethod,
      paymentStatus: params.paymentMethod === "cod" ? "pending" : "paid",
      transactionId:
        params.paymentMethod === "razorpay"
          ? `pay_rzp_${Date.now().toString(36)}`
          : `COD_${Date.now().toString(36).toUpperCase()}`,
      shippingAddress: params.shippingAddress,
      status: "confirmed",
      shipment: createShipmentTimeline(orderId, "confirmed"),
      createdAt: new Date().toISOString(),
      canCancel: true,
      canReturn: false,
    };

    this.orders = [newOrder, ...this.orders];
    this.persist();

    // Trigger confirmation notification
    this.addNotification({
      title: "Order Confirmed",
      message: `Your order #${orderId} of \u20b9${Math.round(params.total)} has been placed successfully!`,
      type: "order",
      link: `/account?tab=orders&orderId=${orderId}`,
    });

    this.notify();
    return newOrder;
  }

  cancelOrder(orderId: string, reason: string): boolean {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order || !order.canCancel) return false;

    order.status = "cancelled";
    order.canCancel = false;
    order.paymentStatus = order.paymentStatus === "paid" ? "refunded" : "failed";

    // Add cancelled tracking event
    order.shipment.events.push({
      id: `evt-${Date.now()}`,
      status: "CANCELLED",
      location: "Customer Portal",
      description: `Order cancelled by customer. Reason: ${reason}`,
      timestamp: new Date().toLocaleString("en-IN"),
      completed: true,
    });

    this.persist();

    this.addNotification({
      title: "Order Cancelled",
      message: `Order #${orderId} was cancelled. Any refund has been initiated to original payment method.`,
      type: "order",
    });

    this.notify();
    return true;
  }

  requestReturn(orderId: string, reason: string, comments?: string): boolean {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return false;

    order.returnRequest = {
      id: `ret-${Date.now()}`,
      reason,
      comments,
      status: "pending",
      requestedAt: new Date().toISOString(),
    };
    order.canReturn = false;

    this.persist();

    this.addNotification({
      title: "Return Request Submitted",
      message: `Your return request for order #${orderId} is being reviewed by our quality team.`,
      type: "order",
    });

    this.notify();
    return true;
  }

  // --- ADMIN METHODS ---
  updateOrderStatus(
    orderId: string,
    status: Order["status"],
    location?: string,
    description?: string,
  ) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return;

    order.status = status;
    order.shipment = createShipmentTimeline(orderId, status);

    if (location && description) {
      order.shipment.events.push({
        id: `evt-${Date.now()}`,
        status: status.toUpperCase() as TrackingEvent["status"],
        location,
        description,
        timestamp: new Date().toLocaleString("en-IN"),
        completed: true,
      });
      order.shipment.currentLocation = location;
    }

    if (status === "delivered") {
      order.deliveredAt = new Date().toISOString();
      order.canReturn = true;
      order.canCancel = false;
    }

    this.persist();

    this.addNotification({
      title: `Order #${orderId} update: ${status.replace("_", " ").toUpperCase()}`,
      message: description || `Your shipment is now ${status.replace("_", " ")}.`,
      type: "shipment",
      link: `/account?tab=orders&orderId=${orderId}`,
    });

    this.notify();
  }

  approveReturn(orderId: string) {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order || !order.returnRequest) return;

    order.returnRequest.status = "approved";
    order.status = "returned";
    order.paymentStatus = "refunded";

    this.persist();

    this.addNotification({
      title: "Return Approved!",
      message: `Return for order #${orderId} approved. Rs.${order.total} has been refunded.`,
      type: "order",
    });

    this.notify();
  }

  // --- NOTIFICATION METHODS ---
  addNotification(n: Omit<NotificationItem, "id" | "userId" | "read" | "createdAt">) {
    const item: NotificationItem = {
      ...n,
      id: `notif-${Date.now()}`,
      userId: this.currentUser?.id || "guest",
      read: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications = [item, ...this.notifications];
    this.persist();
    this.notify();
  }

  markAllNotificationsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    this.persist();
    this.notify();
  }

  markNotificationRead(id: string) {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    this.persist();
    this.notify();
  }

  // --- REVIEWS METHODS ---
  addReview(
    r: Omit<
      Review,
      "id" | "userId" | "userName" | "createdAt" | "helpfulCount" | "isVerifiedPurchase"
    >,
  ) {
    const newRev: Review = {
      ...r,
      id: `rev-${Date.now()}`,
      userId: this.currentUser?.id || "guest",
      userName: this.currentUser?.name || "Customer",
      isVerifiedPurchase: true,
      createdAt: new Date().toISOString(),
      helpfulCount: 0,
    };
    this.reviews = [newRev, ...this.reviews];
    this.persist();
    this.notify();
    return newRev;
  }
}

export const store = StoreManager.getInstance();
