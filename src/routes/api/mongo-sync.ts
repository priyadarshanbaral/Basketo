// Server API: persists Basketo data to MongoDB.
import { createFileRoute } from "@tanstack/react-router";
import type { Collection, Document } from "mongodb";
import { collections, getMongoDb, type StoreDocument } from "@/integrations/mongodb/client";

type StoreDataPayload = {
  users?: Document[];
  coupons?: Document[];
  addresses?: Document[];
  orders?: Document[];
  notifications?: Document[];
  wishlist?: string[];
  reviews?: Document[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

async function syncRecords(
  collection: Collection<StoreDocument>,
  rows: Document[],
  idField: string,
): Promise<void> {
  const keyedRows = rows.map((row) => {
    const id = row[idField];
    if (typeof id !== "string" || !id) {
      throw new Error(`MongoDB record is missing its ${idField}.`);
    }
    return { id, row };
  });

  await collection.deleteMany({ _id: { $nin: keyedRows.map(({ id }) => id) } });
  await Promise.all(
    keyedRows.map(({ id, row }) =>
      collection.replaceOne({ _id: id }, { ...row, _id: id }, { upsert: true }),
    ),
  );
}

export const Route = createFileRoute("/api/mongo-sync")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          await getMongoDb();
          const c = collections();
          const userId = new URL(request.url).searchParams.get("userId") || "";

          const [legacyAccounts, registeredUsers, coupons] = await Promise.all([
            (await c.users()).find({ id: { $exists: true } }).toArray(),
            (await c.registeredUsers()).find({}).toArray(),
            (await c.coupons()).find({}).toArray(),
          ]);

          const usersById = new Map<string, Document>();
          for (const user of [...legacyAccounts, ...registeredUsers]) {
            if (typeof user.id === "string") usersById.set(user.id, user);
          }

          let userData: Document | null = null;
          if (userId) {
            const userDataCollection = await c.userData();
            userData =
              (await userDataCollection.findOne({ _id: `data_${userId}` })) ??
              (await (await c.users()).findOne({ _id: `data_${userId}` }));
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
          const message = error instanceof Error ? error.message : "MongoDB load failed.";
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

          const data = body.data;
          const arrayFields = [
            "users",
            "coupons",
            "addresses",
            "orders",
            "notifications",
            "wishlist",
            "reviews",
          ];
          for (const field of arrayFields) {
            if (data[field] !== undefined && !Array.isArray(data[field])) {
              return Response.json(
                { ok: false, error: `${field} must be an array.` },
                { status: 400 },
              );
            }
          }
          if (
            Array.isArray(data.wishlist) &&
            data.wishlist.some((productId) => typeof productId !== "string")
          ) {
            return Response.json(
              { ok: false, error: "Wishlist items must be product IDs." },
              { status: 400 },
            );
          }

          const userId = body.userId.trim();
          const storeData = data as StoreDataPayload;
          await getMongoDb();
          const c = collections();
          const operations: Promise<unknown>[] = [];

          if (storeData.users) {
            operations.push(
              syncRecords(await c.registeredUsers(), storeData.users, "id"),
            );
          }
          if (storeData.coupons) {
            operations.push(syncRecords(await c.coupons(), storeData.coupons, "id"));
          }

          const userDataCollection = await c.userData();
          operations.push(
            userDataCollection.replaceOne(
              { _id: `data_${userId}` },
              {
                _id: `data_${userId}`,
                userId,
                addresses: storeData.addresses ?? [],
                orders: storeData.orders ?? [],
                notifications: storeData.notifications ?? [],
                wishlist: storeData.wishlist ?? [],
                reviews: storeData.reviews ?? [],
                updatedAt: new Date().toISOString(),
              },
              { upsert: true },
            ),
          );
          await Promise.all(operations);

          return Response.json({ ok: true });
        } catch (error) {
          console.error("[mongo-sync] Save failed:", error);
          const message = error instanceof Error ? error.message : "MongoDB save failed.";
          return Response.json({ ok: false, error: message }, { status: 503 });
        }
      },
    },
  },
});
