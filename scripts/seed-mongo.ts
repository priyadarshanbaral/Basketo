// Seed script: push Basketo's default data into Supabase.
// Run: npx tsx scripts/seed-mongo.ts
import { upsertDocument } from "@/integrations/supabase/db";
import { DEFAULT_COUPONS } from "@/lib/flipkart-store";

async function main() {
  // REAL WEBSITE MODE: only coupons are seeded (static catalog data).
  // Users, orders, notifications and addresses are created by real signups
  // and purchases — nothing demo is ever inserted.
  const coupons = DEFAULT_COUPONS as Record<string, unknown>[];
  for (const coupon of coupons) {
    await upsertDocument("coupons", coupon);
  }

  console.log("Supabase seed complete (coupons only — real-website mode).");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
