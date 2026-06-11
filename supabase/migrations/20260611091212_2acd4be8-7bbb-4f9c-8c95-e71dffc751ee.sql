CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  due_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own profile" ON public.profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.baby_weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week integer NOT NULL UNIQUE,
  fruit_emoji text NOT NULL,
  size_name text NOT NULL,
  length_cm numeric NOT NULL,
  weight_g numeric NOT NULL,
  fact text NOT NULL
);
GRANT SELECT ON public.baby_weeks TO anon;
GRANT SELECT ON public.baby_weeks TO authenticated;
GRANT ALL ON public.baby_weeks TO service_role;
ALTER TABLE public.baby_weeks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read baby weeks" ON public.baby_weeks FOR SELECT USING (true);

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price_cents integer NOT NULL,
  category text NOT NULL,
  emoji text NOT NULL,
  rating numeric NOT NULL DEFAULT 5.0,
  review_count integer NOT NULL DEFAULT 0,
  stripe_price_id text,
  tax_code text
);
GRANT SELECT ON public.products TO anon;
GRANT SELECT ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read products" ON public.products FOR SELECT USING (true);

CREATE TABLE public.tracker_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_type text NOT NULL,
  value jsonb,
  note text,
  logged_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tracker_logs TO authenticated;
GRANT ALL ON public.tracker_logs TO service_role;
ALTER TABLE public.tracker_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own tracker logs" ON public.tracker_logs FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  total_cents integer NOT NULL,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_profile_for_user();