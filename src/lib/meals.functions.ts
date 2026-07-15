import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listMeals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("meal_plans")
      .select("*")
      .eq("user_id", context.userId)
      .eq("plan_date", data.date)
      .order("meal_type");
    if (error) throw error;
    return { meals: rows ?? [] };
  });

export const addMeal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        plan_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        meal_type: z.enum(["breakfast", "lunch", "dinner", "snack"]),
        title: z.string().trim().min(1).max(160),
        notes: z.string().trim().max(400).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("meal_plans")
      .insert({ ...data, user_id: context.userId })
      .select()
      .single();
    if (error) throw error;
    return { meal: row };
  });

export const deleteMeal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("meal_plans")
      .delete()
      .eq("id", data.id)
      .eq("user_id", context.userId);
    if (error) throw error;
    return { ok: true };
  });
