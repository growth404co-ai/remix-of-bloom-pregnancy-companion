## Bloom — Pregnancy Tracker

I'll faithfully port the HTML prototype into a real TanStack Start app on Lovable Cloud, then wire up live data, authentication, payments, and AI.

### Design

Keep the prototype's look 1:1: rose/teal palette, DM Serif Display headings, DM Sans body, soft cream background, phone-shell layout that gracefully fills wider screens. Move all colors/fonts into the design system in `src/styles.css` as semantic tokens. Build the bottom-nav, top-bar, hero card, baby card, tip pills, product cards, week-dot tracker, log cards, cart items, and profile menu as reusable components.

### Routes
```text
/auth                — sign in / sign up (email/password + Google)
/onboarding          — collect name + due date (first sign-in only)
/                    — Home (current week, baby info, tips)
/shop                — Product grid + categories
/tracker             — Week grid + log entry points
/log/$type           — Log a mood / symptom / weight / kick count / etc.
/cart                — Cart + Stripe checkout
/orders/success      — Post-checkout confirmation
/profile             — Profile menu, sign out
/ask                 — AI chat with "Bloom AI"
```

Public: `/auth`. Everything else lives under `_authenticated/` using the integration-managed gate.

### Backend (Lovable Cloud)

Tables (RLS scoped to `auth.uid()`):
- `profiles` — `id (=auth.users.id)`, `display_name`, `due_date`, `created_at`. Auto-created via trigger on signup.
- `tracker_logs` — `id`, `user_id`, `log_type` (mood/symptom/weight/kick/appointment/photo), `value` (jsonb), `note`, `logged_at`.
- `products` — `id`, `name`, `description`, `price_cents`, `category`, `emoji`, `rating`, `review_count`, `stripe_price_id`. Public read.
- `orders` — `id`, `user_id`, `stripe_session_id`, `status`, `total_cents`, `items` (jsonb), `created_at`.
- `baby_weeks` — `week`, `fruit_emoji`, `size_name`, `length_cm`, `weight_g`, `fact`. Public read; seeded for weeks 4–40.

Week number derives from `due_date` (40 − weeks remaining). All reads/writes go through `createServerFn` with `requireSupabaseAuth`.

### Shop + Stripe
Enable Lovable's built-in Stripe payments (`enable_stripe_payments`). Seed ~8 products via `batch_create_product` matching the prototype (prenatal vitamins, maternity dress, belly oil, nursing pillow, DHA omega-3, maternity jeans, plus a couple more). Each gets a Stripe tax code (digital/physical mix → use tax calculation and collection only, `automatic_tax`). Cart is in-memory (Zustand). Checkout creates a Stripe Checkout Session via server fn and redirects. A `/api/public/webhooks/stripe` route handles `checkout.session.completed` to write the order.

### AI chat
Lovable AI Gateway via the `ai-sdk-lovable-gateway` helper. New `src/routes/api/chat.ts` streams responses from `google/gemini-3-flash-preview` with a system prompt that knows the user's current pregnancy week. Chat UI uses AI Elements (`conversation`, `message`, `prompt-input`, `shimmer`) — assistant has no bubble background, user bubble uses rose/primary-foreground tokens. One conversation, no persistence (per default; user can clear).

### Tracker logging
The 6 log cards on `/tracker` open type-specific forms:
- Mood: 5-emoji picker + note
- Symptoms: multi-select chips + note
- Weight: number + unit
- Bump photo: upload to Cloud storage bucket `bump-photos` (private, RLS to owner)
- Kick count: timed counter
- Appointment: date/time + note

Each log appears as a "recent activity" list back on `/tracker`. The week-grid (1–40) marks weeks past the user's current week as done, current week highlighted.

### Out of scope for v1
- Community feed, saved-products, notifications, privacy screens (menu items will be present but route to a friendly "coming soon" page).
- Editing/deleting individual logs (just create + list).

### Technical notes
- TanStack Start file routes; Query owns all reads (`ensureQueryData` in loaders, `useSuspenseQuery` in components).
- `createServerFn` for all DB access; `requireSupabaseAuth` middleware; bearer attacher wired in `src/start.ts`.
- Auth: email/password + Google via `lovable.auth.signInWithOAuth("google", ...)`; `supabase--configure_social_auth` for Google.
- Stripe webhook in `src/routes/api/public/webhooks/stripe.ts`, signature-verified.
- AI key auto-provisioned via `ai_gateway--create`.
- Sitemap/robots added per template recipe (home, shop, auth public).

Sound good? I'll start with enabling Cloud + Stripe + AI, then build in this order: design system → auth/onboarding → home/tracker → shop/checkout → AI chat.