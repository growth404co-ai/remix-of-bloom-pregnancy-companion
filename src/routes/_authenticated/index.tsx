import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { queryOptions } from "@tanstack/react-query";
import { getProfile } from "@/lib/profiles.functions";
import { getBabyWeek } from "@/lib/products.functions";
import { getProducts } from "@/lib/products.functions";
import { useCart } from "@/hooks/use-cart";
import { differenceInWeeks, format } from "date-fns";
import { Sparkles, Plus } from "lucide-react";

const profileQuery = () =>
  queryOptions({
    queryKey: ["profile"],
    queryFn: () => getProfile(),
  });

const babyWeekQuery = (week: number) =>
  queryOptions({
    queryKey: ["baby-week", week],
    queryFn: () => getBabyWeek({ data: { week } }),
  });

const productsQuery = () =>
  queryOptions({
    queryKey: ["products"],
    queryFn: () => getProducts(),
  });

export const Route = createFileRoute("/_authenticated/")({
  head: () => ({
    meta: [
      { title: "Home — Bloom" },
      { name: "description", content: "Your weekly pregnancy dashboard" },
    ],
  }),
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(profileQuery());
  },
  component: HomePage,
});

function HomePage() {
  const { data: profileData } = useSuspenseQuery(profileQuery());
  const profile = profileData?.profile;

  const dueDate = profile?.due_date ? new Date(profile.due_date) : null;
  const now = new Date();
  const weeksPregnant = dueDate
    ? Math.max(1, Math.min(40, 40 - differenceInWeeks(dueDate, now)))
    : 20;
  const daysLeft = dueDate
    ? Math.max(0, Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 140;
  const trimester = weeksPregnant <= 12 ? "1st" : weeksPregnant <= 27 ? "2nd" : "3rd";
  const dueDateStr = dueDate ? format(dueDate, "MMM d") : "Nov 12";

  const { data: weekData } = useSuspenseQuery(babyWeekQuery(Math.round(weeksPregnant)));
  const baby = weekData?.week;

  const { data: productsData } = useSuspenseQuery(productsQuery());
  const products = (productsData?.products ?? []).slice(0, 6);
  const addItem = useCart((s) => s.addItem);

  const tips = [
    { icon: "💧", text: "Drink 8–10 glasses of water. Staying hydrated helps with common second-trimester symptoms." },
    { icon: "🚶‍♀️", text: "A 20-minute walk boosts mood and circulation. Keep it gentle and comfortable." },
    { icon: "🥗", text: "Focus on iron-rich foods today — leafy greens, lentils, and fortified cereals support your growing baby." },
  ];

  return (
    <div className="flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3">
        <div>
          <p className="text-sm text-[var(--bloom-muted)]">
            Good morning, {profile?.display_name || "there"} 🌷
          </p>
          <p className="font-serif text-xl text-[var(--ink)]">
            Week {Math.round(weeksPregnant)} ·{" "}
            {trimester === "2nd" ? "Halfway there!" : trimester === "3rd" ? "Final stretch!" : "Just getting started"}
          </p>
        </div>
        <Link
          to="/ask"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--bloom-border)] bg-white text-[var(--rose)]"
        >
          <Sparkles className="h-5 w-5" />
        </Link>
      </div>

      {/* Hero */}
      <div className="relative mx-4 overflow-hidden rounded-2xl bg-[var(--rose-light)] p-5">
        <div className="absolute right-[-20px] top-[-20px] h-[120px] w-[120px] rounded-full bg-[var(--rose)]/[0.08]" />
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--rose)]">You are in week</p>
        <p className="font-serif text-6xl leading-none text-[var(--rose-dark)]">{Math.round(weeksPregnant)}</p>
        <p className="mt-1 text-sm italic text-[var(--rose-dark)]">
          {trimester === "2nd" ? "You're halfway through your journey" : "Every week is a milestone"}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-white/70 p-2.5 text-center">
            <p className="text-base font-medium text-[var(--rose-dark)]">{trimester}</p>
            <p className="text-[10px] text-[var(--rose)]">Trimester</p>
          </div>
          <div className="rounded-xl bg-white/70 p-2.5 text-center">
            <p className="text-base font-medium text-[var(--rose-dark)]">{dueDateStr}</p>
            <p className="text-[10px] text-[var(--rose)]">Due date</p>
          </div>
          <div className="rounded-xl bg-white/70 p-2.5 text-center">
            <p className="text-base font-medium text-[var(--rose-dark)]">{daysLeft}</p>
            <p className="text-[10px] text-[var(--rose)]">Days left</p>
          </div>
        </div>
      </div>

      {/* Baby this week */}
      <div className="mt-5 px-4">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="font-serif text-lg text-[var(--ink)]">Baby this week</h2>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-[var(--bloom-border)] bg-white p-4">
          <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-[var(--rose-light)] text-4xl">
            {baby?.fruit_emoji ?? "🍌"}
          </div>
          <div>
            <p className="text-[15px] font-medium text-[var(--ink)]">
              Size of a {baby?.size_name ?? "banana"}
            </p>
            <p className="text-xs text-[var(--bloom-muted)]">
              {baby?.length_cm ?? "16.4"} cm · ~{baby?.weight_g ?? "300"}g
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink)]">
              {baby?.fact ??
                "Your baby can hear your voice and is developing eyebrows and eyelashes this week!"}
            </p>
          </div>
        </div>
      </div>

      {/* Today's tips */}
      <div className="mt-5 px-4">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="font-serif text-lg text-[var(--ink)]">Today's tips</h2>
          <Link to="/ask" className="text-xs font-medium text-[var(--rose)]">
            Ask AI ✨
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {tips.map((tip, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 rounded-xl border border-[var(--bloom-border)] bg-white p-3 text-sm leading-relaxed text-[var(--ink)]"
            >
              <span className="shrink-0 text-xl">{tip.icon}</span>
              <span>{tip.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Shop */}
      <div className="mt-5 px-4">
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="font-serif text-lg text-[var(--ink)]">Shop</h2>
          <Link to="/shop" className="text-xs font-medium text-[var(--rose)]">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {products.map((product: { id: string; name: string; emoji: string; price_cents: number; rating: number; review_count: number }) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-2xl border border-[var(--bloom-border)] bg-white"
            >
              <div className="flex h-[100px] items-center justify-center bg-[var(--rose-light)] text-4xl">
                {product.emoji}
              </div>
              <div className="p-2.5 pb-3">
                <p className="text-[13px] font-medium text-[var(--ink)]">{product.name}</p>
                <p className="text-[15px] font-medium text-[var(--rose)]">
                  ${(product.price_cents / 100).toFixed(2)}
                </p>
                <p className="text-[11px] text-[var(--bloom-muted)]">
                  ⭐ {product.rating} · {product.review_count} reviews
                </p>
                <button
                  onClick={() =>
                    addItem({
                      id: product.id,
                      name: product.name,
                      emoji: product.emoji,
                      price_cents: product.price_cents,
                    })
                  }
                  className="mt-2 flex h-7 w-7 items-center justify-center rounded-full bg-[var(--rose)] text-white"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="h-6" />
    </div>
  );
}
