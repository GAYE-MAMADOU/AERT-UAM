ALTER TABLE public.bus REPLICA IDENTITY FULL;
ALTER TABLE public.inscriptions REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bus;
ALTER PUBLICATION supabase_realtime ADD TABLE public.inscriptions;