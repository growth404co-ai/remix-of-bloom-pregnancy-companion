import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getTrackerLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("tracker_logs")
      .select("*")
      .eq("user_id", context.userId)
      .order("logged_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return { logs: data ?? [] };
  });

const ALLOWED_LOG_TYPES = [
  "mood",
  "symptom",
  "weight",
  "kick",
  "appointment",
  "photo",
  "water",
  "sleep",
  "nutrition",
  "exercise",
] as const;

const createTrackerLogSchema = z.object({
  log_type: z.enum(ALLOWED_LOG_TYPES),
  value: z.unknown().optional(),
  note: z.string().trim().max(1000).optional(),
});

export const createTrackerLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => createTrackerLogSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("tracker_logs")
      .insert({
        user_id: context.userId,
        log_type: data.log_type,
        value: data.value as any,
        note: data.note,
      })
      .select()
      .single();
    if (error) throw error;
    return { log: row };
  });
