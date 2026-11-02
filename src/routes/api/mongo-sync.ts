// Server API: persists the Basketo store to MongoDB and loads it back.
// The mongodb driver only ever loads here — on the server.
// REAL WEBSITE MODE: no demo fallbacks are ever returned. Empty DB = empty UI.
import { createFileRoute } from "@tanstack/react-router";
import { collections, getMongoDb } from "@/integrations/mongodb/client";
import type { Address, Order, Coupon, NotificationItem, Review, User } from "@/lib/flipkart-store";

export const Route = createFileRoute("/api/mongo-sync")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const userId = url.searchParams.get("userId") || "";

        await getMongoDb();
        const c = collections();

        const pickAll = async (name: string): Promise<any[]> => {
          try {
            const col = await ((await c) as any)[name]();
            return (await col.find({}).toArray()) || [];
          } catch {
            return [];
          }
        };

        const users = await pickAll("users");
        const coupons = await pickAll("coupons");

        if (!userId) {
          return Response.json({
            users,
            coupons,
            addresses: [] as Address[],
            orders: [] as Order[],
            notifications: [] as NotificationItem[],
            wishlist: [] as string[],
            reviews: [] as Review[],
          });
        }

        // Per-user data lives under a single namespaced document.
        const col = await (await c).users();
        const doc = await col.findOne({ _id: `data_${userId}` } as any);
        return Response.json({
          users,
          coupons,
          addresses: doc?.addresses ?? [],
          orders: doc?.orders ?? [],
          notifications: doc?.notifications ?? [],
          wishlist: doc?.wishlist ?? [],
          reviews: doc?.reviews ?? [],
        });
      },

      POST: async ({ request }) => {
        const body = await request.json();
        const { userId, data } = body as {
          userId: string;
          data: {
            users?: User[];
            coupons?: Coupon[];
            addresses?: Address[];
            orders?: Order[];
            notifications?: NotificationItem[];
            wishlist?: string[];
            reviews?: Review[];
          };
        };
        if (!userId) return Response.json({ ok: false }, { status: 400 });

        await getMongoDb();
        const c = collections();

        const save = async (name: string, rows: any[] | undefined) => {
          if (!rows) return;
          try {
            const col = await ((await c) as any)[name]();
            await col.deleteMany({});
            if (rows.length) await col.insertMany(rows);
          } catch (err) {
            console.warn(`[mongo] save ${name} failed`, err);
          }
        };

        if (data.users) await save("users", data.users);
        if (data.coupons) await save("coupons", data.coupons);

        try {
          const col = await (await c).users();
          await col.replaceOne(
            { _id: `data_${userId}` } as any,
            {
              _id: `data_${userId}`,
              userId,
              addresses: data.addresses ?? [],
              orders: data.orders ?? [],
              notifications: data.notifications ?? [],
              wishlist: data.wishlist ?? [],
              reviews: data.reviews ?? [],
              updatedAt: new Date().toISOString(),
            },
            { upsert: true },
          );
        } catch (err) {
          console.warn("[mongo] per-user persist failed", err);
        }

        return Response.json({ ok: true });
      },
    },
  },
});
