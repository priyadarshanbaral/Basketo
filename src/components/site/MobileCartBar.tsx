import { Link, useRouterState } from "@tanstack/react-router";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/lib/cart-store";

export function MobileCartBar() {
  const { count, subtotal } = useCart();
  const routerState = useRouterState();
  const isCartPage = routerState.location.pathname === "/cart";

  // Only show when cart has items and not on the cart page itself
  if (count === 0 || isCartPage) return null;

  return (
    <div className="fixed bottom-16 left-3 right-3 z-30 block md:hidden transition-all duration-300 animate-in fade-in slide-in-from-bottom-3">
      <Link
        to="/cart"
        className="flex items-center justify-between rounded-2xl bg-slate-900/95 px-4 py-3 text-white shadow-xl shadow-slate-900/25 backdrop-blur-md border border-slate-700/60 transition active:scale-98"
      >
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-500 text-white font-black text-xs shadow-xs">
            {count}
          </div>
          <div>
            <div className="text-xs font-bold leading-tight">
              {count} {count === 1 ? "Item" : "Items"} in Cart
            </div>
            <div className="font-display text-sm font-black text-emerald-400">
              ₹{Math.round(subtotal).toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs">
          <span>View Cart</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </div>
      </Link>
    </div>
  );
}
