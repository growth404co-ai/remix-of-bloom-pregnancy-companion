import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listContractions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("contractions")
      .select("*")
      .eq("user_id", context.userId)
      .order("started_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return { contractions: data ?? [] };
  });

export const recordContraction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        started_at: z.string(),
        ended_at: z.string().nullable().optional(),
        intensity: z.number().int().min(1).max(10).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("contractions")
      .insert({
        user_id: context.userId,
        started_at: data.started_at,
        ended_at: data.ended_at ?? null,
        intensity: data.intensity ?? null,
      })
      .select()
      .single();
    if (error) throw error;
    return { contraction: row };
  });

export const clearContractions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("contractions")
      .delete()
      .eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });
