import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(ctx: {
  supabase: Awaited<ReturnType<typeof import("@supabase/supabase-js").createClient>>;
  userId: string;
}) {
  const { data, error } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId,
    _role: "admin",
  });
  if (error) throw error;
  if (!data) throw new Error("Forbidden: admin role required");
}

export const getAdminStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: isAdmin }, { count }] = await Promise.all([
      context.supabase.rpc("has_role", {
        _user_id: context.userId,
        _role: "admin",
      }),
      context.supabase
        .from("user_roles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin"),
    ]);
    return {
      isAdmin: Boolean(isAdmin),
      anyAdminExists: (count ?? 0) > 0,
    };
  });

export const claimFirstAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("claim_first_admin");
    if (error) throw error;
    return { claimed: Boolean(data) };
  });

export const listAllProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // Any signed-in user can list (RLS "Anyone can read products" allows it).
    const { data, error } = await context.supabase
      .from("products")
      .select("*")
      .order("name", { ascending: true });
    if (error) throw error;
    return { products: data ?? [] };
  });

const productInput = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(1000).optional().default(""),
  price_cents: z.number().int().min(0).max(10_000_000),
  category: z.string().trim().min(1).max(60),
  emoji: z.string().trim().max(8).optional().default("🛍️"),
  image_url: z.string().trim().max(1000).nullable().optional(),
  affiliate_url: z
    .string()
    .trim()
    .url("Must be a valid URL")
    .max(2000)
    .nullable()
    .optional(),
  trimesters: z.array(z.number().int().min(1).max(3)).optional().default([1, 2, 3]),
});

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => productInput.parse(input))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const payload = {
      name: data.name,
      description: data.description ?? "",
      price_cents: data.price_cents,
      category: data.category,
      emoji: data.emoji || "🛍️",
      image_url: data.image_url ?? null,
      affiliate_url: data.affiliate_url ?? null,
      trimesters: data.trimesters ?? [1, 2, 3],
    };
    if (data.id) {
      const { data: row, error } = await context.supabase
        .from("products")
        .update(payload)
        .eq("id", data.id)
        .select()
        .single();
      if (error) throw error;
      return { product: row };
    }
    const { data: row, error } = await context.supabase
      .from("products")
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return { product: row };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ id: z.string().uuid() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context as never);
    const { error } = await context.supabase
      .from("products")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
