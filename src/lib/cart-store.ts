import { useSyncExternalStore } from "react";

export type CartItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  image: string;
  unit: string;
  quantity: number;
};

// Per-user storage so one account can never see another's cart.
function storageKey(userId?: string | null) {
  return userId ? `freshly_cart_v1_${userId}` : "freshly_cart_v1_guest";
}

const listeners = new Set<() => void>();
let items: CartItem[] = [];

let currentUserId: string | null = null;

function load(userId: string | null) {
  currentUserId = userId;
  if (typeof window === "undefined") {
    items = [];
    return;
  }
  try {
    const raw = localStorage.getItem(storageKey(userId));
    items = raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("Failed to load cart from storage", err);
    items = [];
  }
  listeners.forEach((l) => l());
}

function persist() {
  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey(currentUserId), JSON.stringify(items));
  }
  listeners.forEach((l) => l());
}

export const cart = {
  subscribe(cb: () => void) {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  getSnapshot(): CartItem[] {
    return items;
  },
  /** Switch the cart to a different user (login / logout / account switch). */
  setUser(userId: string | null) {
    if (userId === currentUserId) return;
    load(userId);
  },
  add(item: Omit<CartItem, "quantity">, qty = 1) {
    const existing = items.find((i) => i.id === item.id);
    if (existing) {
      items = items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + qty } : i));
    } else {
      items = [...items, { ...item, quantity: qty }];
    }
    persist();
  },
  remove(id: string) {
    items = items.filter((i) => i.id !== id);
    persist();
  },
  setQty(id: string, qty: number) {
    if (qty <= 0) return cart.remove(id);
    items = items.map((i) => (i.id === id ? { ...i, quantity: qty } : i));
    persist();
  },
  clear() {
    items = [];
    persist();
  },
};

// Initialise with no user (guest) at app start.
if (typeof window !== "undefined") {
  load(null);
}

export function useCart() {
  const snap = useSyncExternalStore(cart.subscribe, cart.getSnapshot, () => items);
  const subtotal = snap.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = snap.reduce((s, i) => s + i.quantity, 0);
  return { items: snap, subtotal, count };
}