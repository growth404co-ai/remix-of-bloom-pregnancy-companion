import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listJournal,
  createJournalEntry,
  deleteJournalEntry,
} from "@/lib/journal.functions";
import { BookHeart, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

const jQuery = () =>
  queryOptions({ queryKey: ["journal"], queryFn: () => listJournal() });

export const Route = createFileRoute("/_authenticated/journal")({
  head: () => ({ meta: [{ title: "Journal — Bloom" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(jQuery()),
  component: JournalPage,
});

function JournalPage() {
  const { data } = useSuspenseQuery(jQuery());
  const qc = useQueryClient();
  const add = useServerFn(createJournalEntry);
  const remove = useServerFn(deleteJournalEntry);
  const [form, setForm] = useState({ title: "", content: "", mood: "" });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["journal"] });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content.trim() && !form.title.trim()) return;
    await add({ data: form });
    setForm({ title: "", content: "", mood: "" });
    invalidate();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="px-5 py-3">
        <h1 className="font-serif text-2xl text-[var(--ink)]">Pregnancy Journal</h1>
        <p className="mt-1 text-sm text-[var(--bloom-muted)]">
          Capture thoughts, milestones, and moments.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="mx-4 space-y-2 rounded-2xl border border-[var(--bloom-border)] bg-white p-4"
      >
        <input
          placeholder="Title (optional)"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full rounded-lg border border-[var(--bloom-border)] bg-white px-3 py-2 text-sm"
        />
        <textarea
          placeholder="How are you feeling today?"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          rows={4}
          className="w-full rounded-lg border border-[var(--bloom-border)] bg-white px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <input
            placeholder="Mood (e.g. hopeful 🌸)"
            value={form.mood}
            onChange={(e) => setForm({ ...form, mood: e.target.value })}
            className="flex-1 rounded-lg border border-[var(--bloom-border)] bg-white px-3 py-2 text-sm"
          />
          <button className="flex items-center gap-1 rounded-lg bg-[var(--rose)] px-4 py-2 text-sm font-medium text-white">
            <Plus className="h-4 w-4" /> Save
          </button>
        </div>
      </form>

      <div className="mx-4 flex flex-col gap-2">
        {data.entries.length === 0 && (
          <p className="rounded-xl border border-dashed border-[var(--bloom-border)] p-6 text-center text-sm text-[var(--bloom-muted)]">
            Your journal is empty.
          </p>
        )}
        {data.entries.map((e) => (
          <div
            key={e.id}
            className="rounded-xl border border-[var(--bloom-border)] bg-white p-4"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--rose-light)] text-[var(--rose)]">
                <BookHeart className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                {e.title && (
                  <p className="font-serif text-lg text-[var(--ink)]">{e.title}</p>
                )}
                <p className="text-xs text-[var(--bloom-muted)]">
                  {format(new Date(e.created_at), "MMM d, yyyy · HH:mm")}
                  {e.mood && ` · ${e.mood}`}
                </p>
                {e.content && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--ink)]">
                    {e.content}
                  </p>
                )}
              </div>
              <button
                onClick={async () => {
                  await remove({ data: { id: e.id } });
                  invalidate();
                }}
                className="text-[var(--bloom-muted)] hover:text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="h-6" />
    </div>
  );
}
