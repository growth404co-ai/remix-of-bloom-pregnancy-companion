import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getNotifications = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("notifications")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return { notifications: data ?? [] };
  });

export const getUnreadCount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { count, error } = await context.supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", context.userId)
      .eq("read", false);
    if (error) throw error;
    return { count: count ?? 0 };
  });

export const markAllRead = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", context.userId)
      .eq("read", false);
    if (error) throw error;
    return { ok: true };
  });

export const createNotification = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        title: z.string().trim().min(1).max(200),
        body: z.string().trim().max(2000).optional(),
        type: z.enum(["info", "welcome", "order", "reminder", "alert"]).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("notifications").insert({
      user_id: context.userId,
      title: data.title,
      body: data.body ?? null,
      type: data.type ?? "info",
    });
    if (error) throw error;
    return { ok: true };
  });
