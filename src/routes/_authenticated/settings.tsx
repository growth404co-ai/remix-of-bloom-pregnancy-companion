import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { getProfile, updateProfile } from "@/lib/profiles.functions";
import { supabase } from "@/integrations/supabase/client";
import { differenceInWeeks } from "date-fns";
import { ArrowLeft, Moon, Sun, User, Mail, Lock, Calendar, Check, Palette } from "lucide-react";
import { useTheme, type TrimesterTheme } from "@/hooks/use-theme";
import { toast } from "sonner";

const profileQuery = () =>
  queryOptions({ queryKey: ["profile"], queryFn: () => getProfile() });

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Bloom" },
      { name: "description", content: "Manage your Bloom account and appearance" },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(profileQuery());
  },
  errorComponent: () => (
    <div className="p-6 text-sm text-[var(--bloom-muted)]">Couldn't load settings.</div>
  ),
  notFoundComponent: () => <div className="p-6">Not found</div>,
  component: SettingsPage,
});

function SettingsPage() {
  const { data } = useSuspenseQuery(profileQuery());
  const profile = data?.profile;
  const navigate = useNavigate();
  const qc = useQueryClient();
  const updateProfileFn = useServerFn(updateProfile);

  const [displayName, setDisplayName] = useState(profile?.display_name ?? "");
  const [dueDate, setDueDate] = useState(profile?.due_date ?? "");
  const [savingProfile, setSavingProfile] = useState(false);

  const [email, setEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const dueDateObj = profile?.due_date ? new Date(profile.due_date) : null;
  const weeksPregnant = dueDateObj
    ? Math.max(1, Math.min(40, 40 - differenceInWeeks(dueDateObj, new Date())))
    : 20;
  const trimester: "1st" | "2nd" | "3rd" =
    weeksPregnant <= 12 ? "1st" : weeksPregnant <= 27 ? "2nd" : "3rd";

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await updateProfileFn({
        data: {
          display_name: displayName.trim() || undefined,
          due_date: dueDate || undefined,
        },
      });
      await qc.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
    } catch (err) {
      console.error("Profile update failed:", err);
      toast.error("Couldn't update profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const saveEmail = async () => {
    if (!email.trim()) return;
    setSavingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({ email: email.trim() });
      if (error) throw error;
      toast.success("Check your inbox to confirm the new email");
      setEmail("");
    } catch (err) {
      console.error("Email update failed:", err);
      toast.error("Couldn't update email");
    } finally {
      setSavingEmail(false);
    }
  };

  const savePassword = async () => {
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    setSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Password update failed:", err);
      toast.error("Couldn't update password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="flex flex-col pb-8">
      <div className="flex items-center gap-2 px-3 py-3">
        <button
          onClick={() => navigate({ to: "/profile" })}
          aria-label="Back"
          className="rounded-full p-2 hover:bg-[var(--rose-light)]"
        >
          <ArrowLeft className="h-5 w-5 text-[var(--ink)]" />
        </button>
        <h1 className="font-serif text-2xl text-[var(--ink)]">Settings</h1>
      </div>

      {/* Account credentials */}
      <Section title="Account" icon={<User className="h-4 w-4" />}>
        <Field label="Display name">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your name"
            className="input"
          />
        </Field>
        <Field label="Due date">
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="input"
          />
        </Field>
        <PrimaryButton onClick={saveProfile} loading={savingProfile}>
          Save profile
        </PrimaryButton>
      </Section>

      <Section title="Email" icon={<Mail className="h-4 w-4" />}>
        <Field label="New email address">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input"
          />
        </Field>
        <PrimaryButton onClick={saveEmail} loading={savingEmail} disabled={!email.trim()}>
          Update email
        </PrimaryButton>
      </Section>

      <Section title="Password" icon={<Lock className="h-4 w-4" />}>
        <Field label="New password">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="input"
          />
        </Field>
        <Field label="Confirm password">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat new password"
            className="input"
          />
        </Field>
        <PrimaryButton
          onClick={savePassword}
          loading={savingPassword}
          disabled={!password || !confirmPassword}
        >
          Update password
        </PrimaryButton>
      </Section>

      {/* Theme */}
      <Section title="Appearance" icon={<Palette className="h-4 w-4" />}>
        <ThemeControls currentTrimester={trimester} />
      </Section>

      <style>{`
        .input {
          width: 100%;
          border-radius: 10px;
          border: 1px solid var(--bloom-border);
          background: white;
          padding: 10px 12px;
          font-size: 14px;
          color: var(--ink);
        }
        .input:focus { outline: 2px solid var(--rose); outline-offset: 0; }
      `}</style>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 px-4">
      <div className="mb-2 flex items-center gap-1.5 px-1 text-xs font-medium uppercase tracking-wider text-[var(--bloom-muted)]">
        {icon}
        <span>{title}</span>
      </div>
      <div className="space-y-3 rounded-xl border border-[var(--bloom-border)] bg-white p-4">
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-[var(--ink)]">{label}</span>
      {children}
    </label>
  );
}

function PrimaryButton({
  onClick,
  loading,
  disabled,
  children,
}: {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--rose)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
    >
      {loading ? "Saving…" : (<><Check className="h-4 w-4" />{children}</>)}
    </button>
  );
}

function ThemeControls({ currentTrimester }: { currentTrimester: "1st" | "2nd" | "3rd" }) {
  const mode = useTheme((s) => s.mode);
  const toggleMode = useTheme((s) => s.toggleMode);
  const trimesterTheme = useTheme((s) => s.trimesterTheme);
  const setTrimesterTheme = useTheme((s) => s.setTrimesterTheme);

  const options: { value: TrimesterTheme; label: string; hint: string; swatch: string }[] = [
    { value: "auto", label: "Auto", hint: `Now: ${currentTrimester}`, swatch: "linear-gradient(135deg,#f5b7c8,#b8d4c2,#c9b8e0)" },
    { value: "1", label: "Blush", hint: "1st · fresh", swatch: "#f5b7c8" },
    { value: "2", label: "Sage", hint: "2nd · calm", swatch: "#b8d4c2" },
    { value: "3", label: "Lavender", hint: "3rd · cozy", swatch: "#c9b8e0" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {mode === "dark" ? (
            <Moon className="h-5 w-5 text-[var(--rose)]" />
          ) : (
            <Sun className="h-5 w-5 text-[var(--rose)]" />
          )}
          <div>
            <p className="text-sm font-medium text-[var(--ink)]">Dark mode</p>
            <p className="text-xs text-[var(--bloom-muted)]">Easier on the eyes at night</p>
          </div>
        </div>
        <button
          onClick={toggleMode}
          aria-pressed={mode === "dark"}
          aria-label="Toggle dark mode"
          className={`relative h-6 w-11 rounded-full transition-colors ${
            mode === "dark" ? "bg-[var(--rose)]" : "bg-[var(--bloom-border)]"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              mode === "dark" ? "translate-x-[22px]" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      <div className="mt-4">
        <p className="mb-2 text-xs font-medium text-[var(--ink)]">Trimester mood</p>
        <div className="grid grid-cols-2 gap-2">
          {options.map((opt) => {
            const active = trimesterTheme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setTrimesterTheme(opt.value)}
                className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 text-left transition-colors ${
                  active
                    ? "border-[var(--rose)] bg-[var(--rose-light)]"
                    : "border-[var(--bloom-border)] bg-white"
                }`}
              >
                <span
                  className="h-6 w-6 shrink-0 rounded-full border border-[var(--bloom-border)]"
                  style={{ background: opt.swatch }}
                />
                <span className="min-w-0">
                  <span
                    className={`block truncate text-sm font-medium ${
                      active ? "text-[var(--rose-dark)]" : "text-[var(--ink)]"
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="block truncate text-[11px] text-[var(--bloom-muted)]">
                    {opt.hint}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
