import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery, useQueryClient, queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMeals, addMeal, deleteMeal } from "@/lib/meals.functions";
import { getProfile } from "@/lib/profiles.functions";
import { Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { useState } from "react";
import { differenceInWeeks, format } from "date-fns";

const mealsQuery = (date: string) =>
  queryOptions({ queryKey: ["meals", date], queryFn: () => listMeals({ data: { date } }) });
const profQuery = () => queryOptions({ queryKey: ["profile"], queryFn: () => getProfile() });

const SUGGESTIONS: Record<1 | 2 | 3, string[]> = {
  1: [
    "Ginger tea + whole-grain toast",
    "Yogurt with berries & granola",
    "Lentil soup with spinach",
    "Grilled chicken salad + avocado",
  ],
  2: [
    "Oatmeal with almonds & banana",
    "Quinoa bowl with roasted veggies",
    "Salmon with sweet potato",
    "Cottage cheese + fruit",
  ],
  3: [
    "Iron-rich smoothie (spinach, berries, oats)",
    "Chickpea stew with brown rice",
    "Baked cod + steamed greens",
    "Greek yogurt with dates & seeds",
  ],
};

export const Route = createFileRoute("/_authenticated/meals")({
  head: () => ({ meta: [{ title: "Meal Planner — Bloom" }] }),
  loader: async ({ context }) => {
    const date = format(new Date(), "yyyy-MM-dd");
    await Promise.all([
      context.queryClient.ensureQueryData(mealsQuery(date)),
      context.queryClient.ensureQueryData(profQuery()),
    ]);
  },
  component: MealsPage,
});

function MealsPage() {
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const { data: mealsData } = useSuspenseQuery(mealsQuery(date));
  const { data: prof } = useSuspenseQuery(profQuery());
  const qc = useQueryClient();
  const add = useServerFn(addMeal);
  const remove = useServerFn(deleteMeal);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("breakfast");

  const due = prof?.profile?.due_date ? new Date(prof.profile.due_date) : null;
  const week = due
    ? Math.max(1, Math.min(40, 40 - differenceInWeeks(due, new Date())))
    : 20;
  const tri: 1 | 2 | 3 = week <= 12 ? 1 : week <= 27 ? 2 : 3;

  const invalidate = () => qc.invalidateQueries({ queryKey: ["meals", date] });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await add({ data: { plan_date: date, meal_type: type, title } });
    setTitle("");
    invalidate();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="px-5 py-3">
        <h1 className="font-serif text-2xl text-[var(--ink)]">Meal Planner</h1>
        <p className="mt-1 text-sm text-[var(--bloom-muted)]">
          Prenatal nutrition ideas tuned to trimester {tri}.
        </p>
      </div>

      <div className="mx-4 flex items-center gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-lg border border-[var(--bloom-border)] bg-white px-3 py-2 text-sm"
        />
      </div>

      <form
        onSubmit={submit}
        className="mx-4 flex flex-col gap-2 rounded-2xl border border-[var(--bloom-border)] bg-white p-4"
      >
        <div className="flex gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as typeof type)}
            className="rounded-lg border border-[var(--bloom-border)] bg-white px-2 py-2 text-sm"
          >
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="dinner">Dinner</option>
            <option value="snack">Snack</option>
          </select>
          <input
            placeholder="What are you having?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 rounded-lg border border-[var(--bloom-border)] bg-white px-3 py-2 text-sm"
          />
          <button className="rounded-lg bg-[var(--rose)] px-3 py-2 text-white">
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </form>

      <div className="mx-4 flex flex-col gap-2">
        {mealsData.meals.length === 0 && (
          <p className="rounded-xl border border-dashed border-[var(--bloom-border)] p-6 text-center text-sm text-[var(--bloom-muted)]">
            No meals planned for this date.
          </p>
        )}
        {mealsData.meals.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-3 rounded-xl border border-[var(--bloom-border)] bg-white p-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--rose-light)] text-[var(--rose)]">
              <UtensilsCrossed className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium capitalize text-[var(--ink)]">
                {m.meal_type}
              </p>
              <p className="truncate text-xs text-[var(--bloom-muted)]">{m.title}</p>
            </div>
            <button
              onClick={async () => {
                await remove({ data: { id: m.id } });
                invalidate();
              }}
              className="text-[var(--bloom-muted)] hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mx-4">
        <p className="mb-2 text-sm font-medium text-[var(--ink)]">Suggestions for you</p>
        <div className="grid grid-cols-1 gap-2">
          {SUGGESTIONS[tri].map((s) => (
            <button
              key={s}
              onClick={() => setTitle(s)}
              className="rounded-xl border border-[var(--bloom-border)] bg-[var(--rose-light)]/50 p-3 text-left text-sm text-[var(--ink)]"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="h-6" />
    </div>
  );
}
