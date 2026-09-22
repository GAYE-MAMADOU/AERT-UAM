GRANT INSERT ON TABLE public.inscriptions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.inscriptions TO authenticated;
GRANT ALL ON TABLE public.inscriptions TO service_role;