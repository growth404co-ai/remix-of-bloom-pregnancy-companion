import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listSymptomChecks, runSymptomCheck } from "@/lib/symptoms.functions";
import { getProfile } from "@/lib/profiles.functions";
import { AlertTriangle, ShieldCheck, Info } from "lucide-react";
import { useState } from "react";
import { differenceInWeeks, format } from "date-fns";
import ReactMarkdown from "react-markdown";

const historyQuery = () =>
  queryOptions({ queryKey: ["symptom-checks"], queryFn: () => listSymptomChecks() });
const profQuery = () => queryOptions({ queryKey: ["profile"], queryFn: () => getProfile() });

const COMMON = [
  "Nausea",
  "Fatigue",
  "Headache",
  "Back pain",
  "Swelling",
  "Cramping",
  "Bleeding",
  "Dizziness",
  "Heartburn",
  "Reduced fetal movement",
  "Contractions",
  "Fever",
  "Vision changes",
  "Difficulty breathing",
];

export const Route = createFileRoute("/_authenticated/symptoms")({
  head: () => ({ meta: [{ title: "Symptom Checker — Bloom" }] }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(historyQuery()),
      context.queryClient.ensureQueryData(profQuery()),
    ]);
  },
  component: SymptomsPage,
});

function SymptomsPage() {
  const { data: hist } = useSuspenseQuery(historyQuery());
  const { data: prof } = useSuspenseQuery(profQuery());
  const qc = useQueryClient();
  const run = useServerFn(runSymptomCheck);
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const due = prof?.profile?.due_date ? new Date(prof.profile.due_date) : null;
  const week = due
    ? Math.max(1, Math.min(40, 40 - differenceInWeeks(due, new Date())))
    : undefined;

  const toggle = (s: string) =>
    setSelected((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const submit = async () => {
    if (selected.length === 0) return;
    setLoading(true);
    try {
      await run({ data: { symptoms: selected, notes: notes || undefined, week } });
      setSelected([]);
      setNotes("");
      qc.invalidateQueries({ queryKey: ["symptom-checks"] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="px-5 py-3">
        <h1 className="font-serif text-2xl text-[var(--ink)]">Symptom Checker</h1>
        <p className="mt-1 text-sm text-[var(--bloom-muted)]">
          General guidance — not a diagnosis. Always call your provider if unsure.
        </p>
      </div>

      <div className="mx-4 space-y-3 rounded-2xl border border-[var(--bloom-border)] bg-white p-4">
        <p className="text-sm font-medium text-[var(--ink)]">Pick what you're feeling</p>
        <div className="flex flex-wrap gap-2">
          {COMMON.map((s) => {
            const active = selected.includes(s);
            return (
              <button
                key={s}
                onClick={() => toggle(s)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  active
                    ? "border-[var(--rose)] bg-[var(--rose)] text-white"
                    : "border-[var(--bloom-border)] bg-white text-[var(--ink)]"
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
        <textarea
          placeholder="Optional notes (e.g. severity, duration)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-[var(--bloom-border)] bg-white px-3 py-2 text-sm"
        />
        <button
          onClick={submit}
          disabled={loading || selected.length === 0}
          className="w-full rounded-lg bg-[var(--rose)] py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "Get guidance"}
        </button>
      </div>

      <div className="mx-4">
        <p className="mb-2 text-sm font-medium text-[var(--ink)]">Recent checks</p>
        {hist.checks.length === 0 && (
          <p className="rounded-xl border border-dashed border-[var(--bloom-border)] p-6 text-center text-sm text-[var(--bloom-muted)]">
            No symptom checks yet.
          </p>
        )}
        <div className="flex flex-col gap-2">
          {hist.checks.map((c) => (
            <RiskCard key={c.id} check={c} />
          ))}
        </div>
      </div>
      <div className="h-6" />
    </div>
  );
}

function RiskCard({
  check,
}: {
  check: {
    id: string;
    symptoms: string[];
    ai_advice: string | null;
    risk_level: string | null;
    created_at: string;
  };
}) {
  const level = check.risk_level ?? "low";
  const cfg =
    level === "urgent"
      ? { bg: "bg-red-50", text: "text-red-700", Icon: AlertTriangle, label: "Urgent" }
      : level === "medium"
        ? { bg: "bg-amber-50", text: "text-amber-700", Icon: Info, label: "Monitor" }
        : { bg: "bg-emerald-50", text: "text-emerald-700", Icon: ShieldCheck, label: "Low" };
  return (
    <div className={`rounded-xl border border-[var(--bloom-border)] ${cfg.bg} p-3`}>
      <div className="flex items-center gap-2">
        <cfg.Icon className={`h-4 w-4 ${cfg.text}`} />
        <span className={`text-xs font-semibold uppercase ${cfg.text}`}>{cfg.label}</span>
        <span className="ml-auto text-xs text-[var(--bloom-muted)]">
          {format(new Date(check.created_at), "MMM d, HH:mm")}
        </span>
      </div>
      <p className="mt-1 text-xs text-[var(--bloom-muted)]">{check.symptoms.join(", ")}</p>
      {check.ai_advice && (
        <div className="prose prose-sm mt-2 max-w-none text-sm text-[var(--ink)]">
          <ReactMarkdown>{check.ai_advice}</ReactMarkdown>
        </div>
      )}
      {level === "urgent" && (
        <p className="mt-2 text-xs font-semibold text-red-700">
          ⚠ Contact your healthcare provider or emergency services now.
        </p>
      )}
    </div>
  );
}
