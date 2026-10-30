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
// SEED DATA
// -------------------------------------------------------------

const DEFAULT_USERS: User[] = [
  {
    id: "user-demo-customer",
    name: "Aarav Sharma",
    email: "aarav.sharma@example.com",
    phone: "+91 98765 43210",
    role: "customer",
    isVerified: true,
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    createdAt: "2026-01-15T10:00:00Z",
  },
  {
    id: "user-demo-admin",
    name: "Priyadarshan (Admin)",
    email: "admin@basketo.in",
    phone: "+91 98111 22334",
    role: "admin",
    isVerified: true,
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    createdAt: "2025-11-01T10:00:00Z",
  },
];

const DEFAULT_ADDRESSES: Address[] = [
  {
    id: "addr-1",
    userId: "user-demo-customer",
    name: "Aarav Sharma",
    phone: "+91 98765 43210",
    houseNo: "Flat 402, Green Towers",
    street: "12th Main, 4th Block, Koramangala",
    landmark: "Near Sony World Signal",
    city: "Bangalore",
    state: "Karnataka",
    pinCode: "560034",
    type: "home",
    isDefault: true,
  },
  {
    id: "addr-2",
    userId: "user-demo-customer",
    name: "Aarav Sharma (Office)",
    phone: "+91 98765 43210",
    houseNo: "7th Floor, Tech Hub",
    street: "Outer Ring Road, Bellandur",
    landmark: "Ecospace IT Park",
    city: "Bangalore",
    state: "Karnataka",
    pinCode: "560103",
    type: "work",
    isDefault: false,
  },
];

const DEFAULT_COUPONS: Coupon[] = [
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

const DEFAULT_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    userId: "user-demo-customer",
    title: "Order Shipped! 🚀",
    message: "Your order #OD-8921820 has been dispatched via Shiprocket Express.",
    type: "shipment",
    link: "/account?tab=orders",
    read: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "notif-2",
    userId: "user-demo-customer",
    title: "Super Coin Rewards Credited",
    message: "You earned 40 SuperCoins on your recent fresh harvest order.",
    type: "promo",
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
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
      location: "Online / Bangalore Web Server",
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
      location: "Koramangala Fulfillment Center, Bangalore",
      desc: "Items assigned to packing line and quality inspection passed.",
      hoursAgo: 24,
    },
    {
      status: "PACKED",
      location: "Koramangala Fulfillment Center, Bangalore",
      desc: "Eco-friendly thermal insulated box sealed with security tamper tape.",
      hoursAgo: 18,
    },
    {
      status: "SHIPPED",
      location: "Shiprocket Logistics Hub, Bangalore South",
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
      location: "HSR Sector 2 Delivery Center",
      desc: "Shipment arrived at your local neighborhood dispatch station.",
      hoursAgo: 3,
    },
    {
      status: "OUT_FOR_DELIVERY",
      location: "Koramangala Delivery Route #4",
      desc: "Delivery executive Suresh K (+91 98450 11223) is en route with your package.",
      hoursAgo: 0.5,
    },
    {
      status: "DELIVERED",
      location: "Customer Doorstep, Bangalore 560034",
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
    currentLocation: steps[currentLevel]?.location || "Bangalore Central Hub",
    estimatedDeliveryDate: estDate.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    }),
    daysRemaining: currentStatus === "delivered" ? 0 : 1,
    events,
  };
}

const DEFAULT_ORDERS: Order[] = [
  {
    id: "OD-90412849",
    userId: "user-demo-customer",
    customerName: "Aarav Sharma",
    customerEmail: "aarav.sharma@example.com",
    customerPhone: "+91 98765 43210",
    items: [
      {
        id: "item-1",
        productId: "1",
        name: "Shimla Crisp Red Apples",
        slug: "shimla-apples",
        price: 249,
        quantity: 2,
        image:
          "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80",
        unit: "1 kg pack",
        brand: "Farm Fresh",
      },
      {
        id: "item-2",
        productId: "2",
        name: "Organic Farm Avocados",
        slug: "organic-avocados",
        price: 199,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&auto=format&fit=crop&q=80",
        unit: "2 pcs pack",
        brand: "Freshly Harvest",
      },
    ],
    subtotal: 697,
    deliveryFee: 0,
    discount: 50,
    total: 647,
    paymentMethod: "razorpay",
    paymentStatus: "paid",
    transactionId: "pay_Rzp91823901",
    shippingAddress: DEFAULT_ADDRESSES[0],
    status: "out_for_delivery",
    shipment: createShipmentTimeline("OD-90412849", "out_for_delivery"),
    createdAt: new Date(Date.now() - 3600000 * 26).toISOString(),
    canCancel: false,
    canReturn: false,
  },
  {
    id: "OD-88204911",
    userId: "user-demo-customer",
    customerName: "Aarav Sharma",
    customerEmail: "aarav.sharma@example.com",
    customerPhone: "+91 98765 43210",
    items: [
      {
        id: "item-3",
        productId: "3",
        name: "Cold-Pressed Virgin Coconut Oil",
        slug: "cold-pressed-coconut-oil",
        price: 499,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=400&auto=format&fit=crop&q=80",
        unit: "500 ml glass bottle",
        brand: "Pure Roots",
      },
      {
        id: "item-4",
        productId: "4",
        name: "Artisan Sourdough Country Loaf",
        slug: "artisan-sourdough",
        price: 160,
        quantity: 1,
        image:
          "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80",
        unit: "400 g",
        brand: "Bakehouse",
      },
    ],
    subtotal: 659,
    deliveryFee: 40,
    discount: 0,
    total: 699,
    paymentMethod: "cod",
    paymentStatus: "paid",
    transactionId: "COD-VERIFIED-9821",
    shippingAddress: DEFAULT_ADDRESSES[0],
    status: "delivered",
    deliveredAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    shipment: createShipmentTimeline("OD-88204911", "delivered"),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    canCancel: false,
    canReturn: true,
  },
];

// -------------------------------------------------------------
// LOCAL STORAGE STORE MANAGEMENT
// -------------------------------------------------------------

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

  private init() {
    this.currentUser = getStorage<User | null>("user", DEFAULT_USERS[0]);
    this.addresses = getStorage<Address[]>("addresses", DEFAULT_ADDRESSES);
    this.orders = getStorage<Order[]>("orders", DEFAULT_ORDERS);
    this.coupons = getStorage<Coupon[]>("coupons", DEFAULT_COUPONS);
    this.notifications = getStorage<NotificationItem[]>("notifications", DEFAULT_NOTIFICATIONS);
    this.wishlist = getStorage<string[]>("wishlist", ["1", "4"]);
    this.reviews = getStorage<Review[]>("reviews", []);
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  // --- AUTH METHODS ---
  setCurrentUser(user: User | null) {
    this.currentUser = user;
    setStorage("user", user);
    this.notify();
  }

  switchUser(role: "customer" | "admin") {
    const target = DEFAULT_USERS.find((u) => u.role === role) || DEFAULT_USERS[0];
    this.setCurrentUser(target);
    return target;
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
    setStorage("addresses", this.addresses);
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
    setStorage("addresses", this.addresses);
    this.notify();
  }

  deleteAddress(id: string) {
    this.addresses = this.addresses.filter((a) => a.id !== id);
    if (this.addresses.length > 0 && !this.addresses.some((a) => a.isDefault)) {
      this.addresses[0].isDefault = true;
    }
    setStorage("addresses", this.addresses);
    this.notify();
  }

  setDefaultAddress(id: string) {
    this.addresses = this.addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    setStorage("addresses", this.addresses);
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
    setStorage("wishlist", this.wishlist);
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
    setStorage("orders", this.orders);

    // Trigger confirmation notification
    this.addNotification({
      title: "Order Confirmed 🎉",
      message: `Your order #${orderId} of ₹${Math.round(params.total)} has been placed successfully!`,
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

    setStorage("orders", this.orders);

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

    setStorage("orders", this.orders);

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

    setStorage("orders", this.orders);

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

    setStorage("orders", this.orders);

    this.addNotification({
      title: "Return Approved! 💳",
      message: `Return for order #${orderId} approved. ₹${order.total} has been refunded.`,
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
    setStorage("notifications", this.notifications);
    this.notify();
  }

  markAllNotificationsRead() {
    this.notifications = this.notifications.map((n) => ({ ...n, read: true }));
    setStorage("notifications", this.notifications);
    this.notify();
  }

  markNotificationRead(id: string) {
    this.notifications = this.notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setStorage("notifications", this.notifications);
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
    setStorage("reviews", this.reviews);
    this.notify();
    return newRev;
  }
}

export const store = StoreManager.getInstance();
