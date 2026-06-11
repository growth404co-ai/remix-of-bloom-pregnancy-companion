import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      items: { id: string; name: string; price_cents: number; quantity: number }[];
      total_cents: number;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const { data: order, error } = await context.supabase
      .from("orders")
      .insert({
        user_id: context.userId,
        stripe_session_id: "mock-" + crypto.randomUUID(),
        status: "completed",
        total_cents: data.total_cents,
        items: data.items as any,
      })
      .select()
      .single();
    if (error) throw error;
    return { order };
  });

export const getOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("orders")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { orders: data ?? [] };
  });
