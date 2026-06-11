import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getProducts = createServerFn({ method: "GET" }).handler(async () => {
  const { supabase } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.from("products").select("*").order("name");
  if (error) throw error;
  return { products: data ?? [] };
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
