import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getSavedProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("saved_products")
      .select("id, product_id, created_at, products(*)")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { saved: data ?? [] };
  });

export const getSavedIds = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("saved_products")
      .select("product_id")
      .eq("user_id", context.userId);
    if (error) throw error;
    return { ids: (data ?? []).map((r) => r.product_id) };
  });

export const toggleSavedProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { product_id: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: existing } = await context.supabase
      .from("saved_products")
      .select("id")
      .eq("user_id", context.userId)
      .eq("product_id", data.product_id)
      .maybeSingle();
    if (existing) {
      const { error } = await context.supabase
        .from("saved_products")
        .delete()
        .eq("id", existing.id);
      if (error) throw error;
      return { saved: false };
    }
    const { error } = await context.supabase
      .from("saved_products")
      .insert({ user_id: context.userId, product_id: data.product_id });
    if (error) throw error;
    return { saved: true };
  });
