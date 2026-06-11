import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { getProfile } from "@/lib/profiles.functions";
import { getTrackerLogs } from "@/lib/tracker.functions";
import { differenceInWeeks } from "date-fns";
import { Smile, Activity, Weight, Camera, Footprints, Stethoscope, ChevronRight } from "lucide-react";

const profileQuery = () =>
  queryOptions({
    queryKey: ["profile"],
    queryFn: () => getProfile(),
  });

const logsQuery = () =>
  queryOptions({
    queryKey: ["tracker-logs"],
    queryFn: () => getTrackerLogs(),
  });

export const Route = createFileRoute("/_authenticated/tracker")({
  head: () => ({
    meta: [
      { title: "Tracker — Bloom" },
      { name: "description", content: "Track your pregnancy journey" },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(profileQuery());
    await context.queryClient.ensureQueryData(logsQuery());
  },
  component: TrackerPage,
});

const logTypes = [
  { type: "mood", label: "Mood", icon: Smile, color: "bg-yellow-50 text-yellow-600" },
  { type: "symptom", label: "Symptoms", icon: Activity, color: "bg-red-50 text-red-500" },
  { type: "weight", label: "Weight", icon: Weight, color: "bg-blue-50 text-blue-500" },
  { type: "photo", label: "Bump photo", icon: Camera, color: "bg-pink-50 text-pink-500" },
  { type: "kick", label: "Kick count", icon: Footprints, color: "bg-green-50 text-green-500" },
  { type: "appointment", label: "Appointment", icon: Stethoscope, color: "bg-purple-50 text-purple-500" },
];

function TrackerPage() {
  const { data: profileData } = useSuspenseQuery(profileQuery());
  const profile = profileData?.profile;
  const { data: logsData } = useSuspenseQuery(logsQuery());
  const logs = logsData?.logs ?? [];

  const dueDate = profile?.due_date ? new Date(profile.due_date) : null;
  const now = new Date();
  const currentWeek = dueDate
    ? Math.max(1, Math.min(40, 40 - differenceInWeeks(dueDate, now)))
    : 20;

  return (
    <div className="flex flex-col">
      <div className="px-5 py-3">
        <h1 className="font-serif text-2xl text-[var(--ink)]">My journey</h1>
      </div>

      {/* Week grid */}
      <div className="px-4">
        <p className="mb-2 text-sm font-medium text-[var(--ink)]">Weeks</p>
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: 40 }, (_, i) => {
            const week = i + 1;
            const isDone = week < currentWeek;
            const isCurrent = week === Math.round(currentWeek);
            return (
              <div
                key={week}
                className={`flex aspect-square items-center justify-center rounded-full text-[9px] font-medium ${
                  isCurrent
                    ? "bg-[var(--rose)] text-white font-bold"
                    : isDone
                      ? "bg-[var(--rose-mid)] text-white"
                      : "border border-[var(--bloom-border)] bg-white text-[var(--bloom-muted)]"
                }`}
              >
                {week}
              </div>
            );
          })}
        </div>
      </div>

      {/* Log cards */}
      <div className="mt-5 px-4">
        <p className="mb-2 text-sm font-medium text-[var(--ink)]">Log today</p>
        <div className="grid grid-cols-2 gap-2.5">
          {logTypes.map((lt) => (
            <Link
              key={lt.type}
              to="/log/$type"
              params={{ type: lt.type }}
              className="flex flex-col items-center gap-1.5 rounded-2xl border border-[var(--bloom-border)] bg-white p-4 transition-transform active:scale-95"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${lt.color}`}>
                <lt.icon className="h-5 w-5" />
              </div>
              <span className="text-[13px] font-medium text-[var(--ink)]">{lt.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity */}
      {logs.length > 0 && (
        <div className="mt-5 px-4">
          <p className="mb-2 text-sm font-medium text-[var(--ink)]">Recent activity</p>
          <div className="flex flex-col gap-2">
            {logs.slice(0, 5).map((log: { id: string; log_type: string; note: string | null; logged_at: string; value: unknown }) => (
              <div
                key={log.id}
                className="flex items-center gap-3 rounded-xl border border-[var(--bloom-border)] bg-white p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--rose-light)] text-[var(--rose)]">
                  {log.log_type === "mood" && <Smile className="h-4 w-4" />}
                  {log.log_type === "symptom" && <Activity className="h-4 w-4" />}
                  {log.log_type === "weight" && <Weight className="h-4 w-4" />}
                  {log.log_type === "photo" && <Camera className="h-4 w-4" />}
                  {log.log_type === "kick" && <Footprints className="h-4 w-4" />}
                  {log.log_type === "appointment" && <Stethoscope className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium capitalize text-[var(--ink)]">{log.log_type}</p>
                  <p className="text-xs text-[var(--bloom-muted)]">{log.note || "No note"}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-[var(--bloom-muted)]" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="h-6" />
    </div>
  );
}
