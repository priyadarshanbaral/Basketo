import { Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  LogOut,
  Shield,
  MapPin,
  X,
  Package,
} from "lucide-react";
import { useState } from "react";
import { BrandLogo, BRAND_NAME } from "@/components/site/BrandLogo";
import { useCart } from "@/lib/cart-store";
import { useAuth, useIsAdmin } from "@/lib/auth-hook";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { count, subtotal } = useCart();
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-500/10 bg-background/80 shadow-xs backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Brand & Location Indicator */}
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 transition hover:opacity-90">
            <BrandLogo size={36} />
            <span className="font-display text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 bg-clip-text text-transparent">
              {BRAND_NAME}
            </span>
          </Link>

          {/* Quick Delivery Location Pill */}
          <div className="hidden items-center gap-1.5 rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs text-muted-foreground lg:flex">
            <MapPin className="h-3.5 w-3.5 text-emerald-600" />
            <span className="font-semibold text-foreground">Bangalore 560001</span>
            <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[10px] font-bold text-emerald-600">
              ⚡ 15m
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) {
              navigate({ to: "/shop", search: { q: q.trim() } });
            }
          }}
          className="mx-2 hidden max-w-md flex-1 md:flex"
        >
          <div className="group relative w-full">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition group-focus-within:text-emerald-600" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search farm veggies, fruits, snacks..."
              className="h-10 w-full rounded-full border border-border/80 bg-muted/30 pl-10 pr-9 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-card focus:ring-2 focus:ring-emerald-500/20"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </form>

        {/* Navigation & Actions */}
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link
            to="/shop"
            className="rounded-full px-3.5 py-1.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
          >
            Shop
          </Link>

          {user && (
            <Link
              to="/orders"
              className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted/60 hover:text-foreground sm:inline-flex"
            >
              <Package className="h-4 w-4" />
              <span>Orders</span>
            </Link>
          )}

          {/* Cart Pill */}
          <Link
            to="/cart"
            className="relative flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3.5 py-1.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-500/20 dark:text-emerald-300"
            aria-label="Shopping Cart"
          >
            <div className="relative">
              <ShoppingBag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                </span>
              )}
            </div>
            <span>{count > 0 ? `${count} items` : "Cart"}</span>
            {subtotal > 0 && (
              <span className="hidden font-mono font-bold text-xs lg:inline">
                • ₹{Math.round(subtotal).toLocaleString("en-IN")}
              </span>
            )}
          </Link>

          {/* User Profile or Sign In */}
          {user || store.currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-full border border-border/80 bg-card p-1 pr-3 text-xs font-semibold shadow-xs transition hover:bg-muted active:scale-95">
                  <img
                    src={
                      store.currentUser?.avatar ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                    }
                    alt={store.currentUser?.name || "Account"}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                  <span className="hidden max-w-[100px] truncate sm:inline">
                    {store.currentUser?.name?.split(" ")[0] || "Account"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="truncate text-xs font-normal text-muted-foreground">
                  Hello,{" "}
                  <strong className="text-foreground">
                    {store.currentUser?.name || user?.email}
                  </strong>
                  <div className="text-[11px] text-emerald-600 font-semibold">
                    ● Verified Customer
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate({ to: "/account", search: { tab: "overview" } })}
                >
                  <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" /> My Account
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate({ to: "/account", search: { tab: "orders" } })}
                >
                  <Package className="mr-2 h-4 w-4 text-muted-foreground" /> Orders & Tracking
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate({ to: "/account", search: { tab: "wishlist" } })}
                >
                  <ShoppingBag className="mr-2 h-4 w-4 text-muted-foreground" /> Wishlist
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => navigate({ to: "/account", search: { tab: "addresses" } })}
                >
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" /> Delivery Addresses
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>
                  <Shield className="mr-2 h-4 w-4 text-emerald-600" /> Admin Control Center
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={async () => {
                    store.setCurrentUser(null);
                    try {
                      await supabase.auth.signOut();
                    } catch {
                      // offline fallback
                    }
                    toast.info("Signed out");
                    navigate({ to: "/" });
                  }}
                  className="text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={() => navigate({ to: "/auth" })}
              className="rounded-full bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 font-semibold text-white shadow-sm hover:opacity-95"
              size="sm"
            >
              Sign in
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
