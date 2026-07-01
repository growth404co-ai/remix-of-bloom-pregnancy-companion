import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getTrackerLogs } from "@/lib/tracker.functions";
import { ArrowLeft, Calendar, Plus, Bell } from "lucide-react";

const logsQuery = () =>
  queryOptions({ queryKey: ["tracker-logs"], queryFn: () => getTrackerLogs() });

export const Route = createFileRoute("/_authenticated/appointments")({
  head: () => ({
    meta: [
      { title: "Appointments — Bloom" },
      { name: "description", content: "Your pregnancy appointments" },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(logsQuery());
  },
  component: AppointmentsPage,
});

type Log = { id: string; log_type: string; note: string | null; value: unknown; logged_at: string };

function AppointmentsPage() {
  const { data } = useSuspenseQuery(logsQuery());
  const navigate = useNavigate();
  const appointments = (data?.logs ?? [])
    .filter((l: Log) => l.log_type === "appointment")
    .map((l: Log) => {
      const v = (l.value as { date?: string; title?: string } | null) ?? {};
      return { ...l, date: v.date, title: v.title };
    })
    .sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));

  const now = new Date();
  const upcoming = appointments.filter((a) => a.date && new Date(a.date) >= now);
  const past = appointments.filter((a) => !a.date || new Date(a.date) < now);

  return (
    <div className="flex flex-col px-4 py-3">
      <div className="mb-3 flex items-center gap-3">
        <button
          onClick={() => navigate({ to: "/profile" })}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--bloom-border)] bg-white"
        >
          <ArrowLeft className="h-4 w-4 text-[var(--ink)]" />
        </button>
        <h1 className="font-serif text-2xl text-[var(--ink)]">Appointments</h1>
      </div>

      <button
        onClick={() => navigate({ to: "/log/$type", params: { type: "appointment" } })}
        className="mb-4 flex items-center justify-center gap-2 rounded-xl bg-[var(--rose)] py-3 text-sm font-medium text-white"
      >
        <Plus className="h-4 w-4" /> Add appointment
      </button>

      <Section title="Upcoming" items={upcoming} emptyText="No upcoming appointments." />
      <Section title="Past" items={past} emptyText="No past appointments yet." />
    </div>
  );
}

function Section({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: { id: string; date?: string; title?: string; note: string | null }[];
  emptyText: string;
}) {
  return (
    <div className="mb-5">
      <p className="mb-2 text-sm font-medium text-[var(--ink)]">{title}</p>
      {items.length === 0 ? (
        <p className="text-xs text-[var(--bloom-muted)]">{emptyText}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((a) => (
            <div
              key={a.id}
              className="flex items-start gap-3 rounded-xl border border-[var(--bloom-border)] bg-white p-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--rose-light)] text-[var(--rose)]">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[var(--ink)]">{a.title || "Appointment"}</p>
                {a.date && (
                  <p className="text-xs text-[var(--bloom-muted)]">
                    {new Date(a.date).toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                )}
                {a.note && <p className="mt-1 text-xs text-[var(--ink)]">{a.note}</p>}
              </div>
              <Bell className="h-4 w-4 text-[var(--rose)]" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
