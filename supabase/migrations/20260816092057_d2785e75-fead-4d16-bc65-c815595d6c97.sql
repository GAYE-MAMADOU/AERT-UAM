GRANT INSERT ON public.inscriptions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inscriptions TO authenticated;
GRANT ALL ON public.inscriptions TO service_role;

GRANT SELECT ON public.caravanes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.caravanes TO authenticated;
GRANT ALL ON public.caravanes TO service_role;

GRANT SELECT ON public.bus TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bus TO authenticated;
GRANT ALL ON public.bus TO service_role;

GRANT SELECT ON public.evenements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evenements TO authenticated;
GRANT ALL ON public.evenements TO service_role;

GRANT SELECT ON public.medias TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medias TO authenticated;
GRANT ALL ON public.medias TO service_role;

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;