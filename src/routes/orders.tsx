import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/orders")({
  component: OrdersRedirect,
});

function OrdersRedirect() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/account", search: { tab: "orders" } });
  }, [navigate]);

  return (
    <div className="flex h-screen items-center justify-center text-xs text-muted-foreground">
      Redirecting to your orders dashboard...
    </div>
  );
}
