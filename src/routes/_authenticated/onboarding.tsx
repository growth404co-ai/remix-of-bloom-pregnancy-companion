import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { updateProfile } from "@/lib/profiles.functions";
import { Flower2, Calendar, Globe, Clock } from "lucide-react";
import { LANGUAGES, TIMEZONES, detectTimezone, type LanguageCode } from "@/lib/i18n";
import { useLocale } from "@/hooks/use-locale";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: OnboardingPage,
});

function OnboardingPage() {
  const navigate = useNavigate();
  const saveProfile = useServerFn(updateProfile);
  const setLangStore = useLocale((s) => s.setLanguage);
  const setTzStore = useLocale((s) => s.setTimezone);
  const [displayName, setDisplayName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [language, setLanguage] = useState<LanguageCode>("en");
  const [timezone, setTimezone] = useState<string>(detectTimezone());
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveProfile({
        data: { display_name: displayName, due_date: dueDate, language, timezone },
      });
      setLangStore(language);
      setTzStore(timezone);
      navigate({ to: "/" });
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--rose)] text-white">
            <Flower2 className="h-6 w-6" />
          </div>
          <h1 className="font-serif text-2xl font-semibold text-[var(--ink)]">Welcome to Bloom</h1>
          <p className="mt-1 text-sm text-[var(--bloom-muted)]">Let's personalize your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--ink)]">Your name</label>
            <input
              required
              placeholder="e.g. Sarah"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-xl border border-[var(--bloom-border)] bg-white py-3 px-4 text-sm text-[var(--ink)] outline-none focus:border-[var(--rose)] focus:ring-1 focus:ring-[var(--rose)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--ink)]">Due date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bloom-muted)]" />
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-xl border border-[var(--bloom-border)] bg-white py-3 pl-10 pr-4 text-sm text-[var(--ink)] outline-none focus:border-[var(--rose)] focus:ring-1 focus:ring-[var(--rose)]"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--ink)]">Language</label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bloom-muted)]" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as LanguageCode)}
                className="w-full appearance-none rounded-xl border border-[var(--bloom-border)] bg-white py-3 pl-10 pr-4 text-sm text-[var(--ink)] outline-none focus:border-[var(--rose)] focus:ring-1 focus:ring-[var(--rose)]"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-[var(--ink)]">Timezone</label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--bloom-muted)]" />
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full appearance-none rounded-xl border border-[var(--bloom-border)] bg-white py-3 pl-10 pr-4 text-sm text-[var(--ink)] outline-none focus:border-[var(--rose)] focus:ring-1 focus:ring-[var(--rose)]"
              >
                {(TIMEZONES.includes(timezone) ? TIMEZONES : [timezone, ...TIMEZONES]).map((tz) => (
                  <option key={tz} value={tz}>
                    {tz.replace(/_/g, " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--rose)] py-3 text-sm font-medium text-white transition-colors hover:bg-[var(--rose-dark)] disabled:opacity-50"
          >
            {loading ? "Saving..." : "Start your journey"}
          </button>
        </form>
      </div>
    </div>
  );
}
