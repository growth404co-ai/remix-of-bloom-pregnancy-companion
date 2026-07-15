import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { updateProfile } from "@/lib/profiles.functions";
import { Flower2, Calendar, Globe, Clock, Heart } from "lucide-react";
import { LANGUAGES, TIMEZONES, detectTimezone, type LanguageCode } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: OnboardingPage,
});

const CONDITIONS = ["Gestational diabetes", "Hypertension", "Anemia", "Thyroid", "Asthma", "Depression/Anxiety"];
const DIETS = ["Vegetarian", "Vegan", "Halal", "Kosher", "Gluten-free", "Lactose-free"];

function OnboardingPage() {
  const navigate = useNavigate();
  const saveProfile = useServerFn(updateProfile);
  const setLangStore = useLocale((s) => s.setLanguage);
  const setTzStore = useLocale((s) => s.setTimezone);
  const [step, setStep] = useState(1);
  const [displayName, setDisplayName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [timezone, setTimezone] = useState<string>(detectTimezone());
  const [partnerName, setPartnerName] = useState("");
  const [conditions, setConditions] = useState<string[]>([]);
  const [diets, setDiets] = useState<string[]>([]);
  const [history, setHistory] = useState("");
  const [prev, setPrev] = useState(0);
  const [loading, setLoading] = useState(false);

  const toggle = (list: string[], setList: (v: string[]) => void, v: string) =>
    setList(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const submit = async () => {
    setLoading(true);
    try {
      await saveProfile({
        data: {
          display_name: displayName,
          due_date: dueDate,
          language,
          timezone,
          partner_name: partnerName || null,
          health_conditions: conditions,
          dietary_preferences: diets,
          pregnancy_history: history || null,
          previous_pregnancies: prev,
        },
      });
      setLangStore(language);
      setTzStore(timezone);
      navigate({ to: "/" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-8">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--rose)] text-white">
          <Flower2 className="h-6 w-6" />
        </div>
        <h1 className="font-serif text-2xl text-[var(--ink)]">Welcome to Bloom</h1>
        <p className="mt-1 text-sm text-[var(--bloom-muted)]">Step {step} of 3</p>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <Field label="Your name">
            <input
              required
              placeholder="e.g. Sarah"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="input"
            />
          </Field>
          <Field label="Partner's name (optional)">
            <div className="relative">
              <Heart className="input-icon" />
              <input
                placeholder="e.g. Alex"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                className="input pl-10"
              />
            </div>
          </Field>
          <Field label="Due date">
            <div className="relative">
              <Calendar className="input-icon" />
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="input pl-10"
              />
            </div>
          </Field>
          <Field label="Language">
            <div className="relative">
              <Globe className="input-icon" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="input pl-10"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </Field>
          <Field label="Timezone">
            <div className="relative">
              <Clock className="input-icon" />
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="input pl-10"
              >
                {(TIMEZONES.includes(timezone) ? TIMEZONES : [timezone, ...TIMEZONES]).map(
                  (tz) => (
                    <option key={tz} value={tz}>
                      {tz.replace(/_/g, " ")}
                    </option>
                  ),
                )}
              </select>
            </div>
          </Field>
          <button
            disabled={!displayName || !dueDate}
            onClick={() => setStep(2)}
            className="btn-primary"
          >
            Continue
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <Field label="Health conditions (select all that apply)">
            <ChipGrid opts={CONDITIONS} sel={conditions} onToggle={(v) => toggle(conditions, setConditions, v)} />
          </Field>
          <Field label="Dietary preferences">
            <ChipGrid opts={DIETS} sel={diets} onToggle={(v) => toggle(diets, setDiets, v)} />
          </Field>
          <div className="flex gap-2">
            <button onClick={() => setStep(1)} className="btn-ghost flex-1">Back</button>
            <button onClick={() => setStep(3)} className="btn-primary flex-1">Continue</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <Field label="Previous pregnancies">
            <input
              type="number"
              min={0}
              max={20}
              value={prev}
              onChange={(e) => setPrev(Number(e.target.value))}
              className="input"
            />
          </Field>
          <Field label="Pregnancy history notes (optional)">
            <textarea
              placeholder="Anything your care team should know"
              value={history}
              onChange={(e) => setHistory(e.target.value)}
              rows={4}
              className="input"
            />
          </Field>
          <div className="flex gap-2">
            <button onClick={() => setStep(2)} className="btn-ghost flex-1">Back</button>
            <button disabled={loading} onClick={submit} className="btn-primary flex-1">
              {loading ? "Saving…" : "Start my journey"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        .input { width: 100%; border-radius: 0.75rem; border: 1px solid var(--bloom-border); background: white; padding: 0.75rem 1rem; font-size: 0.875rem; color: var(--ink); outline: none; }
        .input:focus { border-color: var(--rose); box-shadow: 0 0 0 1px var(--rose); }
        .input-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); height: 1rem; width: 1rem; color: var(--bloom-muted); pointer-events: none; }
        .btn-primary { width: 100%; border-radius: 0.75rem; background: var(--rose); padding: 0.75rem; font-size: 0.875rem; font-weight: 500; color: white; }
        .btn-primary:disabled { opacity: 0.5; }
        .btn-ghost { border-radius: 0.75rem; border: 1px solid var(--bloom-border); background: white; padding: 0.75rem; font-size: 0.875rem; color: var(--ink); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-[var(--ink)]">{label}</label>
      {children}
    </div>
  );
}

function ChipGrid({
  opts,
  sel,
  onToggle,
}: {
  opts: string[];
  sel: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {opts.map((o) => {
        const on = sel.includes(o);
        return (
          <button
            type="button"
            key={o}
            onClick={() => onToggle(o)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium ${
              on
                ? "border-[var(--rose)] bg-[var(--rose)] text-white"
                : "border-[var(--bloom-border)] bg-white text-[var(--ink)]"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
