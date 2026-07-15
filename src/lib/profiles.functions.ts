import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("profiles")
      .select("*")
      .eq("id", context.userId)
      .single();
    if (error) throw error;
    return { profile: data };
  });

const updateProfileSchema = z.object({
  display_name: z.string().trim().min(1).max(80).optional(),
  due_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)")
    .refine((s) => !Number.isNaN(new Date(s).getTime()), "Invalid date")
    .optional(),
  language: z.string().trim().min(2).max(8).optional(),
  timezone: z.string().trim().min(1).max(64).optional(),
  avatar_url: z.string().trim().max(500).nullable().optional(),
  partner_name: z.string().trim().max(80).nullable().optional(),
  health_conditions: z.array(z.string().trim().max(80)).max(20).optional(),
  dietary_preferences: z.array(z.string().trim().max(80)).max(20).optional(),
  pregnancy_history: z.string().trim().max(1000).nullable().optional(),
  previous_pregnancies: z.number().int().min(0).max(20).optional(),
});

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateProfileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const patch: Partial<typeof data> = {};
    for (const key of Object.keys(data) as (keyof typeof data)[]) {
      const val = data[key];
      if (val !== undefined) (patch as Record<string, unknown>)[key] = val;
    }
    const { data: profile, error } = await context.supabase
      .from("profiles")
      .update(patch)
      .eq("id", context.userId)
      .select()
      .single();
    if (error) throw error;
    return { profile };
  });
