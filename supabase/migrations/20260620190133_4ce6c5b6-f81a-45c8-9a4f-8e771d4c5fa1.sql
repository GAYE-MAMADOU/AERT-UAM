CREATE TYPE bus_status AS ENUM ('ouvert','ferme','plein');

CREATE TABLE public.bus (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  caravane_id uuid NOT NULL REFERENCES public.caravanes(id) ON DELETE CASCADE,
  numero integer NOT NULL,
  nom text,
  places_total integer NOT NULL DEFAULT 0,
  status bus_status NOT NULL DEFAULT 'ouvert',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (caravane_id, numero)
);

GRANT SELECT ON public.bus TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bus TO authenticated;
GRANT ALL ON public.bus TO service_role;

ALTER TABLE public.bus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read bus" ON public.bus FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff manage bus" ON public.bus FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));

ALTER TABLE public.inscriptions ADD COLUMN bus_id uuid REFERENCES public.bus(id) ON DELETE SET NULL;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_bus_updated_at BEFORE UPDATE ON public.bus FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();