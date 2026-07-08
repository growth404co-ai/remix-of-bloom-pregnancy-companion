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
});

export const updateProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => updateProfileSchema.parse(input))
  .handler(async ({ data, context }) => {
    const patch: {
      display_name?: string;
      due_date?: string;
      language?: string;
      timezone?: string;
      avatar_url?: string | null;
    } = {};
    if (data.display_name !== undefined) patch.display_name = data.display_name;
    if (data.due_date !== undefined) patch.due_date = data.due_date;
    if (data.language !== undefined) patch.language = data.language;
    if (data.timezone !== undefined) patch.timezone = data.timezone;
    if (data.avatar_url !== undefined) patch.avatar_url = data.avatar_url;

    const { data: profile, error } = await context.supabase
      .from("profiles")
      .update(patch)
      .eq("id", context.userId)
      .select()
      .single();
    if (error) throw error;
    return { profile };
  });
