// Server API: aggregates REAL business analytics from Supabase for the admin panel.
// Revenue, profit, products sold, per-product breakdown, customers.
import { createFileRoute } from "@tanstack/react-router";
import { getDb } from "@/integrations/supabase/db";
import type { Order } from "@/lib/flipkart-store";

const ASSUMED_MARGIN = 0.18;

export const Route = createFileRoute("/api/admin-analytics")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await getDb();

        const [userDataDocs, legacyUserDocs, registeredUsers] = await Promise.all([
          supabaseAdmin.from("user_store_data").select("*"),
          supabaseAdmin.from("users").select("*"),
          supabaseAdmin.from("registered_users").select("*"),
        ]);

        const docs = [
          ...((userDataDocs.data ?? []) as Record<string, unknown>[]),
          ...((legacyUserDocs.data ?? []) as Record<string, unknown>[]).filter((doc) =>
            /^data_/.test(String(doc.id)),
          ),
        ];
        const accounts = [
          ...((legacyUserDocs.data ?? []) as Record<string, unknown>[]).filter(
            (doc) => !/^data_/.test(String(doc.id)) && typeof doc.id === "string",
          ),
          ...((registeredUsers.data ?? []) as Record<string, unknown>[]),
        ];

        const allOrders: Order[] = [];
        const customersMap = new Map<
          string,
          {
            id: string;
            name: string;
            email: string;
            phone: string;
            orders: number;
            spent: number;
            joinedAt: string;
          }
        >();

        for (const doc of docs) {
          const orders: Order[] = Array.isArray(doc?.orders) ? (doc.orders as Order[]) : [];
          for (const o of orders) {
            if (!o || !o.id) continue;
            allOrders.push(o);
          }
        }

        const validOrders = allOrders.filter(
          (o) => o.status !== "cancelled" && o.status !== "returned",
        );

        let grossRevenue = 0;
        let totalUnitsSold = 0;
        const productMap = new Map<
          string,
          { productId: string; name: string; units: number; revenue: number }
        >();
        const dayMap = new Map<string, { date: string; revenue: number; orders: number }>();

        for (const o of validOrders) {
          grossRevenue += Number(o.total) || 0;

          const day = (o.createdAt || "").slice(0, 10);
          if (day) {
            const d = dayMap.get(day) || { date: day, revenue: 0, orders: 0 };
            d.revenue += Number(o.total) || 0;
            d.orders += 1;
            dayMap.set(day, d);
          }

          for (const item of o.items ?? []) {
            totalUnitsSold += Number(item.quantity) || 0;
            const key = item.productId || item.slug || item.name;
            const p = productMap.get(key) || {
              productId: key,
              name: item.name || "Unknown",
              units: 0,
              revenue: 0,
            };
            p.units += Number(item.quantity) || 0;
            p.revenue += (Number(item.price) || 0) * (Number(item.quantity) || 0);
            productMap.set(key, p);
          }

          const ck = o.customerEmail || o.userId;
          const cust = customersMap.get(ck) || {
            id: o.userId,
            name: o.customerName || "Customer",
            email: o.customerEmail || "",
            phone: o.customerPhone || "",
            orders: 0,
            spent: 0,
            joinedAt: o.createdAt || "",
          };
          cust.orders += 1;
          cust.spent += Number(o.total) || 0;
          customersMap.set(ck, cust);
        }

        const estimatedProfit = Math.round(grossRevenue * ASSUMED_MARGIN);
        const statusCounts: Record<string, number> = {};
        for (const o of allOrders) {
          statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
        }

        const topProducts = [...productMap.values()]
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 10);
        const salesByDay = [...dayMap.values()].sort((a, b) => a.date.localeCompare(b.date));

        return Response.json({
          ok: true,
          totals: {
            grossRevenue: Math.round(grossRevenue),
            estimatedProfit,
            marginPercent: ASSUMED_MARGIN * 100,
            totalOrders: allOrders.length,
            validOrders: validOrders.length,
            totalUnitsSold,
            cancelledOrders: statusCounts["cancelled"] || 0,
            returnedOrders: statusCounts["returned"] || 0,
            deliveredOrders: statusCounts["delivered"] || 0,
            registeredCustomers: new Set([
              ...accounts.map((account) => account.id).filter(Boolean),
              ...[...customersMap.values()].map((customer) => customer.id).filter(Boolean),
            ]).size,
            averageOrderValue: validOrders.length
              ? Math.round(grossRevenue / validOrders.length)
              : 0,
          },
          topProducts,
          salesByDay,
          statusBreakdown: Object.entries(statusCounts).map(([status, count]) => ({
            status,
            count,
          })),
          customers: [...customersMap.values()].sort((a, b) => b.spent - a.spent),
        });
      },
    },
  },
});
