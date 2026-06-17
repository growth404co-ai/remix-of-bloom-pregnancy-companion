import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSavedProducts, toggleSavedProduct } from "@/lib/saved.functions";
import { ArrowLeft, Heart } from "lucide-react";

const savedQuery = () =>
  queryOptions({ queryKey: ["saved-products"], queryFn: () => getSavedProducts() });

export const Route = createFileRoute("/_authenticated/saved")({
  head: () => ({
    meta: [
      { title: "Saved — Bloom" },
      { name: "description", content: "Your saved products" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(savedQuery()),
  component: SavedPage,
});

function SavedPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(savedQuery());
  const toggle = useServerFn(toggleSavedProduct);
  const saved = data?.saved ?? [];

  const handleRemove = async (productId: string) => {
    await toggle({ data: { product_id: productId } });
    qc.invalidateQueries({ queryKey: ["saved-products"] });
    qc.invalidateQueries({ queryKey: ["saved-ids"] });
  };

  return (
    <div className="flex min-h-screen flex-col px-5 py-4">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--bloom-border)] bg-white"
        >
          <ArrowLeft className="h-4 w-4 text-[var(--ink)]" />
        </button>
        <h1 className="font-serif text-xl text-[var(--ink)]">Saved products</h1>
      </div>

      {saved.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Heart className="mb-3 h-12 w-12 text-[var(--bloom-muted)]" />
          <p className="text-sm text-[var(--bloom-muted)]">
            Nothing saved yet.
            <br />
            Tap the heart on a product to save it.
          </p>
          <Link
            to="/shop"
            className="mt-4 rounded-xl bg-[var(--rose)] px-6 py-2.5 text-sm font-medium text-white"
          >
            Browse shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {saved.map((row) => {
            const p = row.products as unknown as {
              id: string;
              name: string;
              emoji: string;
              price_cents: number;
              rating: number;
              review_count: number;
            } | null;
            if (!p) return null;
            return (
              <div
                key={row.id}
                className="overflow-hidden rounded-2xl border border-[var(--bloom-border)] bg-white"
              >
                <div className="relative flex h-[100px] items-center justify-center bg-[var(--rose-light)] text-4xl">
                  {p.emoji}
                  <button
                    onClick={() => handleRemove(p.id)}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm"
                    aria-label="Remove from saved"
                  >
                    <Heart className="h-4 w-4 fill-[var(--rose)] text-[var(--rose)]" />
                  </button>
                </div>
                <div className="p-2.5 pb-3">
                  <p className="text-[13px] font-medium text-[var(--ink)]">{p.name}</p>
                  <p className="text-[15px] font-medium text-[var(--rose)]">
                    ${(p.price_cents / 100).toFixed(2)}
                  </p>
                  <p className="text-[11px] text-[var(--bloom-muted)]">
                    ⭐ {p.rating} · {p.review_count} reviews
                  </p>
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
