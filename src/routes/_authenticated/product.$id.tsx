import { createFileRoute, useNavigate, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProductById } from "@/lib/products.functions";
import { getSavedIds, toggleSavedProduct } from "@/lib/saved.functions";
import { useCart } from "@/hooks/use-cart";
import { ArrowLeft, Heart, ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";

const productQuery = (id: string) =>
  queryOptions({
    queryKey: ["product", id],
    queryFn: () => getProductById({ data: { id } }),
  });

const savedIdsQuery = () =>
  queryOptions({ queryKey: ["saved-ids"], queryFn: () => getSavedIds() });

export const Route = createFileRoute("/_authenticated/product/$id")({
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.product?.name ?? "Product"} — Bloom` },
      {
        name: "description",
        content: loaderData?.product?.description ?? "Pregnancy essentials.",
      },
    ],
  }),
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(productQuery(params.id));
    if (!data?.product) throw notFound();
    await context.queryClient.ensureQueryData(savedIdsQuery());
    return { product: data.product };
  },
  errorComponent: ({ error }) => (
    <div className="p-6 text-sm text-[var(--bloom-muted)]">
      Couldn't load product. {error.message}
    </div>
  ),
  notFoundComponent: () => (
    <div className="p-6 text-sm text-[var(--bloom-muted)]">Product not found.</div>
  ),
  component: ProductPage,
});

const TRIMESTER_LABEL: Record<number, string> = { 1: "1st trimester", 2: "2nd trimester", 3: "3rd trimester" };

function ProductPage() {
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(productQuery(id));
  const { data: savedData } = useSuspenseQuery(savedIdsQuery());
  const product = data!.product!;
  const savedIds = new Set(savedData?.ids ?? []);
  const isSaved = savedIds.has(product.id);

  const addItem = useCart((s) => s.addItem);
  const totalItems = useCart((s) => s.totalItems());
  const qc = useQueryClient();
  const toggle = useServerFn(toggleSavedProduct);

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      emoji: product.emoji,
      price_cents: product.price_cents,
    });
    toast.success("Added to cart");
  };

  const handleSave = async () => {
    await toggle({ data: { product_id: product.id } });
    qc.invalidateQueries({ queryKey: ["saved-ids"] });
    qc.invalidateQueries({ queryKey: ["saved-products"] });
  };

  return (
    <div className="flex min-h-screen flex-col px-5 py-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => navigate({ to: "/shop" })}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--bloom-border)] bg-white"
          aria-label="Back"
        >
          <ArrowLeft className="h-4 w-4 text-[var(--ink)]" />
        </button>
        <Link
          to="/cart"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[var(--bloom-border)] bg-white text-[var(--rose)]"
        >
          <ShoppingCart className="h-4 w-4" />
          {totalItems > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--rose)] px-1 text-[9px] font-bold text-white">
              {totalItems}
            </span>
          )}
        </Link>
      </div>

      <div className="relative flex h-[220px] items-center justify-center rounded-3xl bg-[var(--rose-light)] text-[110px]">
        {product.emoji}
        <button
          onClick={handleSave}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm"
          aria-label={isSaved ? "Unsave" : "Save"}
        >
          <Heart
            className={`h-5 w-5 ${
              isSaved ? "fill-[var(--rose)] text-[var(--rose)]" : "text-[var(--bloom-muted)]"
            }`}
          />
        </button>
      </div>

      <div className="mt-5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--rose)]">
          {product.category}
        </p>
        <h1 className="mt-1 font-serif text-2xl text-[var(--ink)]">{product.name}</h1>
        <div className="mt-1 flex items-center gap-2 text-xs text-[var(--bloom-muted)]">
          <span>⭐ {product.rating}</span>
          <span>·</span>
          <span>{product.review_count} reviews</span>
        </div>
        <p className="mt-3 text-[22px] font-medium text-[var(--rose)]">
          ${(product.price_cents / 100).toFixed(2)}
        </p>
      </div>

      {product.trimesters && product.trimesters.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {product.trimesters.map((t) => (
            <span
              key={t}
              className="rounded-full border border-[var(--bloom-border)] bg-white px-3 py-1 text-[11px] text-[var(--ink)]"
            >
              Best for {TRIMESTER_LABEL[t] ?? `T${t}`}
            </span>
          ))}
        </div>
      )}

      {product.description && (
        <div className="mt-5">
          <h2 className="font-serif text-base text-[var(--ink)]">About</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink)]">
            {product.description}
          </p>
        </div>
      )}

      {product.benefits && product.benefits.length > 0 && (
        <div className="mt-5">
          <h2 className="font-serif text-base text-[var(--ink)]">Why moms love it</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {product.benefits.map((b, i) => (
              <li
                key={i}
                className="flex items-start gap-2.5 rounded-xl border border-[var(--bloom-border)] bg-white p-3 text-sm text-[var(--ink)]"
              >
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--rose)]" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="h-24" />

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-[480px] border-t border-[var(--bloom-border)] bg-white/95 p-4 backdrop-blur">
        <button
          onClick={handleAdd}
          className="w-full rounded-xl bg-[var(--rose)] py-3.5 text-sm font-medium text-white transition-colors hover:bg-[var(--rose-dark)]"
        >
          Add to cart · ${(product.price_cents / 100).toFixed(2)}
        </button>
      </div>
    </div>
  );
}
