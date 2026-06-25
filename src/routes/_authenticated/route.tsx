import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getProfile } from "@/lib/profiles.functions";
import { queryOptions } from "@tanstack/react-query";
import { BottomNav } from "@/components/BottomNav";
import { ThemeManager } from "@/components/ThemeManager";
import { differenceInWeeks } from "date-fns";

const profileQuery = () =>
  queryOptions({
    queryKey: ["profile"],
    queryFn: () => getProfile(),
  });

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location, context }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });

    if (location.pathname !== "/onboarding") {
      const profile = await context.queryClient.ensureQueryData(profileQuery());
      if (!profile?.profile?.due_date) {
        throw redirect({ to: "/onboarding" });
      }
    }

    return { user: data.user };
  },
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { data } = useSuspenseQuery(profileQuery());
  const dueDate = data?.profile?.due_date ? new Date(data.profile.due_date) : null;
  const weeksPregnant = dueDate
    ? Math.max(1, Math.min(40, 40 - differenceInWeeks(dueDate, new Date())))
    : 20;

  return (
    <div className="mx-auto flex min-h-screen max-w-[390px] flex-col bg-[var(--cream)]">
      <ThemeManager weeksPregnant={Math.round(weeksPregnant)} />
      <div className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}

