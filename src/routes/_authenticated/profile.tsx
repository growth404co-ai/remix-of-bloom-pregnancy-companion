import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { getProfile } from "@/lib/profiles.functions";
import { getOrders } from "@/lib/shop.functions";
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
} from "lucide-react";

const profileQuery = () =>
  queryOptions({
    queryKey: ["profile"],
    queryFn: () => getProfile(),
  });

const ordersQuery = () =>
  queryOptions({
    queryKey: ["orders"],
    queryFn: () => getOrders(),
  });

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Profile — Bloom" },
      { name: "description", content: "Your Bloom profile" },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(profileQuery());
    await context.queryClient.ensureQueryData(ordersQuery());
  },
  component: ProfilePage,
});

const menuItems = [
  { icon: Calendar, label: "Appointments", badge: 0 },
  { icon: Heart, label: "Saved products", badge: 3 },
  { icon: Package, label: "My orders", badge: 0 },
  { icon: Users, label: "Community", badge: 0 },
  { icon: Bell, label: "Notifications", badge: 0 },
  { icon: Shield, label: "Privacy & security", badge: 0 },
  { icon: Sparkles, label: "Ask AI anything", badge: 0 },
];

function ProfilePage() {
  const { data: profileData } = useSuspenseQuery(profileQuery());
  const profile = profileData?.profile;
  const navigate = useNavigate();

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
              if (item.label === "Ask AI anything") {
                navigate({ to: "/ask" });
              }
              // Others are coming soon — no-op for now
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
