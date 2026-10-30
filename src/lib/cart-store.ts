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

const STORAGE_KEY = "freshly_cart_v1";
const listeners = new Set<() => void>();
let items: CartItem[] = [];

function load() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) items = JSON.parse(raw);
  } catch (err) {
    console.warn("Failed to load cart from storage", err);
  }
}
load();

function persist() {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
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

export function useCart() {
  const snap = useSyncExternalStore(cart.subscribe, cart.getSnapshot, () => items);
  const subtotal = snap.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = snap.reduce((s, i) => s + i.quantity, 0);
  return { items: snap, subtotal, count };
}
