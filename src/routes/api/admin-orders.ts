// Server API: Admin order management — full visibility into every customer order
// and the ability to update order status / broadcast tracking checkpoints.
// Orders live in the `user_store_data` table as per-user documents `data_${userId}`.
// This endpoint aggregates orders across all users so the admin can control fulfillment.
import { createFileRoute } from "@tanstack/react-router";
import { findDocuments, findOneDocument, getDb, upsertDocument } from "@/integrations/supabase/db";
import type { Order } from "@/lib/flipkart-store";

export const Route = createFileRoute("/api/admin-orders")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await getDb();
        const { data: docs, error } = await supabaseAdmin
          .from("user_store_data")
          .select("*");
        if (error) throw error;

        const allOrders: Array<Order & { userId: string }> = [];
        for (const doc of (docs ?? []) as Record<string, unknown>[]) {
          const _id: string = (doc.id as string) || "";
          const userId = _id.startsWith("data_") ? _id.slice("data_".length) : _id;
          const orders: Order[] = Array.isArray(doc.orders) ? (doc.orders as Order[]) : [];
          for (const o of orders) {
            allOrders.push({ ...o, userId });
          }
        }

        allOrders.sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime(),
        );

        return Response.json({ ok: true, orders: allOrders, count: allOrders.length });
      },

      POST: async ({ request }) => {
        const body = await request.json();
        const { orderId, status, location, description, riderName, riderPhone } = body as {
          orderId: string;
          status: string;
          location?: string;
          description?: string;
          riderName?: string;
          riderPhone?: string;
        };

        if (!orderId || !status) {
          return Response.json({ ok: false, error: "orderId and status are required" }, { status: 400 });
        }

        const { supabaseAdmin } = await getDb();
        const { data: docs, error } = await supabaseAdmin.from("user_store_data").select("*");
        if (error) throw error;

        let targetDoc: Record<string, unknown> | null = null;
        let targetUserId = "";

        for (const doc of (docs ?? []) as Record<string, unknown>[]) {
          const orders: unknown[] = Array.isArray(doc.orders) ? (doc.orders as unknown[]) : [];
          if (orders.some((o) => (o as Record<string, unknown>)?.id === orderId)) {
            targetDoc = doc;
            targetUserId = ((doc.id as string) || "").replace(/^data_/, "");
            break;
          }
        }

        if (!targetDoc) {
          return Response.json({ ok: false, error: "Order not found" }, { status: 404 });
        }

        const orders: unknown[] = Array.isArray(targetDoc.orders) ? (targetDoc.orders as unknown[]) : [];
        const orderIdx = orders.findIndex((o) => (o as Record<string, unknown>)?.id === orderId);
        if (orderIdx === -1) {
          return Response.json({ ok: false, error: "Order not found" }, { status: 404 });
        }

        const order = orders[orderIdx] as Record<string, unknown>;
        const prevStatus = order.status;

        order.status = status;

        if (status === "out_for_delivery") {
          const shipment = (order.shipment as Record<string, unknown>) || {};
          if (riderName) shipment.riderName = riderName;
          if (riderPhone) shipment.riderPhone = riderPhone;
          order.shipment = shipment;
        }

        const event = {
          id: `evt-${Date.now()}`,
          status: status.toUpperCase(),
          location: location || (order.shipment as Record<string, unknown>)?.currentLocation || "Basketo Hub",
          description:
            description ||
            (status === "out_for_delivery"
              ? "Package is out for delivery with your local rider."
              : status === "delivered"
                ? "Order delivered to doorstep."
                : `Order status updated to ${status.replace("_", " ")}.`),
          timestamp: new Date().toLocaleString("en-IN"),
          completed: status === "delivered",
        };
        const shipment = (order.shipment as Record<string, unknown>) || {};
        shipment.events = (shipment.events as unknown[]) || [];
        shipment.events.push(event);
        order.shipment = shipment;

        if (status === "delivered") {
          order.shipment = {
            ...(order.shipment as Record<string, unknown>),
            estimatedDeliveryDate: new Date().toISOString().slice(0, 10),
          };
          order.canCancel = false;
          order.canReturn = true;
        }

        const updatedOrders = [...orders];
        updatedOrders[orderIdx] = order;

        await upsertDocument("user_store_data", {
          ...targetDoc,
          orders: updatedOrders,
          updated_at: new Date().toISOString(),
        });

        return Response.json({
          ok: true,
          orderId,
          prevStatus,
          newStatus: status,
          userId: targetUserId,
          event,
        });
      },
    },
  },
});
