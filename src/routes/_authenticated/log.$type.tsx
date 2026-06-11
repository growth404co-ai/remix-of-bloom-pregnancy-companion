import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createTrackerLog } from "@/lib/tracker.functions";
import { ArrowLeft, Save } from "lucide-react";

export const Route = createFileRoute("/_authenticated/log/$type")({
  head: () => ({
    meta: [
      { title: "Log Entry — Bloom" },
      { name: "description", content: "Log a pregnancy entry" },
    ],
  }),
  component: LogPage,
});

const moods = ["😢", "😟", "😐", "🙂", "😊"];
const symptomsList = [
  "Nausea",
  "Fatigue",
  "Back pain",
  "Heartburn",
  "Swelling",
  "Headache",
  "Insomnia",
  "Cravings",
];

function LogPage() {
  const { type } = Route.useParams();
  const navigate = useNavigate();
  const saveLog = useServerFn(createTrackerLog);
  const [note, setNote] = useState("");
  const [mood, setMood] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [weight, setWeight] = useState("");
  const [kickCount, setKickCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const toggleSymptom = (s: string) => {
    setSymptoms((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const handleSubmit = async () => {
    setLoading(true);
    let value: Record<string, unknown> = {};
    if (type === "mood") value = { mood };
    if (type === "symptom") value = { symptoms };
    if (type === "weight") value = { weight: parseFloat(weight) || 0 };
    if (type === "kick") value = { count: kickCount };

    try {
      await saveLog({ data: { log_type: type, value, note } });
      navigate({ to: "/tracker" });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col px-5 py-4">
      <div className="mb-4 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: "/tracker" })}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--bloom-border)] bg-white"
        >
          <ArrowLeft className="h-4 w-4 text-[var(--ink)]" />
        </button>
        <h1 className="font-serif text-xl capitalize text-[var(--ink)]">{type}</h1>
      </div>

      {type === "mood" && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-[var(--ink)]">How are you feeling?</p>
          <div className="flex gap-3">
            {moods.map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-transform ${
                  mood === m ? "scale-110 ring-2 ring-[var(--rose)]" : ""
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      {type === "symptom" && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-[var(--ink)]">What symptoms do you have?</p>
          <div className="flex flex-wrap gap-2">
            {symptomsList.map((s) => (
              <button
                key={s}
                onClick={() => toggleSymptom(s)}
                className={`rounded-full px-4 py-2 text-sm transition-colors ${
                  symptoms.includes(s)
                    ? "bg-[var(--rose)] text-white"
                    : "border border-[var(--bloom-border)] bg-white text-[var(--ink)]"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {type === "weight" && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-[var(--ink)]">Current weight (kg)</p>
          <input
            type="number"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full rounded-xl border border-[var(--bloom-border)] bg-white py-3 px-4 text-sm text-[var(--ink)] outline-none focus:border-[var(--rose)]"
            placeholder="e.g. 65.5"
          />
        </div>
      )}

      {type === "kick" && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-[var(--ink)]">Kick count</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setKickCount((c) => Math.max(0, c - 1))}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--bloom-border)] bg-white text-xl"
            >
              −
            </button>
            <span className="min-w-[40px] text-center text-2xl font-medium text-[var(--ink)]">{kickCount}</span>
            <button
              onClick={() => setKickCount((c) => c + 1)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--rose)] text-xl text-white"
            >
              +
            </button>
          </div>
        </div>
      )}

      {type === "appointment" && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-[var(--ink)]">Appointment notes</p>
        </div>
      )}

      {type === "photo" && (
        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-[var(--ink)]">Bump photo</p>
          <p className="text-sm text-[var(--bloom-muted)]">Photo upload coming soon — save a note for now.</p>
        </div>
      )}

      <div className="mb-4">
        <p className="mb-2 text-sm font-medium text-[var(--ink)]">Note (optional)</p>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="w-full resize-none rounded-xl border border-[var(--bloom-border)] bg-white py-3 px-4 text-sm text-[var(--ink)] outline-none focus:border-[var(--rose)]"
          placeholder="Any thoughts or details..."
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--rose)] py-3.5 text-sm font-medium text-white transition-colors hover:bg-[var(--rose-dark)] disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {loading ? "Saving..." : "Save entry"}
      </button>
    </div>
  );
}
