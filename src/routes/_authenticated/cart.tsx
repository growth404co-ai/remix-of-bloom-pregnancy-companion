import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useCart } from "@/hooks/use-cart";
import { useServerFn } from "@tanstack/react-start";
import { createOrder } from "@/lib/shop.functions";
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/_authenticated/cart")({
  head: () => ({
    meta: [
      { title: "Cart — Bloom" },
      { name: "description", content: "Your shopping cart" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const navigate = useNavigate();
  const items = useCart((s) => s.items);
  const updateQuantity = useCart((s) => s.updateQuantity);
  const removeItem = useCart((s) => s.removeItem);
  const clearCart = useCart((s) => s.clearCart);
  const totalCents = useCart((s) => s.totalCents());
  const createOrderFn = useServerFn(createOrder);
  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setCheckingOut(true);
    try {
      await createOrderFn({
        data: {
          items: items.map((i) => ({ id: i.id, name: i.name, price_cents: i.price_cents, quantity: i.quantity })),
          total_cents: totalCents,
        },
      });
      clearCart();
      navigate({ to: "/shop" });
    } catch {
      // ignore
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col px-5 py-4">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: "/shop" })}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--bloom-border)] bg-white"
        >
          <ArrowLeft className="h-4 w-4 text-[var(--ink)]" />
        </button>
        <h1 className="font-serif text-xl text-[var(--ink)]">My cart</h1>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <ShoppingBag className="mb-3 h-12 w-12 text-[var(--bloom-muted)]" />
          <p className="text-sm text-[var(--bloom-muted)]">
            Your cart is empty.
            <br />
            Head to the shop to add items!
          </p>
          <Link
            to="/shop"
            className="mt-4 rounded-xl bg-[var(--rose)] px-6 py-2.5 text-sm font-medium text-white"
          >
            Browse shop
          </Link>
        </div>
      ) : (
        <>
          <div className="flex-1">
            {items.map((item) => (
              <div
                key={item.id}
                className="mb-3 flex items-center gap-3 rounded-2xl border border-[var(--bloom-border)] bg-white p-3.5"
              >
                <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-xl bg-[var(--rose-light)] text-2xl">
                  {item.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--ink)]">{item.name}</p>
                  <p className="text-xs text-[var(--bloom-muted)]">
                    Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-[15px] font-medium text-[var(--rose)]">
                  ${((item.price_cents * item.quantity) / 100).toFixed(2)}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--bloom-border)]"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--rose)] text-white"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="ml-1 flex h-7 w-7 items-center justify-center rounded-full text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-[var(--bloom-border)] bg-white p-4">
            <div className="flex justify-between text-sm text-[var(--bloom-muted)]">
              <span>Subtotal</span>
              <span>${(totalCents / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-[var(--bloom-muted)]">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="mt-2 flex justify-between text-base font-medium text-[var(--ink)]">
              <span>Total</span>
              <span>${(totalCents / 100).toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={checkingOut}
              className="mt-3 w-full rounded-xl bg-[var(--rose)] py-3.5 text-sm font-medium text-white transition-colors hover:bg-[var(--rose-dark)] disabled:opacity-50"
            >
              {checkingOut ? "Processing..." : "Checkout"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
