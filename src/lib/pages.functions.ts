import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type PageSection = { heading: string; body: string };
export type SitePage = {
  slug: string;
  title: string;
  subtitle: string | null;
  sections: PageSection[];
  group_name: string;
  sort_order: number;
};

const DEFAULT_PAGES: Record<string, SitePage> = {
  about: {
    slug: "about",
    title: "About Basketo",
    subtitle: "Farm-fresh groceries & essentials delivered to your doorstep in minutes.",
    group_name: "Company",
    sort_order: 1,
    sections: [
      {
        heading: "Our Mission",
        body: "Basketo was founded with a single mission: to make fresh, premium groceries and daily essentials accessible within minutes across India. We partner directly with verified farmers, artisan producers, and trusted brands.",
      },
      {
        heading: "Farm Direct Sourcing",
        body: "Every morning before sunrise, our procurement teams curate fresh fruits and vegetables straight from certified regional farms. No cold-storage decay, no chemical ripening.",
      },
      {
        heading: "Speed with Care",
        body: "Our hyperlocal micro-fulfillment centers ensure lightning-fast deliveries without compromising on produce quality or product integrity.",
      },
      {
        heading: "Founder & CEO",
        body: "Basketo is led by Priyadarshan Baral.",
      },
    ],
  },
  careers: {
    slug: "careers",
    title: "Careers at Basketo",
    subtitle: "Build the future of quick-commerce with us.",
    group_name: "Company",
    sort_order: 2,
    sections: [
      {
        heading: "Life at Basketo",
        body: "We are an ambitious, high-energy team obsessed with delighting customers. From warehouse automation to real-time supply chain engineering, we solve complex challenges every day.",
      },
      {
        heading: "Open Roles",
        body: "We are actively hiring across engineering, operations, product design, and category management. Send your CV to careers@basketo.in.",
      },
    ],
  },
  press: {
    slug: "press",
    title: "Press & News",
    subtitle: "Latest announcements and media coverage.",
    group_name: "Company",
    sort_order: 3,
    sections: [
      {
        heading: "Basketo Milestones",
        body: "Basketo has served over 2 million satisfied orders across 15 cities, expanding sustainable grocery fulfillment with an electric delivery fleet.",
      },
      {
        heading: "Media Enquiries",
        body: "For interviews, press kits, and media inquiries, contact press@basketo.in.",
      },
    ],
  },
  sustainability: {
    slug: "sustainability",
    title: "Sustainability & Ethics",
    subtitle: "Delivering goodness while caring for the planet.",
    group_name: "Company",
    sort_order: 4,
    sections: [
      {
        heading: "Zero Single-Use Plastic",
        body: "All Basketo deliveries are packed in 100% biodegradable or recycled paper bags. Returnable insulated crates keep dairy and greens crisp.",
      },
      {
        heading: "Green Fleet",
        body: "Over 80% of our delivery fleet consists of electric two-wheelers, significantly reducing the carbon footprint of every delivery.",
      },
    ],
  },
  help: {
    slug: "help",
    title: "Help Center",
    subtitle: "Answers to frequently asked questions.",
    group_name: "Support",
    sort_order: 1,
    sections: [
      {
        heading: "How fast is delivery?",
        body: "Standard orders arrive within 15 to 30 minutes depending on your location. You can track your rider in real time directly from the Orders tab.",
      },
      {
        heading: "What payment methods are supported?",
        body: "We support UPI (GPay, PhonePe, Paytm), Credit & Debit cards, Net Banking, and Cash on Delivery.",
      },
      {
        heading: "Can I cancel or modify my order?",
        body: "Orders can be cancelled before packing begins directly from your account page.",
      },
    ],
  },
  contact: {
    slug: "contact",
    title: "Contact Us",
    subtitle: "We're here 24/7 to help you.",
    group_name: "Support",
    sort_order: 2,
    sections: [
      {
        heading: "Customer Care",
        body: "Need help with an ongoing order? Reach out via our live in-app assistant or email care@basketo.in. Hotline: 1800-BASKETO (Mon-Sun, 6 AM to Midnight).",
      },
      {
        heading: "Headquarters",
        body: "Kolathia, Khandagiri Vihar, Bhubaneswar, Odisha 751019, India.",
      },
      {
        heading: "Leadership & Business Inquiries",
        body: "Contact Basketo CEO Priyadarshan Baral.",
      },
    ],
  },
  returns: {
    slug: "returns",
    title: "Returns & Refund Policy",
    subtitle: "100% satisfaction or instant replacement.",
    group_name: "Support",
    sort_order: 3,
    sections: [
      {
        heading: "No-Questions-Asked Freshness Guarantee",
        body: "If any produce or grocery item does not meet your expectations, request a return or replacement directly in the app for an instant refund to your original payment method.",
      },
      {
        heading: "Refund Timelines",
        body: "UPI refunds reflect instantly; card refunds typically take 2-4 business days depending on your bank.",
      },
    ],
  },
  terms: {
    slug: "terms",
    title: "Terms of Service",
    subtitle: "User agreement and terms of use.",
    group_name: "Support",
    sort_order: 4,
    sections: [
      {
        heading: "1. Acceptance of Terms",
        body: "By accessing or using Basketo mobile apps or website, you agree to comply with and be bound by these Terms of Service.",
      },
      {
        heading: "2. Pricing and Availability",
        body: "Prices for products are inclusive of applicable taxes in INR. Items are subject to local inventory availability.",
      },
    ],
  },
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    subtitle: "How we collect, protect, and use your information.",
    group_name: "Support",
    sort_order: 5,
    sections: [
      {
        heading: "Data Protection",
        body: "We take your privacy seriously. Your phone number, address, and payment information are strictly encrypted and never shared with third parties for marketing purposes.",
      },
    ],
  },
};

function withCompanyContact(page: SitePage): SitePage {
  if (page.slug !== "about" && page.slug !== "contact") return page;
  const sectionHeading = page.slug === "about" ? "Founder & CEO" : "Leadership & Business Inquiries";
  const sections = page.sections.filter((section) => section.heading !== sectionHeading);
  sections.push({
    heading: sectionHeading,
    body:
      page.slug === "about"
        ? "Basketo is led by Priyadarshan Baral."
        : "Contact Basketo CEO Priyadarshan Baral.",
  });
  return { ...page, sections };
}

function publicClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const getPage = createServerFn({ method: "GET" })
  .validator((input: { slug: string }) => input)
  .handler(async ({ data }): Promise<SitePage | null> => {
    const supabase = publicClient();
    if (supabase) {
      try {
        const { data: row } = await supabase
          .from("pages")
          .select("slug,title,subtitle,sections,group_name,sort_order")
          .eq("slug", data.slug)
          .maybeSingle();
        if (row) {
          return withCompanyContact({
            ...row,
            sections: (row.sections as PageSection[]) ?? [],
          });
        }
      } catch (err) {
        console.warn("[Pages] Supabase query failed, falling back to default:", err);
      }
    }
    const page = DEFAULT_PAGES[data.slug];
    return page ? withCompanyContact(page) : null;
  });

export const listPages = createServerFn({ method: "GET" }).handler(
  async (): Promise<SitePage[]> => {
    const supabase = publicClient();
    if (supabase) {
      try {
        const { data } = await supabase
          .from("pages")
          .select("slug,title,subtitle,sections,group_name,sort_order")
          .order("group_name")
          .order("sort_order");
        if (data && data.length > 0) {
          return data.map((r) =>
            withCompanyContact({
              ...r,
              sections: (r.sections as PageSection[]) ?? [],
            }),
          );
        }
      } catch (err) {
        console.warn("[Pages] Supabase query failed, falling back to defaults:", err);
      }
    }
    return Object.values(DEFAULT_PAGES).map(withCompanyContact);
  },
);
