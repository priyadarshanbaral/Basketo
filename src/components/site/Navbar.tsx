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
  Sparkles,
  ChevronDown,
  Package,
  ShieldCheck,
  Zap,
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

const QUICK_CATEGORIES = [
  { name: "All Items", slug: "" },
  { name: "Groceries", slug: "groceries", icon: "🥦" },
  { name: "Beauty", slug: "beauty", icon: "💄" },
  { name: "Smartphones", slug: "smartphones", icon: "📱" },
  { name: "Fragrances", slug: "fragrances", icon: "🌸" },
  { name: "Home Decor", slug: "home-decoration", icon: "🪴" },
  { name: "Kitchen", slug: "kitchen-accessories", icon: "🍽️" },
  { name: "Laptops", slug: "laptops", icon: "💻" },
  { name: "Dresses", slug: "womens-dresses", icon: "👗" },
];

export function Navbar() {
  const { count } = useCart();
  const currentStore = useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store,
    () => store,
  );
  const user = currentStore.currentUser;
  const wishlistCount = currentStore.wishlist.length;
  const navigate = useNavigate();

  const [q, setQ] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState("Indiranagar, Bengaluru (560038)");

  useEffect(() => {
    cart.setUser(user?.id ?? null);
  }, [user?.id]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleSignOut() {
    store.setCurrentUser(null);
    toast.info("Successfully signed out");
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
      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-400">
              <Zap className="h-2.5 w-2.5 fill-current" /> 15-Min Delivery
            </span>
            <span className="hidden sm:inline text-slate-300">
              Farm-fresh fruits, vegetables, dairy & essentials at your doorstep.
            </span>
            <span className="sm:hidden text-slate-300">Fresh essentials in 15 mins.</span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-slate-300 text-[11px]">
            <span>
              Code <strong>SUPER100</strong> for ₹100 OFF
            </span>
            <span className="text-slate-600">|</span>
            <Link to="/p/help" className="hover:text-emerald-400 transition">
              Help 24/7
            </Link>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header
        className={`sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md transition-all duration-200 ${
          scrolled ? "shadow-md" : "shadow-xs"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
          {/* Left: Brand Logo + Hyperlocal Location */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Link
              to="/"
              className="flex items-center gap-1.5 sm:gap-2 transition hover:opacity-90 active:scale-98"
            >
              <div className="sm:hidden">
                <BrandLogo size={26} />
              </div>
              <div className="hidden sm:block">
                <BrandLogo size={36} />
              </div>
              <div className="flex flex-col">
                <span className="font-display text-lg sm:text-2xl font-black tracking-tight bg-linear-to-r from-emerald-600 via-emerald-500 to-amber-500 bg-clip-text text-transparent">
                  {BRAND_NAME}
                </span>
              </div>
            </Link>

            {/* Hyperlocal Location Pill */}
            <button
              type="button"
              onClick={() => setShowLocationModal(true)}
              className="hidden lg:flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs text-slate-700 hover:border-emerald-500/60 hover:bg-emerald-50/50 transition cursor-pointer"
            >
              <MapPin className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Delivering To
                </span>
                <span className="font-semibold text-slate-900 line-clamp-1 max-w-[150px]">
                  {selectedCity.split("(")[0]}
                </span>
              </div>
              <span className="rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-black text-white">
                15m
              </span>
            </button>
          </div>

          {/* Center: Search Bar (Desktop & Tablet) */}
          <div className="hidden sm:flex flex-1 max-w-lg items-center rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <form onSubmit={handleSearch} className="flex w-full items-center gap-2">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search fresh mangoes, milk, olive oil, makeup..."
                className="w-full bg-transparent px-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              {q && (
                <button
                  type="button"
                  onClick={() => setQ("")}
                  className="text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="submit"
                className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
              >
                Search
              </button>
            </form>
          </div>

          {/* Right: Actions (Wishlist, Cart, User, Hamburger) */}
          <nav className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Quick Explore Link (desktop) */}
            <Link
              to="/shop"
              className="hidden lg:inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-600 transition"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              All Categories
            </Link>

            {/* Wishlist (Desktop & Tablet only - Mobile has bottom bar) */}
            <button
              type="button"
              onClick={() => {
                if (!user) {
                  navigate({ to: "/auth", search: { redirect_to: "/account?tab=wishlist" } });
                  return;
                }
                navigate({ to: "/account", search: { tab: "wishlist" } });
              }}
              className="hidden sm:grid relative h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50"
              aria-label="Wishlist"
            >
              <Heart
                className={`h-4 w-4 ${wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""}`}
              />
              {wishlistCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <Link
              to="/cart"
              className="relative flex items-center justify-center h-9 w-9 sm:h-10 sm:w-auto sm:px-3 sm:py-2 rounded-full border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50/50"
              aria-label="Shopping cart"
            >
              <div className="relative">
                <ShoppingBag className="h-4 w-4" />
                {count > 0 && (
                  <span className="absolute -right-2 -top-2 grid h-4 w-4 place-items-center rounded-full bg-linear-to-r from-emerald-600 to-emerald-500 text-[9px] font-black text-white shadow-xs">
                    {count > 99 ? "99+" : count}
                  </span>
                )}
              </div>
              <span className="hidden md:inline text-xs font-bold ml-1">Cart</span>
            </Link>

            {/* User / Sign In Button (Responsive: fits 320px screens perfectly) */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-slate-200 bg-white p-1 sm:pl-1.5 sm:pr-2.5 sm:py-1 text-xs font-bold text-slate-800 transition hover:border-emerald-500 cursor-pointer">
                    <img
                      src={
                        user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
                      }
                      alt={user.name}
                      className="h-7 w-7 rounded-full object-cover border border-slate-200"
                    />
                    <span className="hidden sm:inline">{user.name.split(" ")[0]}</span>
                    <ChevronDown className="hidden sm:block h-3 w-3 text-slate-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 border-slate-200 bg-white p-1 shadow-xl rounded-2xl"
                >
                  <DropdownMenuLabel className="p-3 bg-slate-50 rounded-xl mb-1">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{user.name}</span>
                      <span className="text-[11px] text-slate-500 line-clamp-1">
                        {user.email || user.phone}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => navigate({ to: "/account" })}
                    className="rounded-lg gap-2 cursor-pointer py-2"
                  >
                    <UserIcon className="h-4 w-4 text-emerald-600" /> My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate({ to: "/account", search: { tab: "orders" } })}
                    className="rounded-lg gap-2 cursor-pointer py-2"
                  >
                    <Package className="h-4 w-4 text-emerald-600" /> My Orders & Tracking
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate({ to: "/account", search: { tab: "wishlist" } })}
                    className="rounded-lg gap-2 cursor-pointer py-2"
                  >
                    <Heart className="h-4 w-4 text-rose-500" /> My Wishlist ({wishlistCount})
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => navigate({ to: "/account", search: { tab: "addresses" } })}
                    className="rounded-lg gap-2 cursor-pointer py-2"
                  >
                    <MapPin className="h-4 w-4 text-emerald-600" /> Saved Addresses
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem
                      onClick={() => navigate({ to: "/admin" })}
                      className="rounded-lg gap-2 cursor-pointer py-2 font-bold text-amber-600"
                    >
                      <ShieldCheck className="h-4 w-4 text-amber-600" /> Admin Operations
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="my-1 bg-slate-100" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="rounded-lg gap-2 cursor-pointer py-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                {/* Mobile Login Button (<640px) */}
                <Link
                  to="/auth"
                  className="sm:hidden inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 active:scale-95 whitespace-nowrap shrink-0"
                >
                  <UserIcon className="h-3.5 w-3.5" />
                  <span>Login</span>
                </Link>

                {/* Desktop Sign In Button (>=640px) */}
                <Link
                  to="/auth"
                  className="hidden sm:inline-flex rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95 whitespace-nowrap"
                >
                  Sign In
                </Link>
              </>
            )}

            {/* Mobile Hamburger Drawer Trigger */}
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="lg:hidden grid h-9 w-9 sm:h-10 sm:w-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-800 transition hover:bg-slate-100 active:scale-95"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </nav>
        </div>

        {/* Mobile Search Bar inside header (visible only below sm) */}
        <div className="sm:hidden border-t border-slate-100 bg-slate-50/90 px-4 py-2">
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5"
          >
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search fruits, veggies, groceries..."
              className="w-full bg-transparent text-xs text-slate-900 outline-none placeholder:text-slate-400"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} className="text-slate-400 p-0.5">
                <X className="h-3 w-3" />
              </button>
            )}
            <button
              type="submit"
              className="rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white"
            >
              Go
            </button>
          </form>
        </div>

        {/* Desktop Quick Category Sub-Navigation Bar */}
        <div className="hidden lg:block border-t border-slate-100 bg-slate-50/60">
          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-6 py-2 scrollbar-none text-xs">
            {QUICK_CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to="/shop"
                search={cat.slug ? { category: cat.slug } : { category: undefined }}
                className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 font-semibold text-slate-700 hover:bg-white hover:text-emerald-600 hover:shadow-xs transition"
              >
                {cat.icon && <span>{cat.icon}</span>}
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile Drawer Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white shadow-2xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div className="flex items-center gap-2">
                <BrandLogo size={30} />
                <span className="font-display text-lg font-black text-slate-900">{BRAND_NAME}</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Profile Card inside Drawer */}
            {user ? (
              <div className="border-b border-slate-100 bg-emerald-50/60 p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`
                    }
                    alt={user.name}
                    className="h-10 w-10 rounded-full border border-emerald-200 object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{user.name}</h4>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {user.email || user.phone}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-b border-slate-100 bg-slate-50 p-4">
                <p className="text-xs text-slate-600 mb-2">
                  Sign in to track orders, save addresses & access member discounts.
                </p>
                <Link
                  to="/auth"
                  onClick={() => setIsOpen(false)}
                  className="block w-full rounded-xl bg-emerald-600 py-2 text-center text-xs font-bold text-white shadow-xs"
                >
                  Sign In or Register
                </Link>
              </div>
            )}

            {/* Drawer Navigation Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Quick Navigation
                </h5>
                <nav className="space-y-1">
                  <Link
                    to="/"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <span>🏠</span> Home
                  </Link>
                  <Link
                    to="/shop"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <span>🛍️</span> Shop Full Catalog
                  </Link>
                  <Link
                    to="/cart"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <span className="flex items-center gap-3">
                      <span>🛒</span> Shopping Cart
                    </span>
                    {count > 0 && (
                      <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-black text-white">
                        {count}
                      </span>
                    )}
                  </Link>
                  <Link
                    to={user ? "/account" : "/auth"}
                    search={user ? { tab: "orders" } : { redirect_to: "/account?tab=orders" }}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <span>📦</span> My Orders & Tracking
                  </Link>
                  <Link
                    to={user ? "/account" : "/auth"}
                    search={user ? { tab: "wishlist" } : { redirect_to: "/account?tab=wishlist" }}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    <span className="flex items-center gap-3">
                      <span>❤️</span> Wishlist
                    </span>
                    {wishlistCount > 0 && (
                      <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-black text-white">
                        {wishlistCount}
                      </span>
                    )}
                  </Link>
                  {user?.role === "admin" && (
                    <Link
                      to="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-bold text-amber-700 bg-amber-50"
                    >
                      <ShieldCheck className="h-4 w-4" /> Admin Operations
                    </Link>
                  )}
                </nav>
              </div>

              {/* Categories in Drawer */}
              <div>
                <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">
                  Shop by Category
                </h5>
                <div className="grid grid-cols-2 gap-1.5">
                  {QUICK_CATEGORIES.filter((c) => c.slug).map((c) => (
                    <Link
                      key={c.slug}
                      to="/shop"
                      search={{ category: c.slug }}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50/70 p-2 text-xs font-semibold text-slate-700 hover:bg-white hover:border-emerald-500"
                    >
                      <span>{c.icon}</span>
                      <span className="truncate">{c.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="border-t border-slate-200 p-4">
              {user ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-xs font-bold text-rose-600 hover:bg-rose-100 transition"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              ) : (
                <p className="text-center text-xs text-slate-400">
                  Basketo • 15-Minute Groceries 🇮🇳
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hyperlocal Location Selector Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setShowLocationModal(false)}
          />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-emerald-600" />
                <h3 className="font-display font-bold text-base text-slate-900">
                  Choose Delivery Hub
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationModal(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {[
                "Indiranagar, Bengaluru (560038)",
                "Koramangala, Bengaluru (560034)",
                "Bandra West, Mumbai (400050)",
                "Hauz Khas, New Delhi (110016)",
                "Gachibowli, Hyderabad (500032)",
                "Saheed Nagar, Bhubaneswar (751007)",
              ].map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => {
                    setSelectedCity(loc);
                    setShowLocationModal(false);
                    toast.success(`Switched delivery location to ${loc.split("(")[0]}`);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left text-xs transition ${
                    selectedCity === loc
                      ? "border-emerald-500 bg-emerald-50/50 font-bold text-emerald-800"
                      : "border-slate-200 hover:border-slate-300 text-slate-700"
                  }`}
                >
                  <span>{loc}</span>
                  <span className="rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                    15m ETA
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
