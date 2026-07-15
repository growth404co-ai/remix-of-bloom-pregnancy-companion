import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listContractions,
  recordContraction,
  clearContractions,
} from "@/lib/contractions.functions";
import { Play, Square, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { differenceInSeconds, format } from "date-fns";

const query = () =>
  queryOptions({ queryKey: ["contractions"], queryFn: () => listContractions() });

export const Route = createFileRoute("/_authenticated/contractions")({
  head: () => ({ meta: [{ title: "Contraction Timer — Bloom" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(query()),
  component: ContractionsPage,
});

function ContractionsPage() {
  const { data } = useSuspenseQuery(query());
  const qc = useQueryClient();
  const record = useServerFn(recordContraction);
  const clear = useServerFn(clearContractions);
  const [runningSince, setRunningSince] = useState<Date | null>(null);
  const [tick, setTick] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (runningSince) {
      intervalRef.current = setInterval(() => setTick((t) => t + 1), 1000);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [runningSince]);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["contractions"] });

  const start = () => setRunningSince(new Date());
  const stop = async () => {
    if (!runningSince) return;
    const started = runningSince;
    const ended = new Date();
    setRunningSince(null);
    setTick(0);
    await record({
      data: { started_at: started.toISOString(), ended_at: ended.toISOString() },
    });
    invalidate();
  };

  const elapsed = runningSince ? differenceInSeconds(new Date(), runningSince) + tick * 0 : 0;
  const mm = Math.floor(elapsed / 60);
  const ss = elapsed % 60;

  // Frequency: minutes between the last two contractions
  const contractions = data.contractions;
  const frequency =
    contractions.length >= 2
      ? Math.round(
          (new Date(contractions[0].started_at).getTime() -
            new Date(contractions[1].started_at).getTime()) /
            60000,
        )
      : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="px-5 py-3">
        <h1 className="font-serif text-2xl text-[var(--ink)]">Contraction Timer</h1>
        <p className="mt-1 text-sm text-[var(--bloom-muted)]">
          Time your contractions. Call your provider if they're 5 minutes apart, last 60s, for 1 hour.
        </p>
      </div>

      <div className="mx-4 rounded-2xl bg-[var(--rose-light)] p-6 text-center">
        <p className="text-xs uppercase tracking-widest text-[var(--rose)]">Elapsed</p>
        <p className="font-serif text-6xl text-[var(--rose-dark)]">
          {String(mm).padStart(2, "0")}:{String(ss).padStart(2, "0")}
        </p>
        <button
          onClick={runningSince ? stop : start}
          className={`mt-4 inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-medium text-white ${
            runningSince ? "bg-red-500" : "bg-[var(--rose)]"
          }`}
        >
          {runningSince ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {runningSince ? "Stop" : "Start"}
        </button>
        {frequency !== null && (
          <p className="mt-3 text-xs text-[var(--rose-dark)]">
            ~ every {frequency} min between last two
          </p>
        )}
      </div>

      <div className="mx-4">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-medium text-[var(--ink)]">History</p>
          {contractions.length > 0 && (
            <button
              onClick={async () => {
                if (confirm("Clear all recorded contractions?")) {
                  await clear();
                  invalidate();
                }
              }}
              className="flex items-center gap-1 text-xs text-[var(--bloom-muted)]"
            >
              <Trash2 className="h-3 w-3" /> Clear all
            </button>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {contractions.length === 0 && (
            <p className="rounded-xl border border-dashed border-[var(--bloom-border)] p-6 text-center text-sm text-[var(--bloom-muted)]">
              No contractions logged yet.
            </p>
          )}
          {contractions.map((c) => {
            const dur =
              c.ended_at != null
                ? differenceInSeconds(new Date(c.ended_at), new Date(c.started_at))
                : null;
            return (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-xl border border-[var(--bloom-border)] bg-white p-3 text-sm"
              >
                <span className="text-[var(--ink)]">
                  {format(new Date(c.started_at), "MMM d, HH:mm:ss")}
                </span>
                <span className="text-[var(--bloom-muted)]">
                  {dur != null ? `${dur}s` : "—"}
                </span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="h-6" />
    </div>
  );
}
