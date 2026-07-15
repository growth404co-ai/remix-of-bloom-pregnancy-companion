import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function generateCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export const getMyPartnerCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: prof, error } = await context.supabase
      .from("profiles")
      .select("partner_invite_code")
      .eq("id", context.userId)
      .single();
    if (error) throw error;
    if (prof?.partner_invite_code) return { code: prof.partner_invite_code };
    // Generate a unique-ish code (retry a couple times)
    for (let i = 0; i < 3; i++) {
      const code = generateCode();
      const { error: upErr } = await context.supabase
        .from("profiles")
        .update({ partner_invite_code: code })
        .eq("id", context.userId);
      if (!upErr) return { code };
    }
    throw new Error("Could not generate invite code");
  });

export const listPartnerLinks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    // as owner
    const { data: viewers } = await context.supabase
      .from("partner_links")
      .select("id, partner_id, created_at")
      .eq("owner_id", context.userId);
    // as partner
    const { data: watching } = await context.supabase
      .from("partner_links")
      .select("id, owner_id, created_at")
      .eq("partner_id", context.userId);
    return { viewers: viewers ?? [], watching: watching ?? [] };
  });

export const joinAsPartner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ code: z.string().trim().min(4).max(12) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const code = data.code.toUpperCase();
    const { data: owner, error } = await context.supabase
      .from("profiles")
      .select("id")
      .eq("partner_invite_code", code)
      .maybeSingle();
    if (error) throw error;
    if (!owner) throw new Error("Invalid invite code");
    if (owner.id === context.userId) throw new Error("You cannot link to yourself");
    const { error: insErr } = await context.supabase
      .from("partner_links")
      .insert({ owner_id: owner.id, partner_id: context.userId });
    if (insErr && !insErr.message.includes("duplicate")) throw insErr;
    return { ok: true };
  });

export const unlinkPartner = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("partner_links")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
