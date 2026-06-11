import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { getProfile } from "@/lib/profiles.functions";
import { queryOptions } from "@tanstack/react-query";
import { BottomNav } from "@/components/BottomNav";

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
  return (
    <div className="mx-auto flex min-h-screen max-w-[390px] flex-col bg-[var(--cream)]">
      <div className="flex-1 overflow-y-auto pb-24">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
