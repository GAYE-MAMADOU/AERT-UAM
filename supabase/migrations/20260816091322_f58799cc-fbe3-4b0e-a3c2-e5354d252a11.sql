DROP POLICY IF EXISTS "Public read archives" ON storage.objects;
CREATE POLICY "Staff read archives" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'archives' AND public.is_staff(auth.uid()));

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;
REVOKE ALL ON FUNCTION public.is_staff(uuid) FROM anon, authenticated, public;
REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;
REVOKE ALL ON FUNCTION public.lookup_inscription(text, text) FROM public;
GRANT EXECUTE ON FUNCTION public.lookup_inscription(text, text) TO anon, authenticated;