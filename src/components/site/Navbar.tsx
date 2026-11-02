import { Link, useNavigate } from "@tanstack/react-router";
import {
  ShoppingBag,
  Search,
  User as UserIcon,
  LogOut,
  MapPin,
  X,
  Menu,
  Heart,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { BrandLogo, BRAND_NAME } from "@/components/site/BrandLogo";
import { useCart, cart } from "@/lib/cart-store";
import { store } from "@/lib/flipkart-store";
import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { count } = useCart();
  const storeUser = useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.currentUser,
    () => store.currentUser,
  );
  const user = storeUser;
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    cart.setUser(user?.id ?? null);
  }, [user?.id]);

  const handleScroll = () => {
    setScrolled(window.scrollY > 10);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleSignOut() {
    store.setCurrentUser(null);
    toast.info("Signed out");
    navigate({ to: "/" });
    setIsOpen(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!q.trim()) return;
    navigate({ to: "/shop", search: { q: q.trim() } });
    setIsOpen(false);
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full border-b border-bk-border bg-bk-surface/90 backdrop-blur-md shadow-sm transition-all duration-300 ${
          scrolled ? "shadow-md" : ""
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6">
          {/* Left: Brand + Location */}
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 transition opacity-100 hover:opacity-90"
            >
              <BrandLogo size={34} />
              <span className="font-display text-xl font-black tracking-tight bg-linear-to-r from-bk-primary via-emerald-500 to-amber-500 bg-clip-text text-transparent">
                {BRAND_NAME}
              </span>
            </Link>

            <div className="hidden items-center gap-1.5 rounded-full border border-bk-border/60 bg-bk-surface-alt px-3 py-1 text-xs text-bk-muted lg:flex">
              <MapPin className="h-3.5 w-3.5 text-bk-primary" />
              <span className="font-semibold text-bk-ink">Delivery Location</span>
              <span className="rounded-full bg-bk-primary/10 px-1.5 py-0.2 text-[10px] font-bold text-bk-primary">
                ⚡ 15m
              </span>
            </div>
          </div>

          {/* Center: Search Bar (desktop) */}
          <div className="hidden flex-1 max-w-md items-center gap-2 rounded-full border border-bk-border/60 bg-bk-surface-alt px-4 py-1.5 sm:flex">
            <Search className="h-4 w-4 text-bk-muted" />
            <form onSubmit={handleSearch} className="flex w-full items-center gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search fruits, vegetables, groceries..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-bk-muted/60"
              />
              <button
                type="submit"
                className="rounded-full p-1.5 text-bk-primary hover:bg-bk-primary/10 transition"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Right: Icons + User */}
          <nav className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist */}
            <button
              onClick={() => {
                if (!user) {
                  navigate({ to: "/auth", search: { redirect_to: "/account?tab=wishlist" } });
                  return;
                }
                navigate({ to: "/account", search: { tab: "wishlist" } });
              }}
              className="relative grid h-10 w-10 place-items-center rounded-full border border-bk-border/60 bg-bk-surface text-bk-muted transition hover:border-bk-primary hover:text-bk-primary hover:bg-bk-primary/5"
              aria-label="Wishlist"
            >
              <Heart className="h-4 w-4" />
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative grid h-10 w-10 place-items-center rounded-full border border-bk-border/60 bg-bk-surface text-bk-muted transition hover:border-bk-primary hover:text-bk-primary hover:bg-bk-primary/5"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="h-4 w-4" />
              {count > 0 && (
                <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-linear-to-r from-bk-primary to-emerald-500 text-[10px] font-bold text-white shadow-md">
                  {count > 99 ? "99+" : count}
                </span>
              )}
            </Link>

            {/* User / Sign In */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full border border-bk-border/60 bg-bk-surface pl-1.5 pr-3 py-1 transition hover:border-bk-primary hover:text-bk-primary">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-7 w-7 rounded-full object-cover border border-bk-border/40"
                    />
                    <span className="hidden text-xs font-bold text-bk-ink sm:inline">
                      {user.name.split(" ")[0]}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 border-bk-border bg-bk-surface shadow-lg">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-bold text-bk-ink">{user.name}</span>
                      <span className="text-[11px] text-bk-muted">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate({ to: "/account" })}>
                    <ShoppingBag className="h-4 w-4" /> My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/account", search: { tab: "wishlist" } })}>
                    <Heart className="h-4 w-4" /> Wishlist
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate({ to: "/account", search: { tab: "addresses" } })}>
                    <MapPin className="h-4 w-4" /> Addresses
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-bk-error focus:text-bk-error">
                    <LogOut className="h-4 w-4" /> Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => navigate({ to: "/auth" })}
                className="rounded-full border border-bk-border/60 bg-bk-surface px-4 py-1.5 text-xs font-bold text-bk-ink transition hover:border-bk-primary hover:text-bk-primary hover:bg-bk-primary/5"
              >
                Sign in
              </button>
            )}

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden grid h-10 w-10 place-items-center rounded-full border border-bk-border/60 bg-bk-surface text-bk-ink transition hover:bg-bk-primary hover:text-white"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </nav>
        </div>

        {/* Mobile: Search bar inside header (always visible on mobile) */}
        <div className="lg:hidden border-b border-bk-border/60 bg-bk-surface/80 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-2">
            <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-full border border-bk-border/60 bg-bk-surface-alt px-3 py-1.5">
              <Search className="h-4 w-4 text-bk-muted" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search fruits, vegetables, groceries..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-bk-muted/60"
              />
              <button
                type="submit"
                className="rounded-full p-1 text-bk-primary hover:bg-bk-primary/10 transition"
              >
                <Search className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed inset-0 z-[60] flex flex-col lg:hidden"
          onClick={(e) => {
            if (e.target === menuRef.current) setIsOpen(false);
          }}
        >
          <div className="absolute top-0 right-0 p-4 lg:hidden">
            <button
              onClick={() => setIsOpen(false)}
              className="h-10 w-10 rounded-full border border-bk-border/60 bg-bk-surface place-items-center text-bk-ink hover:bg-bk-primary/5"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto bg-bk-surface border-b border-bk-border/60 p-6">
            <div className="mb-8 border-b border-bk-border/60 pb-6">
              <form onSubmit={handleSearch} className="flex items-center gap-2 rounded-full border border-bk-border/60 bg-bk-surface-alt px-4 py-2">
                <Search className="h-4 w-4 text-bk-muted" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search products..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-bk-muted/60"
                />
                <button
                  type="submit"
                  className="rounded-full p-1 text-bk-primary hover:bg-bk-primary/10"
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>

            <nav className="space-y-2">
              <Link
                to="/"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-bk-ink font-medium hover:bg-bk-primary/5 hover:text-bk-primary transition"
              >
                <ShoppingBag className="h-5 w-5" /> Home
              </Link>
              <Link
                to="/shop"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-bk-ink font-medium hover:bg-bk-primary/5 hover:text-bk-primary transition"
              >
                <ShoppingBag className="h-5 w-5" /> Shop All
              </Link>
              <Link
                to="/cart"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-bk-ink font-medium hover:bg-bk-primary/5 hover:text-bk-primary transition"
              >
                <ShoppingBag className="h-5 w-5" /> Cart ({count})
              </Link>
              {user ? (
                <>
                  <Link
                    to="/account"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-bk-ink font-medium hover:bg-bk-primary/5 hover:text-bk-primary transition"
                  >
                    <UserIcon className="h-5 w-5" /> My Account
                  </Link>
                  <Link
                    to="/account?tab=orders"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-bk-ink font-medium hover:bg-bk-primary/5 hover:text-bk-primary transition"
                  >
                    <ShoppingBag className="h-5 w-5" /> My Orders
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-bk-error font-medium hover:bg-rose-50 hover:text-bk-error transition"
                  >
                    <LogOut className="h-5 w-5" /> Log Out
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-bk-ink font-medium hover:bg-bk-primary/5 hover:text-bk-primary transition"
                >
                  <UserIcon className="h-5 w-5" /> Sign in
                </Link>
              )}
            </nav>

            <div className="mt-8 pt-6 border-t border-bk-border/60">
              <p className="text-xs font-semibold text-bk-muted uppercase tracking-wider mb-4">
                Download App
              </p>
              <div className="flex gap-2">
                <button className="flex-1 items-center justify-center rounded-xl border border-bk-border bg-bk-surface px-4 py-3 text-xs font-bold text-bk-ink hover:bg-bk-surface-alt transition">
                  App Store
                </button>
                <button className="flex-1 items-center justify-center rounded-xl border border-bk-border bg-bk-surface px-4 py-3 text-xs font-bold text-bk-ink hover:bg-bk-surface-alt transition">
                  Google Play
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
