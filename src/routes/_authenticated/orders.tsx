import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getOrders } from "@/lib/shop.functions";
import { ArrowLeft, Package } from "lucide-react";

const ordersQuery = () =>
  queryOptions({ queryKey: ["orders"], queryFn: () => getOrders() });

export const Route = createFileRoute("/_authenticated/orders")({
  head: () => ({
    meta: [
      { title: "My orders — Bloom" },
      { name: "description", content: "Your order history" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(ordersQuery()),
  component: OrdersPage,
});

type OrderItem = { id: string; name: string; price_cents: number; quantity: number };

function OrdersPage() {
  const navigate = useNavigate();
  const { data } = useSuspenseQuery(ordersQuery());
  const orders = data?.orders ?? [];

  return (
    <div className="flex min-h-screen flex-col px-5 py-4">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--bloom-border)] bg-white"
        >
          <ArrowLeft className="h-4 w-4 text-[var(--ink)]" />
        </button>
        <h1 className="font-serif text-xl text-[var(--ink)]">My orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Package className="mb-3 h-12 w-12 text-[var(--bloom-muted)]" />
          <p className="text-sm text-[var(--bloom-muted)]">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => {
            const items = (o.items as unknown as OrderItem[]) ?? [];
            const date = new Date(o.created_at);
            return (
              <div
                key={o.id}
                className="rounded-2xl border border-[var(--bloom-border)] bg-white p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[var(--ink)]">
                      Order #{o.id.slice(0, 8)}
                    </p>
                    <p className="text-xs text-[var(--bloom-muted)]">
                      {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--rose-light)] px-2.5 py-1 text-[11px] font-medium capitalize text-[var(--rose)]">
                    {o.status}
                  </span>
                </div>
                <div className="mt-3 space-y-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs text-[var(--bloom-muted)]">
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>${((item.price_cents * item.quantity) / 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-between border-t border-[var(--bloom-border)] pt-3 text-sm font-medium text-[var(--ink)]">
                  <span>Total</span>
                  <span>${(o.total_cents / 100).toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div className="h-6" />
    </div>
  );
}
