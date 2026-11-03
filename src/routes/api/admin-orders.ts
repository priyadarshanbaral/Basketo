// Server API: Admin order management — full visibility into every customer order
// and the ability to update order status / broadcast tracking checkpoints.
// Orders live in the `user_data` collection as namespaced documents `data_${userId}`.
// This endpoint aggregates orders across all users so the admin can control fulfillment.
import { createFileRoute } from "@tanstack/react-router";
import { collections, getMongoDb } from "@/integrations/mongodb/client";
import type { Order } from "@/lib/flipkart-store";

export const Route = createFileRoute("/api/admin-orders")({
  server: {
    handlers: {
      GET: async () => {
        const c = await collections();
        const userData = await (await c).userData();

        // Load every namespaced user document and collect its orders.
        const docs = (await userData.find({}).toArray()) || [];

        const allOrders: Array<Order & { userId: string }> = [];
        for (const doc of docs) {
          const _id: string = doc._id || "";
          const userId = _id.startsWith("data_") ? _id.slice("data_".length) : _id;
          const orders: Order[] = (doc as any).orders || [];
          for (const o of orders) {
            allOrders.push({ ...o, userId });
          }
        }

        // Newest first.
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

        const c = await collections();
        const userData = await (await c).userData();

        // Find which user document contains this order.
        const docs = (await userData.find({}).toArray()) || [];
        let targetDoc: any = null;
        let targetUserId = "";

        for (const doc of docs) {
          const orders: any[] = (doc as any).orders || [];
          if (orders.some((o) => o.id === orderId)) {
            targetDoc = doc;
            targetUserId = (doc._id as string).replace(/^data_/, "");
            break;
          }
        }

        if (!targetDoc) {
          return Response.json({ ok: false, error: "Order not found" }, { status: 404 });
        }

        const orders: any[] = (targetDoc as any).orders || [];
        const orderIdx = orders.findIndex((o) => o.id === orderId);
        if (orderIdx === -1) {
          return Response.json({ ok: false, error: "Order not found" }, { status: 404 });
        }

        const order = orders[orderIdx];
        const prevStatus = order.status;

        // Update order status.
        order.status = status;

        // Update shipping address with rider details when out for delivery.
        if (status === "out_for_delivery") {
          if (riderName) order.shipment = { ...order.shipment, riderName } as any;
          if (riderPhone) order.shipment = { ...order.shipment, riderPhone } as any;
        }

        // Append a tracking checkpoint event.
        const event = {
          id: `evt-${Date.now()}`,
          status: status.toUpperCase(),
          location: location || order.shipment?.currentLocation || "Basketo Hub",
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
        order.shipment.events = order.shipment.events || [];
        order.shipment.events.push(event);

        // If delivered, mark completion fields.
        if (status === "delivered") {
          order.shipment.estimatedDeliveryDate = new Date().toISOString().slice(0, 10);
          order.canCancel = false;
          order.canReturn = true;
        }

        // Persist back to the user's namespaced document.
        await userData.replaceOne(
          { _id: targetDoc._id },
          { ...targetDoc, orders, updatedAt: new Date().toISOString() },
        );

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
