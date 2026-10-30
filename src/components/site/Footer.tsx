import { Link } from "@tanstack/react-router";
import { BrandLogo, BRAND_NAME } from "@/components/site/BrandLogo";

type FooterLink = {
  label: string;
  to: "/shop" | "/p/$slug";
  slug?: string;
  category?: string;
};

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Shop",
    links: [
      { label: "Groceries", to: "/shop", category: "groceries" },
      { label: "Beauty", to: "/shop", category: "beauty" },
      { label: "Fragrances", to: "/shop", category: "fragrances" },
      { label: "Home decoration", to: "/shop", category: "home-decoration" },
      { label: "Kitchen", to: "/shop", category: "kitchen-accessories" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/p/$slug", slug: "about" },
      { label: "Careers", to: "/p/$slug", slug: "careers" },
      { label: "Press", to: "/p/$slug", slug: "press" },
      { label: "Sustainability", to: "/p/$slug", slug: "sustainability" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help center", to: "/p/$slug", slug: "help" },
      { label: "Contact", to: "/p/$slug", slug: "contact" },
      { label: "Returns", to: "/p/$slug", slug: "returns" },
      { label: "Terms", to: "/p/$slug", slug: "terms" },
      { label: "Privacy", to: "/p/$slug", slug: "privacy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-muted/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <BrandLogo size={38} />
            <span className="font-display text-2xl font-extrabold bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 bg-clip-text text-transparent">
              {BRAND_NAME}
            </span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Farm-fresh groceries, beauty and daily essentials at your door in minutes. Sourced
            direct, priced fair.
          </p>
        </div>
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 text-sm font-semibold">{col.title}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {col.links.map((l) =>
                l.to === "/p/$slug" ? (
                  <li key={l.label}>
                    <Link
                      to="/p/$slug"
                      params={{ slug: l.slug! }}
                      className="transition hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ) : (
                  <li key={l.label}>
                    <Link
                      to="/shop"
                      search={{ category: l.category }}
                      className="transition hover:text-foreground"
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
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} {BRAND_NAME}. Crafted with leafy love in India 🇮🇳
      </div>
    </footer>
  );
}
