import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProducts } from "@/lib/products.functions";
import { getSavedIds, toggleSavedProduct } from "@/lib/saved.functions";
import { useCart } from "@/hooks/use-cart";
import { useState } from "react";
import { Heart, Plus, ShoppingCart } from "lucide-react";

const productsQuery = () =>
  queryOptions({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

const savedIdsQuery = () =>
  queryOptions({ queryKey: ["saved-ids"], queryFn: () => getSavedIds() });

const categories = ["All", "Vitamins", "Clothing", "Skincare", "Baby gear"];

export const Route = createFileRoute("/_authenticated/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Bloom" },
      { name: "description", content: "Pregnancy essentials shop" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(productsQuery()),
      context.queryClient.ensureQueryData(savedIdsQuery()),
    ]);
  },
  component: ShopPage,
});

function ShopPage() {
  const { data } = useSuspenseQuery(productsQuery());
  const { data: savedData } = useSuspenseQuery(savedIdsQuery());
  const savedIds = new Set(savedData?.ids ?? []);
  const products = data?.products ?? [];
  const [activeCategory, setActiveCategory] = useState("All");
  const addItem = useCart((s) => s.addItem);
  const totalItems = useCart((s) => s.totalItems());
  const qc = useQueryClient();
  const toggle = useServerFn(toggleSavedProduct);

  const handleToggleSave = async (productId: string) => {
    await toggle({ data: { product_id: productId } });
    qc.invalidateQueries({ queryKey: ["saved-ids"] });
    qc.invalidateQueries({ queryKey: ["saved-products"] });
  };

  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  return (
    <div className="flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3">
        <h1 className="font-serif text-2xl text-[var(--ink)]">Shop</h1>
        <Link
          to="/cart"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--bloom-border)] bg-white text-[var(--rose)]"
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--rose)] px-1 text-[9px] font-bold text-white">
              {totalItems}
            </span>
          )}
        </Link>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] transition-colors ${
              activeCategory === cat
                ? "bg-[var(--rose)] text-white"
                : "border border-[var(--bloom-border)] bg-white text-[var(--bloom-muted)]"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 gap-3 p-4">
        {filtered.map((product: { id: string; name: string; emoji: string; price_cents: number; rating: number; review_count: number; category: string }) => (
          <div
            key={product.id}
            className="overflow-hidden rounded-2xl border border-[var(--bloom-border)] bg-white"
          >
            <Link
              to="/product/$id"
              params={{ id: product.id }}
              className="block"
            >
              <div className="relative flex h-[100px] items-center justify-center bg-[var(--rose-light)] text-4xl">
                {product.emoji}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleToggleSave(product.id);
                  }}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-sm"
                  aria-label={savedIds.has(product.id) ? "Unsave" : "Save"}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      savedIds.has(product.id)
                        ? "fill-[var(--rose)] text-[var(--rose)]"
                        : "text-[var(--bloom-muted)]"
                    }`}
                  />
                </button>
              </div>
              <div className="p-2.5 pb-3">
                <p className="text-[13px] font-medium text-[var(--ink)]">{product.name}</p>
                <p className="text-[15px] font-medium text-[var(--rose)]">
                  ${(product.price_cents / 100).toFixed(2)}
                </p>
                <p className="text-[11px] text-[var(--bloom-muted)]">
                  ⭐ {product.rating} · {product.review_count} reviews
                </p>
              </div>
            </Link>
            <div className="px-2.5 pb-3">
              <button
                onClick={() =>
                  addItem({
                    id: product.id,
                    name: product.name,
                    emoji: product.emoji,
                    price_cents: product.price_cents,
                  })
                }
                className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--rose)] text-white"
                aria-label="Add to cart"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

        ))}
      </div>

      <div className="h-6" />
    </div>
  );
}
