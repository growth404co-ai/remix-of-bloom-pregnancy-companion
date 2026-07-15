
-- Extend profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS partner_name text,
  ADD COLUMN IF NOT EXISTS health_conditions text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS dietary_preferences text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS pregnancy_history text,
  ADD COLUMN IF NOT EXISTS previous_pregnancies integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS partner_invite_code text UNIQUE,
  ADD COLUMN IF NOT EXISTS push_endpoint text;

-- Generic updated_at trigger fn (idempotent)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- MEDICATIONS
CREATE TABLE IF NOT EXISTS public.medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  dosage text,
  schedule text,
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medications TO authenticated;
GRANT ALL ON public.medications TO service_role;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meds_owner_all" ON public.medications FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_meds_updated BEFORE UPDATE ON public.medications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- CONTRACTIONS
CREATE TABLE IF NOT EXISTS public.contractions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  started_at timestamptz NOT NULL,
  ended_at timestamptz,
  intensity smallint,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.contractions TO authenticated;
GRANT ALL ON public.contractions TO service_role;
ALTER TABLE public.contractions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contractions_owner_all" ON public.contractions FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- SYMPTOM CHECKS
CREATE TABLE IF NOT EXISTS public.symptom_checks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptoms text[] NOT NULL DEFAULT '{}'::text[],
  notes text,
  risk_level text CHECK (risk_level IN ('low','medium','urgent')),
  ai_advice text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.symptom_checks TO authenticated;
GRANT ALL ON public.symptom_checks TO service_role;
ALTER TABLE public.symptom_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "symptoms_owner_all" ON public.symptom_checks FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- MEAL PLANS
CREATE TABLE IF NOT EXISTS public.meal_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_date date NOT NULL DEFAULT current_date,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  title text NOT NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_plans TO authenticated;
GRANT ALL ON public.meal_plans TO service_role;
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meals_owner_all" ON public.meal_plans FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- JOURNAL
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text,
  content text,
  mood text,
  photo_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journal_entries TO authenticated;
GRANT ALL ON public.journal_entries TO service_role;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "journal_owner_all" ON public.journal_entries FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_journal_updated BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PARTNER LINKS: owner grants a partner view access
CREATE TABLE IF NOT EXISTS public.partner_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (owner_id, partner_id)
);
GRANT SELECT, INSERT, DELETE ON public.partner_links TO authenticated;
GRANT ALL ON public.partner_links TO service_role;
ALTER TABLE public.partner_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "partner_links_visible" ON public.partner_links FOR SELECT TO authenticated
  USING (auth.uid() = owner_id OR auth.uid() = partner_id);
CREATE POLICY "partner_links_owner_insert" ON public.partner_links FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = partner_id);
CREATE POLICY "partner_links_owner_delete" ON public.partner_links FOR DELETE TO authenticated
  USING (auth.uid() = owner_id OR auth.uid() = partner_id);

-- helper: is caller a partner viewer for a given owner
CREATE OR REPLACE FUNCTION public.is_partner_of(_owner uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.partner_links
    WHERE owner_id = _owner AND partner_id = auth.uid());
$$;

-- Extend partner visibility on existing owner-scoped tables
CREATE POLICY "tracker_partner_read" ON public.tracker_logs FOR SELECT TO authenticated
  USING (public.is_partner_of(user_id));
CREATE POLICY "meds_partner_read" ON public.medications FOR SELECT TO authenticated
  USING (public.is_partner_of(user_id));
CREATE POLICY "contractions_partner_read" ON public.contractions FOR SELECT TO authenticated
  USING (public.is_partner_of(user_id));
CREATE POLICY "meals_partner_read" ON public.meal_plans FOR SELECT TO authenticated
  USING (public.is_partner_of(user_id));
CREATE POLICY "journal_partner_read" ON public.journal_entries FOR SELECT TO authenticated
  USING (public.is_partner_of(user_id));
CREATE POLICY "profiles_partner_read" ON public.profiles FOR SELECT TO authenticated
  USING (public.is_partner_of(id));
