import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { createTrackerLog } from "@/lib/tracker.functions";
import { createNotification } from "@/lib/notifications.functions";
import { suggestMoodRemedy } from "@/lib/mood.functions";
import { ArrowLeft, Save, Sparkles } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
  const qc = useQueryClient();
  const saveLog = useServerFn(createTrackerLog);
  const notify = useServerFn(createNotification);
  const askRemedy = useServerFn(suggestMoodRemedy);

  const [note, setNote] = useState("");
  const [mood, setMood] = useState("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [weight, setWeight] = useState("");
  const [kickCount, setKickCount] = useState(0);
  const [apptTitle, setApptTitle] = useState("");
  const [apptDate, setApptDate] = useState("");
  const [remedy, setRemedy] = useState<string | null>(null);
  const [remedyLoading, setRemedyLoading] = useState(false);
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
    if (type === "appointment") value = { title: apptTitle, date: apptDate };

    try {
      await saveLog({ data: { log_type: type, value, note } });

      if (type === "appointment" && apptDate) {
        const when = new Date(apptDate);
        await notify({
          data: {
            title: `Reminder: ${apptTitle || "Appointment"}`,
            body: `Scheduled for ${when.toLocaleString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}`,
            type: "reminder",
          },
        });
        // Ask browser permission and schedule an in-app reminder if page open
        if (typeof window !== "undefined" && "Notification" in window) {
          if (Notification.permission === "default") {
            try { await Notification.requestPermission(); } catch { /* ignore */ }
          }
          const msUntil = when.getTime() - Date.now();
          if (msUntil > 0 && msUntil < 2_147_000_000) {
            setTimeout(() => {
              if (Notification.permission === "granted") {
                new Notification("Appointment reminder", {
                  body: `${apptTitle || "Appointment"} is starting soon`,
                });
              }
            }, msUntil);
          }
        }
      }

      if (type === "mood" && mood) {
        try {
          setRemedyLoading(true);
          const r = await askRemedy({ data: { mood, note } });
          setRemedy(r.remedy);
          await notify({
            data: {
              title: `Mood remedy for ${mood}`,
              body: r.remedy.slice(0, 500),
              type: "info",
            },
          });
          await qc.invalidateQueries({ queryKey: ["notifications-unread"] });
          setRemedyLoading(false);
          setLoading(false);
          return; // stay on page to show remedy
        } catch {
          setRemedyLoading(false);
        }
      }

      await qc.invalidateQueries({ queryKey: ["tracker-logs"] });
      await qc.invalidateQueries({ queryKey: ["notifications-unread"] });
      navigate({ to: type === "appointment" ? "/appointments" : "/tracker" });
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
        <div className="mb-4 space-y-3">
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--ink)]">Title</p>
            <input
              value={apptTitle}
              onChange={(e) => setApptTitle(e.target.value)}
              placeholder="e.g. OB-GYN checkup"
              className="w-full rounded-xl border border-[var(--bloom-border)] bg-white py-3 px-4 text-sm text-[var(--ink)] outline-none focus:border-[var(--rose)]"
            />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-[var(--ink)]">Date & time</p>
            <input
              type="datetime-local"
              value={apptDate}
              min={new Date().toISOString().slice(0, 16)}
              onChange={(e) => setApptDate(e.target.value)}
              className="w-full rounded-xl border border-[var(--bloom-border)] bg-white py-3 px-4 text-sm text-[var(--ink)] outline-none focus:border-[var(--rose)]"
            />
            <p className="mt-1 text-xs text-[var(--bloom-muted)]">
              We'll send you a reminder notification.
            </p>
          </div>
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

      {(remedy || remedyLoading) && (
        <div className="mb-4 rounded-2xl border border-[var(--rose-mid)] bg-[var(--rose-light)] p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--rose-dark)]" />
            <p className="text-sm font-medium text-[var(--rose-dark)]">Gentle remedy</p>
          </div>
          {remedyLoading ? (
            <p className="text-sm italic text-[var(--bloom-muted)]">Thinking of something soothing...</p>
          ) : (
            <div className="prose prose-sm max-w-none text-[var(--ink)] prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{remedy || ""}</ReactMarkdown>
            </div>
          )}
          <button
            onClick={() => navigate({ to: "/tracker" })}
            className="mt-3 text-xs font-medium text-[var(--rose-dark)] underline"
          >
            Done
          </button>
        </div>
      )}

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
