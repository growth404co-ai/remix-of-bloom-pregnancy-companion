import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  getAdminStatus,
  claimFirstAdmin,
  listAllProducts,
  upsertProduct,
  deleteProduct,
} from "@/lib/admin.functions";
import { useProductImageUrl } from "@/hooks/use-product-image-url";
import { ArrowLeft, Plus, Pencil, Trash2, Upload, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

type ProductRow = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  category: string;
  emoji: string;
  image_url?: string | null;
  affiliate_url?: string | null;
  trimesters?: number[] | null;
};

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin — Bloom" },
      { name: "description", content: "Manage the Bloom product catalog." },
    ],
  }),
  beforeLoad: async () => {
    const status = await getAdminStatus();
    if (!status.anyAdminExists) {
      // Allow entering the page — will show a "claim admin" prompt.
      return { adminStatus: status };
    }
    if (!status.isAdmin) {
      throw redirect({ to: "/" });
    }
    return { adminStatus: status };
  },
  component: AdminPage,
});

function AdminPage() {
  const qc = useQueryClient();
  const statusQuery = useQuery({
    queryKey: ["admin-status"],
    queryFn: () => getAdminStatus(),
  });

  const claim = useMutation({
    mutationFn: () => claimFirstAdmin(),
    onSuccess: async (r) => {
      if (r.claimed) toast.success("You're now the admin.");
      else toast.error("Admin already claimed.");
      await qc.invalidateQueries({ queryKey: ["admin-status"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const status = statusQuery.data;

  if (!status) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-[var(--rose)]" />
      </div>
    );
  }

  if (!status.anyAdminExists && !status.isAdmin) {
    return (
      <div className="flex flex-col">
        <TopBar />
        <div className="mx-4 mt-6 rounded-2xl border border-[var(--bloom-border)] bg-white p-5 text-center">
          <ShieldCheck className="mx-auto h-8 w-8 text-[var(--rose)]" />
          <h2 className="mt-2 font-serif text-lg text-[var(--ink)]">Claim admin access</h2>
          <p className="mt-1 text-sm text-[var(--bloom-muted)]">
            No admin exists yet. Claim this app's admin role to manage products.
          </p>
          <button
            onClick={() => claim.mutate()}
            disabled={claim.isPending}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-[var(--rose)] px-5 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {claim.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Become admin
          </button>
        </div>
      </div>
    );
  }

  return <AdminPanel />;
}

function TopBar() {
  return (
    <div className="flex items-center gap-3 px-5 py-3">
      <Link to="/profile" className="text-[var(--bloom-muted)]">
        <ArrowLeft className="h-5 w-5" />
      </Link>
      <h1 className="font-serif text-2xl text-[var(--ink)]">Admin</h1>
    </div>
  );
}

function AdminPanel() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [showForm, setShowForm] = useState(false);

  const productsQuery = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => listAllProducts(),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteProduct({ data: { id } }),
    onSuccess: async () => {
      toast.success("Product deleted");
      await qc.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const list = (productsQuery.data?.products ?? []) as ProductRow[];

  return (
    <div className="flex flex-col">
      <TopBar />
      <div className="flex items-center justify-between px-5 pb-2">
        <p className="text-sm text-[var(--bloom-muted)]">
          {list.length} product{list.length === 1 ? "" : "s"}
        </p>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-full bg-[var(--rose)] px-4 py-2 text-sm font-medium text-white"
        >
          <Plus className="h-4 w-4" /> New
        </button>
      </div>

      {showForm && (
        <ProductForm
          initial={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={async () => {
            setShowForm(false);
            setEditing(null);
            await qc.invalidateQueries({ queryKey: ["admin-products"] });
          }}
        />
      )}

      <div className="flex flex-col gap-2 px-4 pb-6">
        {productsQuery.isLoading && (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--rose)]" />
          </div>
        )}
        {list.map((p) => (
          <ProductRowCard
            key={p.id}
            product={p}
            onEdit={() => {
              setEditing(p);
              setShowForm(true);
            }}
            onDelete={() => {
              if (confirm(`Delete "${p.name}"?`)) remove.mutate(p.id);
            }}
          />
        ))}
        {!productsQuery.isLoading && list.length === 0 && (
          <p className="py-8 text-center text-sm text-[var(--bloom-muted)]">
            No products yet. Click New to add one.
          </p>
        )}
      </div>
    </div>
  );
}

function ProductRowCard({
  product,
  onEdit,
  onDelete,
}: {
  product: ProductRow;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const url = useProductImageUrl(product.image_url ?? null);
  return (
    <div className="flex items-center gap-3 rounded-xl border border-[var(--bloom-border)] bg-white p-3">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--rose-light)] text-2xl">
        {url ? (
          <img src={url} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <span>{product.emoji || "🛍️"}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-[var(--ink)]">{product.name}</p>
        <p className="truncate text-[11px] text-[var(--bloom-muted)]">
          {product.category} · ${(product.price_cents / 100).toFixed(2)}
        </p>
        {product.affiliate_url && (
          <p className="truncate text-[10px] text-[var(--rose)]">{product.affiliate_url}</p>
        )}
      </div>
      <button
        onClick={onEdit}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--bloom-border)] text-[var(--bloom-muted)]"
        aria-label="Edit"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={onDelete}
        className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--bloom-border)] text-red-500"
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

const CATEGORY_OPTIONS = [
  "Maternity Wear",
  "Nursery",
  "Postpartum Care",
  "By Trimester",
];

function ProductForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: ProductRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const upsert = useServerFn(upsertProduct);
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [priceDollars, setPriceDollars] = useState(
    initial ? (initial.price_cents / 100).toFixed(2) : "",
  );
  const [category, setCategory] = useState(initial?.category ?? CATEGORY_OPTIONS[0]);
  const [emoji, setEmoji] = useState(initial?.emoji ?? "🛍️");
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.image_url ?? null);
  const [affiliateUrl, setAffiliateUrl] = useState(initial?.affiliate_url ?? "");
  const [trimesters, setTrimesters] = useState<number[]>(
    initial?.trimesters ?? [1, 2, 3],
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const previewUrl = useProductImageUrl(imageUrl);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (error) throw error;
      setImageUrl(path);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    const cents = Math.round(parseFloat(priceDollars) * 100);
    if (!Number.isFinite(cents) || cents < 0) {
      toast.error("Enter a valid price");
      return;
    }
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      await upsert({
        data: {
          ...(initial?.id ? { id: initial.id } : {}),
          name: name.trim(),
          description: description.trim(),
          price_cents: cents,
          category,
          emoji: emoji || "🛍️",
          image_url: imageUrl || null,
          affiliate_url: affiliateUrl.trim() || null,
          trimesters,
        },
      });
      toast.success(initial ? "Product updated" : "Product created");
      onSaved();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-[var(--cream)] p-5 sm:rounded-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-xl text-[var(--ink)]">
            {initial ? "Edit product" : "New product"}
          </h2>
          <button onClick={onClose} className="text-sm text-[var(--bloom-muted)]">
            Cancel
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--bloom-border)] bg-[var(--rose-light)] text-3xl">
              {previewUrl ? (
                <img src={previewUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span>{emoji || "🛍️"}</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--bloom-border)] bg-white px-3 py-1.5 text-xs text-[var(--ink)] disabled:opacity-60"
              >
                {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
                Upload image
              </button>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="text-[11px] text-red-500"
                >
                  Remove image
                </button>
              )}
              <input
                value={imageUrl && /^https?:\/\//.test(imageUrl) ? imageUrl : ""}
                onChange={(e) => setImageUrl(e.target.value || null)}
                placeholder="Or paste image URL"
                className="w-56 rounded-md border border-[var(--bloom-border)] bg-white px-2 py-1 text-[11px]"
              />
            </div>
          </div>

          <Field label="Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-[var(--bloom-border)] bg-white px-3 py-2 text-sm"
              placeholder="e.g. Organic Prenatal Vitamins"
            />
          </Field>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full rounded-md border border-[var(--bloom-border)] bg-white px-3 py-2 text-sm"
              placeholder="Short description shown on the shop card"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Price (USD)">
              <input
                inputMode="decimal"
                value={priceDollars}
                onChange={(e) => setPriceDollars(e.target.value)}
                className="w-full rounded-md border border-[var(--bloom-border)] bg-white px-3 py-2 text-sm"
                placeholder="24.99"
              />
            </Field>
            <Field label="Emoji fallback">
              <input
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="w-full rounded-md border border-[var(--bloom-border)] bg-white px-3 py-2 text-sm"
                placeholder="🛍️"
              />
            </Field>
          </div>

          <Field label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-[var(--bloom-border)] bg-white px-3 py-2 text-sm"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Amazon affiliate URL">
            <input
              value={affiliateUrl}
              onChange={(e) => setAffiliateUrl(e.target.value)}
              className="w-full rounded-md border border-[var(--bloom-border)] bg-white px-3 py-2 text-sm"
              placeholder="https://www.amazon.com/dp/…?tag=youraffid-20"
            />
          </Field>

          <Field label="Recommended trimesters">
            <div className="flex gap-2">
              {[1, 2, 3].map((t) => {
                const active = trimesters.includes(t);
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      setTrimesters((prev) =>
                        prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t].sort(),
                      )
                    }
                    className={`rounded-full border px-3 py-1 text-xs ${
                      active
                        ? "border-[var(--rose)] bg-[var(--rose)] text-white"
                        : "border-[var(--bloom-border)] bg-white text-[var(--ink)]"
                    }`}
                  >
                    T{t}
                  </button>
                );
              })}
            </div>
          </Field>

          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--rose)] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {initial ? "Save changes" : "Create product"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-medium uppercase tracking-wide text-[var(--bloom-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}
