import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listMedications,
  createMedication,
  toggleMedication,
  deleteMedication,
} from "@/lib/medications.functions";
import { Pill, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

const medsQuery = () =>
  queryOptions({ queryKey: ["medications"], queryFn: () => listMedications() });

export const Route = createFileRoute("/_authenticated/medications")({
  head: () => ({ meta: [{ title: "Medications — Bloom" }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(medsQuery()),
  component: MedicationsPage,
});

function MedicationsPage() {
  const { data } = useSuspenseQuery(medsQuery());
  const qc = useQueryClient();
  const add = useServerFn(createMedication);
  const toggle = useServerFn(toggleMedication);
  const remove = useServerFn(deleteMedication);
  const [form, setForm] = useState({ name: "", dosage: "", schedule: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const meds = data.medications;

  const invalidate = () => qc.invalidateQueries({ queryKey: ["medications"] });

  return (
    <div className="flex flex-col gap-4">
      <div className="px-5 py-3">
        <h1 className="font-serif text-2xl text-[var(--ink)]">Medications & Reminders</h1>
        <p className="mt-1 text-sm text-[var(--bloom-muted)]">
          Track prescriptions, vitamins and supplements safely.
        </p>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!form.name.trim()) return;
          setSaving(true);
          try {
            await add({ data: form });
            setForm({ name: "", dosage: "", schedule: "", notes: "" });
            invalidate();
          } finally {
            setSaving(false);
          }
        }}
        className="mx-4 space-y-2 rounded-2xl border border-[var(--bloom-border)] bg-white p-4"
      >
        <input
          required
          placeholder="Name (e.g. Prenatal vitamin)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-[var(--bloom-border)] bg-white px-3 py-2 text-sm"
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            placeholder="Dosage (5mg)"
            value={form.dosage}
            onChange={(e) => setForm({ ...form, dosage: e.target.value })}
            className="rounded-lg border border-[var(--bloom-border)] bg-white px-3 py-2 text-sm"
          />
          <input
            placeholder="Schedule (Daily 8am)"
            value={form.schedule}
            onChange={(e) => setForm({ ...form, schedule: e.target.value })}
            className="rounded-lg border border-[var(--bloom-border)] bg-white px-3 py-2 text-sm"
          />
        </div>
        <textarea
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full rounded-lg border border-[var(--bloom-border)] bg-white px-3 py-2 text-sm"
          rows={2}
        />
        <button
          type="submit"
          disabled={saving}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--rose)] py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Add medication
        </button>
      </form>

      <div className="mx-4 flex flex-col gap-2">
        {meds.length === 0 && (
          <p className="rounded-xl border border-dashed border-[var(--bloom-border)] p-6 text-center text-sm text-[var(--bloom-muted)]">
            No medications yet.
          </p>
        )}
        {meds.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-3 rounded-xl border border-[var(--bloom-border)] bg-white p-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--rose-light)] text-[var(--rose)]">
              <Pill className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--ink)]">{m.name}</p>
              <p className="truncate text-xs text-[var(--bloom-muted)]">
                {[m.dosage, m.schedule].filter(Boolean).join(" · ") || "—"}
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={m.active}
                onChange={async (e) => {
                  await toggle({ data: { id: m.id, active: e.target.checked } });
                  invalidate();
                }}
              />
              <span className="text-[var(--bloom-muted)]">Active</span>
            </label>
            <button
              onClick={async () => {
                await remove({ data: { id: m.id } });
                invalidate();
              }}
              className="text-[var(--bloom-muted)] hover:text-red-500"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="h-6" />
    </div>
  );
}
