import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { generateText, Output } from "ai";

export const listSymptomChecks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("symptom_checks")
      .select("*")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return { checks: data ?? [] };
  });

const checkSchema = z.object({
  symptoms: z.array(z.string().trim().min(1).max(80)).min(1).max(20),
  notes: z.string().trim().max(1000).optional(),
  week: z.number().int().min(1).max(45).optional(),
});

const resultSchema = z.object({
  risk_level: z.enum(["low", "medium", "urgent"]),
  advice: z.string(),
});

export const runSymptomCheck = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => checkSchema.parse(input))
  .handler(async ({ data, context }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const gateway = createLovableAiGatewayProvider(key);

    let risk: "low" | "medium" | "urgent" = "low";
    let advice = "";

    try {
      const { output } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        experimental_output: Output.object({ schema: resultSchema }),
        system:
          "You are a pregnancy triage assistant. Classify symptoms into low, medium, or urgent risk. " +
          "URGENT: heavy bleeding, severe abdominal pain, severe headache with vision changes, reduced fetal movement, water breaking early, seizures, chest pain, difficulty breathing. " +
          "MEDIUM: persistent headache, moderate swelling, fever, painful urination, prolonged vomiting. " +
          "LOW: common pregnancy discomforts. " +
          "Advice must be short markdown (<=120 words), reassuring, mention when to call a provider, and NEVER diagnose.",
        prompt: `Pregnancy week: ${data.week ?? "unknown"}\nSymptoms: ${data.symptoms.join(", ")}\nNotes: ${data.notes ?? "(none)"}`,
      });
      risk = output.risk_level;
      advice = output.advice;
    } catch {
      risk = "medium";
      advice =
        "I couldn't complete an automated review. If any symptom feels severe or unusual, please contact your healthcare provider.";
    }

    const { data: row, error } = await context.supabase
      .from("symptom_checks")
      .insert({
        user_id: context.userId,
        symptoms: data.symptoms,
        notes: data.notes ?? null,
        risk_level: risk,
        ai_advice: advice,
      })
      .select()
      .single();
    if (error) throw error;
    return { check: row };
  });
