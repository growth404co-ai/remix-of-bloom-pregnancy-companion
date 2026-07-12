
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.claim_first_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_first_admin() TO authenticated;
REVOKE ALL ON FUNCTION public.create_profile_for_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.create_welcome_notification() FROM PUBLIC, anon, authenticated;

DROP POLICY IF EXISTS "Authenticated can read product images" ON storage.objects;
DROP POLICY IF EXISTS "Product images readable by authenticated" ON storage.objects;
DROP POLICY IF EXISTS "Product images are publicly readable" ON storage.objects;

CREATE POLICY "Product images are publicly readable"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'product-images');
