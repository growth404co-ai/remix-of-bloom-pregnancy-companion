import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  getMyPartnerCode,
  listPartnerLinks,
  joinAsPartner,
  unlinkPartner,
} from "@/lib/partner.functions";
import { Users, Copy, Link2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const linksQuery = () =>
  queryOptions({ queryKey: ["partner-links"], queryFn: () => listPartnerLinks() });

export const Route = createFileRoute("/_authenticated/partner")({
  head: () => ({ meta: [{ title: "Partner Mode — Bloom" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(linksQuery()),
  component: PartnerPage,
});

function PartnerPage() {
  const { data } = useSuspenseQuery(linksQuery());
  const qc = useQueryClient();
  const getCode = useServerFn(getMyPartnerCode);
  const join = useServerFn(joinAsPartner);
  const unlink = useServerFn(unlinkPartner);
  const [code, setCode] = useState<string | null>(null);
  const [joinCode, setJoinCode] = useState("");

  const invalidate = () => qc.invalidateQueries({ queryKey: ["partner-links"] });

  const revealCode = async () => {
    const res = await getCode();
    setCode(res.code);
  };

  const doJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await join({ data: { code: joinCode.trim() } });
      toast.success("Linked! You can now view their journey.");
      setJoinCode("");
      invalidate();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="px-5 py-3">
        <h1 className="font-serif text-2xl text-[var(--ink)]">Partner Mode</h1>
        <p className="mt-1 text-sm text-[var(--bloom-muted)]">
          Share your pregnancy journey with a partner or loved one.
        </p>
      </div>

      <div className="mx-4 rounded-2xl border border-[var(--bloom-border)] bg-white p-4">
        <p className="text-sm font-medium text-[var(--ink)]">Invite your partner</p>
        <p className="mt-1 text-xs text-[var(--bloom-muted)]">
          Share this code. They'll enter it below to view your journey.
        </p>
        {code ? (
          <div className="mt-3 flex items-center gap-2">
            <code className="flex-1 rounded-lg bg-[var(--rose-light)] px-4 py-3 text-center font-mono text-xl tracking-widest text-[var(--rose-dark)]">
              {code}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(code);
                toast.success("Copied");
              }}
              className="rounded-lg border border-[var(--bloom-border)] p-3"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={revealCode}
            className="mt-3 w-full rounded-lg bg-[var(--rose)] py-2 text-sm font-medium text-white"
          >
            Reveal invite code
          </button>
        )}
      </div>

      <form
        onSubmit={doJoin}
        className="mx-4 rounded-2xl border border-[var(--bloom-border)] bg-white p-4"
      >
        <p className="text-sm font-medium text-[var(--ink)]">Have an invite code?</p>
        <p className="mt-1 text-xs text-[var(--bloom-muted)]">
          Join as a partner to view their journey.
        </p>
        <div className="mt-3 flex gap-2">
          <input
            placeholder="ENTER CODE"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            className="flex-1 rounded-lg border border-[var(--bloom-border)] bg-white px-3 py-2 text-center font-mono text-lg tracking-widest"
          />
          <button
            type="submit"
            className="flex items-center gap-1 rounded-lg bg-[var(--rose)] px-4 py-2 text-sm font-medium text-white"
          >
            <Link2 className="h-4 w-4" /> Link
          </button>
        </div>
      </form>

      <div className="mx-4">
        <p className="mb-2 text-sm font-medium text-[var(--ink)]">Linked partners</p>
        {data.viewers.length === 0 && data.watching.length === 0 && (
          <p className="rounded-xl border border-dashed border-[var(--bloom-border)] p-6 text-center text-sm text-[var(--bloom-muted)]">
            No linked partners yet.
          </p>
        )}
        {data.viewers.map((v) => (
          <div
            key={v.id}
            className="mb-2 flex items-center gap-3 rounded-xl border border-[var(--bloom-border)] bg-white p-3"
          >
            <Users className="h-5 w-5 text-[var(--rose)]" />
            <div className="flex-1">
              <p className="text-sm text-[var(--ink)]">Partner viewing your journey</p>
              <p className="text-xs text-[var(--bloom-muted)]">
                Joined {new Date(v.created_at).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={async () => {
                await unlink({ data: { id: v.id } });
                invalidate();
              }}
              className="text-[var(--bloom-muted)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
        {data.watching.map((w) => (
          <div
            key={w.id}
            className="mb-2 flex items-center gap-3 rounded-xl border border-[var(--bloom-border)] bg-white p-3"
          >
            <Users className="h-5 w-5 text-[var(--teal)]" />
            <div className="flex-1">
              <p className="text-sm text-[var(--ink)]">You're viewing a journey</p>
              <p className="text-xs text-[var(--bloom-muted)]">
                Since {new Date(w.created_at).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={async () => {
                await unlink({ data: { id: w.id } });
                invalidate();
              }}
              className="text-[var(--bloom-muted)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="h-6" />
    </div>
  );
}
