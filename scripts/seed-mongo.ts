// Seed script: push Basketo's default data into MongoDB.
// Run: npx tsx scripts/seed-mongo.ts
import { getMongoDb, collections } from "@/integrations/mongodb/client";
import {
  DEFAULT_COUPONS,
} from "@/lib/flipkart-store";

async function main() {
  await getMongoDb();
  const c = collections();

  // REAL WEBSITE MODE: only coupons are seeded (static catalog data).
  // Users, orders, notifications and addresses are created by real signups
  // and purchases — nothing demo is ever inserted.
  const coupons = await (await c.coupons()).countDocuments();
  if (coupons === 0) await (await c.coupons()).insertMany(DEFAULT_COUPONS as any[]);

  console.log("MongoDB seed complete (coupons only — real-website mode).");
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});