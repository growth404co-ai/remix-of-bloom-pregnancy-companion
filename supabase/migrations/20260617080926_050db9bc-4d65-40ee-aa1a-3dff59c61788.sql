CREATE TABLE public.saved_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_products TO authenticated;
GRANT ALL ON public.saved_products TO service_role;
ALTER TABLE public.saved_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saved products" ON public.saved_products
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text,
  type text NOT NULL DEFAULT 'info',
  read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own notifications" ON public.notifications
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX notifications_user_created_idx ON public.notifications(user_id, created_at DESC);
CREATE INDEX saved_products_user_idx ON public.saved_products(user_id);

-- Auto-create a welcome notification for new users
CREATE OR REPLACE FUNCTION public.create_welcome_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, title, body, type)
  VALUES (NEW.id, 'Welcome to Bloom 🌸', 'We''re so glad you''re here. Track your journey, shop essentials, and ask anything.', 'welcome');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_notify ON public.profiles;
CREATE TRIGGER on_profile_created_notify
AFTER INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.create_welcome_notification();
