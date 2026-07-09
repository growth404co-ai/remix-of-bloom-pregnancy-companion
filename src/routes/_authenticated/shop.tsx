import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getProfile } from "@/lib/profiles.functions";
import { useCart } from "@/hooks/use-cart";
import { useMemo, useState } from "react";
import { ShoppingCart, ExternalLink } from "lucide-react";
import { differenceInWeeks } from "date-fns";
import {
  PRODUCT_CATEGORIES,
  products as allProducts,
  getRecommendedForWeek,
  type Product,
  type ProductCategory,
} from "@/data/products";

const profileQuery = () =>
  queryOptions({ queryKey: ["profile"], queryFn: () => getProfile() });

type Tab = "All" | "Recommended" | ProductCategory;

export const Route = createFileRoute("/_authenticated/shop")({
  head: () => ({
    meta: [
      { title: "Shop — Bloom" },
      { name: "description", content: "Curated pregnancy essentials from trusted brands." },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(profileQuery());
  },
  component: ShopPage,
});

function isEmoji(s: string) {
  // Very lightweight: treat short non-URL strings as emoji.
  return !/^https?:\/\//i.test(s) && s.length <= 6;
}

function ShopPage() {
  const { data: profileData } = useSuspenseQuery(profileQuery());
  const profile = profileData?.profile;

  const dueDate = profile?.due_date ? new Date(profile.due_date) : null;
  const now = new Date();
  const currentWeek = dueDate
    ? Math.max(1, Math.min(40, 40 - differenceInWeeks(dueDate, now)))
    : null;

  const recommended = useMemo(
    () => (currentWeek ? getRecommendedForWeek(Math.round(currentWeek)) : []),
    [currentWeek],
  );

  const tabs: Tab[] = [
    "All",
    ...(currentWeek ? (["Recommended"] as Tab[]) : []),
    ...PRODUCT_CATEGORIES,
  ];
  const [active, setActive] = useState<Tab>(currentWeek ? "Recommended" : "All");

  const totalItems = useCart((s) => s.totalItems());

  const filtered: Product[] =
    active === "All"
      ? allProducts
      : active === "Recommended"
        ? recommended
        : allProducts.filter((p) => p.category === active);

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

      {/* Affiliate disclosure */}
      <div className="mx-4 mb-2 rounded-xl border border-[var(--bloom-border)] bg-[var(--rose-light)]/60 px-3 py-2 text-[12px] leading-snug text-[var(--rose-dark)]">
        This app may earn a commission from purchases made through the links below.
      </div>

      {/* Week callout */}
      {currentWeek && active === "Recommended" && (
        <p className="px-5 pb-1 text-xs text-[var(--bloom-muted)]">
          Recommended for Week {Math.round(currentWeek)}
        </p>
      )}

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setActive(t)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] transition-colors ${
              active === t
                ? "bg-[var(--rose)] text-white"
                : "border border-[var(--bloom-border)] bg-white text-[var(--bloom-muted)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Product grid: 2 cols mobile, more on wider screens */}
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((product) => (
          <article
            key={product.id}
            className="flex flex-col overflow-hidden rounded-2xl border border-[var(--bloom-border)] bg-white shadow-[0_2px_10px_-6px_rgba(0,0,0,0.08)] transition-shadow hover:shadow-[0_6px_20px_-10px_rgba(0,0,0,0.15)]"
          >
            <div className="flex h-[110px] items-center justify-center bg-[var(--rose-light)] text-4xl">
              {isEmoji(product.imageUrl) ? (
                <span>{product.imageUrl}</span>
              ) : (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
            <div className="flex flex-1 flex-col p-3">
              <p className="text-[13px] font-medium leading-tight text-[var(--ink)]">
                {product.name}
              </p>
              <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[var(--bloom-muted)]">
                {product.description}
              </p>
              <p className="mt-2 text-[15px] font-medium text-[var(--rose)]">{product.price}</p>
              <button
                onClick={() =>
                  window.open(product.affiliateUrl, "_blank", "noopener,noreferrer")
                }
                className="mt-2 inline-flex items-center justify-center gap-1 rounded-full bg-[var(--rose)] px-3 py-1.5 text-[12px] font-medium text-white transition-opacity hover:opacity-90"
              >
                Shop Now <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="px-5 py-8 text-center text-sm text-[var(--bloom-muted)]">
          No products in this category yet.
        </p>
      )}

      <div className="h-6" />
    </div>
  );
}
