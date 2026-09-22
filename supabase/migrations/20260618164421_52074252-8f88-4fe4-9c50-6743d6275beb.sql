
CREATE POLICY "Public read archives" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'archives');

CREATE POLICY "Staff upload archives" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'archives' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff update archives" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'archives' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff delete archives" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'archives' AND public.is_staff(auth.uid()));
