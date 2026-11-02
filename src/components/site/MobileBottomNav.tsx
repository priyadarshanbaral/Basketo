import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ShoppingBag, Package, User, Heart } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { store } from "@/lib/flipkart-store";
import { useSyncExternalStore } from "react";

export function MobileBottomNav() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const currentSearch = (routerState.location.search as Record<string, any>) || {};
  const currentTab = currentSearch.tab;

  const { count } = useCart();
  const user = useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.currentUser,
    () => store.currentUser,
  );

  const isHome = currentPath === "/";
  const isShop = currentPath === "/shop";
  const isCart = currentPath === "/cart";
  const isOrders = currentPath === "/account" && currentTab === "orders";
  const isAccount = currentPath === "/account" && currentTab !== "orders";
  const isAuth = currentPath === "/auth";

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 block md:hidden border-t border-slate-200/80 bg-white/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
    >
      <div className="mx-auto flex h-14 max-w-md items-center justify-around px-2">
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
            isHome ? "text-emerald-600 font-bold" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Home className={`h-5 w-5 ${isHome ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          <span className="text-[10px] tracking-tight">Home</span>
        </Link>

        {/* Shop */}
        <Link
          to="/shop"
          className={`flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
            isShop ? "text-emerald-600 font-bold" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <ShoppingBag className={`h-5 w-5 ${isShop ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          <span className="text-[10px] tracking-tight">Explore</span>
        </Link>

        {/* Orders */}
        <Link
          to={user ? "/account" : "/auth"}
          search={user ? { tab: "orders" } : { redirect_to: "/account?tab=orders" }}
          className={`flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
            isOrders ? "text-emerald-600 font-bold" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Package className={`h-5 w-5 ${isOrders ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          <span className="text-[10px] tracking-tight">Orders</span>
        </Link>

        {/* Cart */}
        <Link
          to="/cart"
          className={`relative flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
            isCart ? "text-emerald-600 font-bold" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <div className="relative">
            <ShoppingBag className={`h-5 w-5 ${isCart ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
            {count > 0 && (
              <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-linear-to-r from-emerald-600 to-emerald-500 px-1 text-[9px] font-black text-white shadow-xs">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Cart</span>
        </Link>

        {/* Account / Sign In */}
        <Link
          to={user ? "/account" : "/auth"}
          className={`flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
            isAccount || isAuth ? "text-emerald-600 font-bold" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <User className={`h-5 w-5 ${isAccount || isAuth ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
          <span className="text-[10px] tracking-tight">{user ? "Account" : "Sign In"}</span>
        </Link>
      </div>
    </nav>
  );
}
