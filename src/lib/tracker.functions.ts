import { createServerFn } from "@tanstack/react-start";
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

export const createTrackerLog = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { log_type: string; value?: unknown; note?: string }) => input,
  )
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
