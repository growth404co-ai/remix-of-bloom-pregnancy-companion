import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getProfile } from "@/lib/profiles.functions";
import { getOrders } from "@/lib/shop.functions";
import { getSavedIds } from "@/lib/saved.functions";
import { getUnreadCount } from "@/lib/notifications.functions";
import { supabase } from "@/integrations/supabase/client";
import { differenceInWeeks } from "date-fns";
import {
  Calendar,
  Heart,
  Package,
  Users,
  Bell,
  Shield,
  Sparkles,
  ChevronRight,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme, type TrimesterTheme } from "@/hooks/use-theme";


const profileQuery = () =>
  queryOptions({ queryKey: ["profile"], queryFn: () => getProfile() });
const ordersQuery = () =>
  queryOptions({ queryKey: ["orders"], queryFn: () => getOrders() });
const savedIdsQuery = () =>
  queryOptions({ queryKey: ["saved-ids"], queryFn: () => getSavedIds() });
const unreadQuery = () =>
  queryOptions({ queryKey: ["notifications-unread"], queryFn: () => getUnreadCount() });

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Bloom" },
      { name: "description", content: "Your Bloom profile" },
    ],
  }),
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(profileQuery()),
      context.queryClient.ensureQueryData(ordersQuery()),
      context.queryClient.ensureQueryData(savedIdsQuery()),
      context.queryClient.ensureQueryData(unreadQuery()),
    ]);
  },
  component: ProfilePage,
});

type MenuItem = {
  icon: typeof Calendar;
  label: string;
  badge: number;
  to?: "/orders" | "/saved" | "/notifications" | "/ask";
};

function ProfilePage() {
  const { data: profileData } = useSuspenseQuery(profileQuery());
  const { data: ordersData } = useSuspenseQuery(ordersQuery());
  const { data: savedData } = useSuspenseQuery(savedIdsQuery());
  const { data: unreadData } = useSuspenseQuery(unreadQuery());
  const profile = profileData?.profile;
  const navigate = useNavigate();

  const menuItems: MenuItem[] = [
    { icon: Calendar, label: "Appointments", badge: 0 },
    { icon: Heart, label: "Saved products", badge: savedData?.ids.length ?? 0, to: "/saved" },
    { icon: Package, label: "My orders", badge: ordersData?.orders.length ?? 0, to: "/orders" },
    { icon: Users, label: "Community", badge: 0 },
    { icon: Bell, label: "Notifications", badge: unreadData?.count ?? 0, to: "/notifications" },
    { icon: Shield, label: "Privacy & security", badge: 0 },
    { icon: Sparkles, label: "Ask AI anything", badge: 0, to: "/ask" },
  ];

  const dueDate = profile?.due_date ? new Date(profile.due_date) : null;
  const now = new Date();
  const weeksPregnant = dueDate
    ? Math.max(1, Math.min(40, 40 - differenceInWeeks(dueDate, now)))
    : 20;
  const trimester = weeksPregnant <= 12 ? "1st" : weeksPregnant <= 27 ? "2nd" : "3rd";

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  return (
    <div className="flex flex-col">
      <div className="px-5 py-3">
        <h1 className="font-serif text-2xl text-[var(--ink)]">Profile</h1>
      </div>

      {/* Profile hero */}
      <div className="mx-4 rounded-2xl bg-[var(--rose-light)] p-5">
        <div className="flex items-center gap-3.5">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--rose)] font-serif text-xl text-white">
            {(profile?.display_name || "U")[0]}
          </div>
          <div>
            <p className="text-[17px] font-medium text-[var(--ink)]">
              {profile?.display_name || "User"}
            </p>
            <p className="text-sm text-[var(--rose)]">
              Due {dueDate ? dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Nov 12"} · Week {Math.round(weeksPregnant)} · {trimester} trimester
            </p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="mt-4 px-4">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              if (item.to) navigate({ to: item.to });
            }}
            className="mb-2 flex w-full items-center gap-3 rounded-xl border border-[var(--bloom-border)] bg-white px-4 py-3.5 text-left"
          >
            <item.icon className="h-5 w-5 text-[var(--rose)]" />
            <span className="flex-1 text-sm text-[var(--ink)]">{item.label}</span>
            {item.badge > 0 && (
              <span className="rounded-full bg-[var(--rose)] px-2 py-0.5 text-[10px] font-bold text-white">
                {item.badge}
              </span>
            )}
            <ChevronRight className="h-4 w-4 text-[var(--bloom-muted)]" />
          </button>
        ))}
      </div>

      <div className="mt-4 px-4">
        <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wider text-[var(--bloom-muted)]">
          Appearance
        </p>
        <ThemeCard currentTrimester={trimester} />
      </div>

      <div className="mt-2 px-4">
        <button
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl border border-[var(--bloom-border)] bg-white px-4 py-3.5 text-left"
        >
          <LogOut className="h-5 w-5 text-[var(--bloom-muted)]" />
          <span className="text-sm text-[var(--ink)]">Sign out</span>
        </button>
      </div>

      <div className="h-6" />
    </div>
  );
}

function ThemeCard({ currentTrimester }: { currentTrimester: "1st" | "2nd" | "3rd" }) {
  const mode = useTheme((s) => s.mode);
  const toggleMode = useTheme((s) => s.toggleMode);
  const trimesterTheme = useTheme((s) => s.trimesterTheme);
  const setTrimesterTheme = useTheme((s) => s.setTrimesterTheme);

  const options: { value: TrimesterTheme; label: string; hint: string }[] = [
    { value: "auto", label: "Auto", hint: `Now: ${currentTrimester}` },
    { value: "1", label: "Blush", hint: "1st · fresh" },
    { value: "2", label: "Sage", hint: "2nd · calm" },
    { value: "3", label: "Lavender", hint: "3rd · cozy" },
  ];

  return (
    <div className="rounded-xl border border-[var(--bloom-border)] bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {mode === "dark" ? (
            <Moon className="h-5 w-5 text-[var(--rose)]" />
          ) : (
            <Sun className="h-5 w-5 text-[var(--rose)]" />
          )}
          <div>
            <p className="text-sm font-medium text-[var(--ink)]">Dark mode</p>
            <p className="text-xs text-[var(--bloom-muted)]">
              Easier on the eyes at night
            </p>
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
                className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                  active
                    ? "border-[var(--rose)] bg-[var(--rose-light)]"
                    : "border-[var(--bloom-border)] bg-white"
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    active ? "text-[var(--rose-dark)]" : "text-[var(--ink)]"
                  }`}
                >
                  {opt.label}
                </p>
                <p className="text-[11px] text-[var(--bloom-muted)]">{opt.hint}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

