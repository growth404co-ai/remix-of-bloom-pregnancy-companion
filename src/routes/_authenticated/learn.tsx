import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, ChevronRight } from "lucide-react";
import { useState } from "react";

type Article = { id: string; title: string; category: string; body: string };

const ARTICLES: Article[] = [
  {
    id: "nutrition-1",
    category: "Nutrition",
    title: "Key nutrients in every trimester",
    body: "Folate, iron, calcium, DHA and choline are the pregnancy powerhouses. Aim for a mix of leafy greens, lentils, dairy or fortified alternatives, oily fish (or algae DHA), and eggs. A daily prenatal vitamin fills common gaps but is not a substitute for varied food.",
  },
  {
    id: "nutrition-2",
    category: "Nutrition",
    title: "Foods to limit or avoid",
    body: "Skip raw fish, unpasteurized cheeses and milk, deli meats unless heated, high-mercury fish (shark, swordfish, king mackerel), raw eggs, and alcohol. Limit caffeine to ~200 mg/day.",
  },
  {
    id: "exercise-1",
    category: "Exercise",
    title: "Safe movement in pregnancy",
    body: "30 minutes of moderate activity most days is generally safe if uncomplicated: walking, swimming, prenatal yoga, stationary cycling. Avoid contact sports, hot yoga, scuba, and lying flat on your back after week 20.",
  },
  {
    id: "sleep-1",
    category: "Sleep",
    title: "Getting better rest",
    body: "Side-sleeping (ideally left) improves circulation. A pregnancy pillow between the knees eases hip pain. Keep the room cool and dim; limit fluids 1 hour before bed to reduce night waking.",
  },
  {
    id: "mental-1",
    category: "Mental health",
    title: "Mood, anxiety, and asking for help",
    body: "Hormonal shifts and life changes make emotional ups and downs normal. Persistent sadness, loss of interest, panic, or intrusive thoughts warrant a call to your provider — perinatal mood and anxiety disorders are common and treatable.",
  },
  {
    id: "labor-1",
    category: "Labor",
    title: "Signs of true labor",
    body: "True labor contractions get stronger, longer, and closer together — not relieved by rest or hydration. Call your provider for: contractions 5 min apart for 1 hour, water breaking, heavy bleeding, decreased fetal movement, or severe headache/vision changes.",
  },
  {
    id: "partner-1",
    category: "Partner",
    title: "How partners can help",
    body: "Attend appointments, learn the 5-1-1 rule for labor, share meal prep, take over heavy tasks, and be the point person for logistics. Emotional presence — listening without fixing — matters more than any gadget.",
  },
];

const CATEGORIES = ["All", "Nutrition", "Exercise", "Sleep", "Mental health", "Labor", "Partner"];

export const Route = createFileRoute("/_authenticated/learn")({
  head: () => ({ meta: [{ title: "Learn — Bloom" }] }),
  component: LearnPage,
});

function LearnPage() {
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<Article | null>(null);
  const filtered = cat === "All" ? ARTICLES : ARTICLES.filter((a) => a.category === cat);

  if (open) {
    return (
      <div className="flex flex-col">
        <button
          onClick={() => setOpen(null)}
          className="px-5 py-3 text-sm text-[var(--rose)]"
        >
          ← Back to library
        </button>
        <div className="mx-4 rounded-2xl border border-[var(--bloom-border)] bg-white p-5">
          <p className="text-xs uppercase tracking-wider text-[var(--rose)]">{open.category}</p>
          <h1 className="mt-1 font-serif text-2xl text-[var(--ink)]">{open.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-[var(--ink)]">{open.body}</p>
        </div>
        <div className="h-6" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="px-5 py-3">
        <h1 className="font-serif text-2xl text-[var(--ink)]">Learn</h1>
        <p className="mt-1 text-sm text-[var(--bloom-muted)]">
          Evidence-based articles for every stage.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto px-4 pb-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
              cat === c
                ? "border-[var(--rose)] bg-[var(--rose)] text-white"
                : "border-[var(--bloom-border)] bg-white text-[var(--ink)]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mx-4 flex flex-col gap-2">
        {filtered.map((a) => (
          <button
            key={a.id}
            onClick={() => setOpen(a)}
            className="flex items-center gap-3 rounded-xl border border-[var(--bloom-border)] bg-white p-3 text-left"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--rose-light)] text-[var(--rose)]">
              <BookOpen className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--ink)]">{a.title}</p>
              <p className="text-xs text-[var(--bloom-muted)]">{a.category}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-[var(--bloom-muted)]" />
          </button>
        ))}
      </div>
      <div className="h-6" />
    </div>
  );
}
