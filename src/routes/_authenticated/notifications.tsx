import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getNotifications, markAllRead } from "@/lib/notifications.functions";
import { ArrowLeft, Bell, CheckCheck } from "lucide-react";
import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";

const notificationsQuery = () =>
  queryOptions({ queryKey: ["notifications"], queryFn: () => getNotifications() });

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Bloom" },
      { name: "description", content: "Your notifications" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(notificationsQuery()),
  component: NotificationsPage,
});

function NotificationsPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data } = useSuspenseQuery(notificationsQuery());
  const items = data?.notifications ?? [];
  const markAll = useServerFn(markAllRead);

  useEffect(() => {
    if (items.some((n) => !n.read)) {
      markAll().then(() => {
        qc.invalidateQueries({ queryKey: ["notifications-unread"] });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkAll = async () => {
    await markAll();
    qc.invalidateQueries({ queryKey: ["notifications"] });
    qc.invalidateQueries({ queryKey: ["notifications-unread"] });
  };

  return (
    <div className="flex min-h-screen flex-col px-5 py-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: "/profile" })}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--bloom-border)] bg-white"
          >
            <ArrowLeft className="h-4 w-4 text-[var(--ink)]" />
          </button>
          <h1 className="font-serif text-xl text-[var(--ink)]">Notifications</h1>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleMarkAll}
            className="flex items-center gap-1 text-xs text-[var(--rose)]"
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <Bell className="mb-3 h-12 w-12 text-[var(--bloom-muted)]" />
          <p className="text-sm text-[var(--bloom-muted)]">You're all caught up.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <div
              key={n.id}
              className={`flex gap-3 rounded-2xl border border-[var(--bloom-border)] p-4 ${
                n.read ? "bg-white" : "bg-[var(--rose-light)]"
              }`}
            >
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--rose)] text-white">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--ink)]">{n.title}</p>
                {n.body && (
                  <p className="mt-0.5 text-xs text-[var(--bloom-muted)]">{n.body}</p>
                )}
                <p className="mt-1 text-[10px] text-[var(--bloom-muted)]">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      <div className="h-6" />
    </div>
  );
}
