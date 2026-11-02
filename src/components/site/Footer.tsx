import { Link } from "@tanstack/react-router";
import { BrandLogo, BRAND_NAME } from "@/components/site/BrandLogo";
import { ShieldCheck, Truck, Zap, Heart, Lock } from "lucide-react";

type FooterLink = {
  label: string;
  to: "/shop" | "/p/$slug" | "/admin" | "/account";
  slug?: string;
  category?: string;
};

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Categories",
    links: [
      { label: "Fresh Groceries", to: "/shop", category: "groceries" },
      { label: "Beauty & Personal Care", to: "/shop", category: "beauty" },
      { label: "Smartphones & Gadgets", to: "/shop", category: "smartphones" },
      { label: "Fragrances & Scents", to: "/shop", category: "fragrances" },
      { label: "Home Decor & Living", to: "/shop", category: "home-decoration" },
      { label: "Kitchen & Dining", to: "/shop", category: "kitchen-accessories" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Basketo", to: "/p/$slug", slug: "about" },
      { label: "Careers (We're Hiring!)", to: "/p/$slug", slug: "careers" },
      { label: "Press & Media", to: "/p/$slug", slug: "press" },
      { label: "Sustainability & Ethics", to: "/p/$slug", slug: "sustainability" },
    ],
  },
  {
    title: "Customer Support",
    links: [
      { label: "Help Center & FAQs", to: "/p/$slug", slug: "help" },
      { label: "Contact Customer Care", to: "/p/$slug", slug: "contact" },
      { label: "Returns & Refund Policy", to: "/p/$slug", slug: "returns" },
      { label: "Terms of Service", to: "/p/$slug", slug: "terms" },
      { label: "Privacy Policy", to: "/p/$slug", slug: "privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white">
      {/* Trust Highlights Strip */}
      <div className="border-b border-slate-100 bg-slate-50/70 py-6">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 sm:px-6 md:grid-cols-4 text-center">
          <div className="flex flex-col items-center">
            <Zap className="h-5 w-5 text-emerald-600 mb-1" />
            <span className="text-xs font-bold text-slate-800">15-Min Hyperlocal</span>
            <span className="text-[10px] text-slate-500">Delivered hot or cold</span>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheck className="h-5 w-5 text-emerald-600 mb-1" />
            <span className="text-xs font-bold text-slate-800">100% Quality Checked</span>
            <span className="text-[10px] text-slate-500">Farm-to-fork freshness</span>
          </div>
          <div className="flex flex-col items-center">
            <Lock className="h-5 w-5 text-emerald-600 mb-1" />
            <span className="text-xs font-bold text-slate-800">Bank-Grade Security</span>
            <span className="text-[10px] text-slate-500">UPI, Cards & COD</span>
          </div>
          <div className="flex flex-col items-center">
            <Truck className="h-5 w-5 text-emerald-600 mb-1" />
            <span className="text-xs font-bold text-slate-800">Free Express Delivery</span>
            <span className="text-[10px] text-slate-500">On all orders above ₹499</span>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <BrandLogo size={36} />
            <span className="font-display text-2xl font-black bg-linear-to-r from-emerald-600 via-emerald-500 to-amber-500 bg-clip-text text-transparent">
              {BRAND_NAME}
            </span>
          </div>
          <p className="mt-3 max-w-sm text-xs sm:text-sm text-slate-500 leading-relaxed">
            India&apos;s most reliable quick commerce marketplace. Farm-fresh produce, pantry essentials, beauty and electronics delivered in 15 minutes.
          </p>

          <div className="mt-6">
            <h5 className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Supported Payment Methods</h5>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-bold text-slate-600">
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">UPI (GPay / PhonePe / Paytm)</span>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">RuPay</span>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">Visa / Master</span>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">NetBanking</span>
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1">Cash on Delivery</span>
            </div>
          </div>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 text-xs font-black uppercase tracking-wider text-slate-900">{col.title}</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              {col.links.map((l) =>
                l.to === "/p/$slug" ? (
                  <li key={l.label}>
                    <Link
                      to="/p/$slug"
                      params={{ slug: l.slug! }}
                      className="transition hover:text-emerald-700"
                    >
                      {l.label}
                    </Link>
                  </li>
                ) : (
                  <li key={l.label}>
                    <Link
                      to="/shop"
                      search={{ category: l.category }}
                      className="transition hover:text-emerald-700"
                    >
                      {l.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Sub-footer */}
      <div className="border-t border-slate-200 py-6 px-6">
        <div className="mx-auto flex max-w-7xl flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {BRAND_NAME} Technologies Private Limited. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/p/terms" className="hover:text-slate-800">Terms</Link>
            <Link to="/p/privacy" className="hover:text-slate-800">Privacy</Link>
            <Link to="/admin" className="text-slate-400 hover:text-amber-600 font-medium">Admin Portal</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
