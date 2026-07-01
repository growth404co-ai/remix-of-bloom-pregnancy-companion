import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const MOOD_LABELS: Record<string, string> = {
  "😢": "very sad",
  "😟": "worried",
  "😐": "neutral",
  "🙂": "okay",
  "😊": "happy",
};

export const suggestMoodRemedy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ mood: z.string().min(1).max(8), note: z.string().max(500).optional() }).parse(input),
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const label = MOOD_LABELS[data.mood] ?? data.mood;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are Bloom, a warm pregnancy companion. Given a mood, reply with a very short (max 90 words) supportive remedy in markdown. Use 3 concise bullets of safe, evidence-based, pregnancy-friendly suggestions. End with a one-line encouragement. Never suggest medications.",
          },
          {
            role: "user",
            content: `I'm feeling ${label}${data.note ? `. Note: ${data.note}` : ""}. Suggest a gentle remedy.`,
          },
        ],
      }),
    });
    if (!res.ok) throw new Error(`AI error ${res.status}`);
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = json.choices?.[0]?.message?.content ?? "Take a slow deep breath — you're doing beautifully. 💗";
    return { remedy: text };
  });
