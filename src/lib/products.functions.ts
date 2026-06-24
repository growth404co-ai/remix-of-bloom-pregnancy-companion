import { createServerFn } from "@tanstack/react-start";

export const getProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("products").select("*").order("name");
  if (error) throw error;
  return { products: data ?? [] };
});

export const getProductById = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw error;
    return { product: row };
  });

export const getBabyWeek = createServerFn({ method: "GET" })
  .inputValidator((input: { week: number }) => input)
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("baby_weeks")
      .select("*")
      .eq("week", data.week)
      .maybeSingle();
    if (error) throw error;
    return { week: row };
  });

