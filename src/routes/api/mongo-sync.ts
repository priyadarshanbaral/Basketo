// Server API: persists Basketo data to Supabase (replaces MongoDB).
// Same endpoint contract as before so src/lib/flipkart-store.ts works unchanged.
import { createFileRoute } from "@tanstack/react-router";
import { findDocuments, findOneDocument, getDb, insertDocument, upsertDocument, deleteWhere } from "@/integrations/supabase/db";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

async function syncRecords(tableName: string, rows: Record<string, unknown>[], idField: string): Promise<void> {
  const keyedRows = rows.map((row) => {
    const id = row[idField];
    if (typeof id !== "string" || !id) {
      throw new Error(`Supabase record is missing its ${idField}.`);
    }
    return { id, row };
  });

  const existingIds = keyedRows.map(({ id }) => id);
  await deleteWhere(tableName, {} as any);

  for (const { id, row } of keyedRows) {
    await upsertDocument(tableName, { ...row, id });
  }
}

export const Route = createFileRoute("/api/mongo-sync")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await getDb();
          const userId = new URL(request.url).searchParams.get("userId") || "";

          const [legacyAccounts, registeredUsers, coupons] = await Promise.all([
            findDocuments("users", {}),
            findDocuments("registered_users", {}),
            findDocuments("coupons", {}),
          ]);

          const usersById = new Map<string, Record<string, unknown>>();
          for (const user of [...legacyAccounts, ...registeredUsers]) {
            if (typeof user.id === "string") usersById.set(user.id, user);
          }

          let userData: Record<string, unknown> | null = null;
          if (userId) {
            userData =
              (await findOneDocument("user_store_data", { id: `data_${userId}` })) ??
              (await findOneDocument("users", { id: `data_${userId}` }));
          }

          return Response.json({
            users: [...usersById.values()],
            coupons,
            addresses: userData?.addresses ?? [],
            orders: userData?.orders ?? [],
            notifications: userData?.notifications ?? [],
            wishlist: userData?.wishlist ?? [],
            reviews: userData?.reviews ?? [],
          });
        } catch (error) {
          console.error("[mongo-sync] Load failed:", error);
          const message = error instanceof Error ? error.message : "Supabase load failed.";
          return Response.json({ ok: false, error: message }, { status: 503 });
        }
      },

      POST: async ({ request }) => {
        try {
          const body: unknown = await request.json();
          if (!isRecord(body) || typeof body.userId !== "string" || !body.userId.trim()) {
            return Response.json({ ok: false, error: "A valid userId is required." }, { status: 400 });
          }
          if (!isRecord(body.data)) {
            return Response.json({ ok: false, error: "Store data is required." }, { status: 400 });
          }

          const data = body.data as {
            users?: unknown[];
            coupons?: unknown[];
            addresses?: unknown[];
            orders?: unknown[];
            notifications?: unknown[];
            wishlist?: unknown[];
            reviews?: unknown[];
          };
          const arrayFields = ["users", "coupons", "addresses", "orders", "notifications", "wishlist", "reviews"];
          for (const field of arrayFields) {
            if (data[field] !== undefined && !Array.isArray(data[field])) {
              return Response.json({ ok: false, error: `${field} must be an array.` }, { status: 400 });
            }
          }
          if (Array.isArray(data.wishlist) && data.wishlist.some((productId) => typeof productId !== "string")) {
            return Response.json({ ok: false, error: "Wishlist items must be product IDs." }, { status: 400 });
          }

          const userId = body.userId.trim();
          await getDb();
          const operations: Promise<void>[] = [];

          if (data.users) {
            operations.push(syncRecords("registered_users", data.users as Record<string, unknown>[], "id"));
          }
          if (data.coupons) {
            operations.push(syncRecords("coupons", data.coupons as Record<string, unknown>[], "id"));
          }

          operations.push(
            upsertDocument("user_store_data", {
              id: `data_${userId}`,
              user_id: userId,
              addresses: data.addresses ?? [],
              orders: data.orders ?? [],
              notifications: data.notifications ?? [],
              wishlist: data.wishlist ?? [],
              reviews: data.reviews ?? [],
              updated_at: new Date().toISOString(),
            }),
          );
          await Promise.all(operations);

          return Response.json({ ok: true });
        } catch (error) {
          console.error("[mongo-sync] Save failed:", error);
          const message = error instanceof Error ? error.message : "Supabase save failed.";
          return Response.json({ ok: false, error: message }, { status: 503 });
        }
      },
    },
  },
});
