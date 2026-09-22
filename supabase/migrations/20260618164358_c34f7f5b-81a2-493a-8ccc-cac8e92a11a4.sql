
-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'bureau', 'member');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','bureau')
  )
$$;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- CARAVANES
CREATE TYPE public.caravane_status AS ENUM ('ouverte','fermee','terminee');

CREATE TABLE public.caravanes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre TEXT NOT NULL,
  trajet TEXT NOT NULL,
  date_depart TIMESTAMPTZ NOT NULL,
  lieu_depart TEXT NOT NULL,
  prix INTEGER NOT NULL DEFAULT 0,
  places_total INTEGER NOT NULL DEFAULT 0,
  numero_wave TEXT,
  numero_om TEXT,
  description TEXT,
  status public.caravane_status NOT NULL DEFAULT 'ouverte',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.caravanes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.caravanes TO authenticated;
GRANT ALL ON public.caravanes TO service_role;
ALTER TABLE public.caravanes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read caravanes" ON public.caravanes
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff manage caravanes" ON public.caravanes
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- INSCRIPTIONS
CREATE TYPE public.paiement_status AS ENUM ('en_attente','valide','refuse');

CREATE TABLE public.inscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  caravane_id UUID NOT NULL REFERENCES public.caravanes(id) ON DELETE CASCADE,
  reference TEXT NOT NULL UNIQUE DEFAULT ('CRV-' || to_char(now(),'YY') || '-' || lpad((floor(random()*10000))::text,4,'0')),
  nom_complet TEXT NOT NULL,
  telephone TEXT NOT NULL,
  email TEXT,
  filiere TEXT,
  bagages INTEGER NOT NULL DEFAULT 1,
  montant INTEGER NOT NULL DEFAULT 0,
  moyen_paiement TEXT,
  reference_transaction TEXT,
  statut public.paiement_status NOT NULL DEFAULT 'en_attente',
  note_bureau TEXT,
  valide_par UUID REFERENCES auth.users(id),
  valide_le TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.inscriptions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.inscriptions TO authenticated;
GRANT ALL ON public.inscriptions TO service_role;
ALTER TABLE public.inscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe" ON public.inscriptions
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Staff read all inscriptions" ON public.inscriptions
  FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff update inscriptions" ON public.inscriptions
  FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff delete inscriptions" ON public.inscriptions
  FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

-- EVENEMENTS
CREATE TABLE public.evenements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titre TEXT NOT NULL,
  description TEXT,
  date_evenement DATE NOT NULL,
  type TEXT,
  cover_url TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.evenements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evenements TO authenticated;
GRANT ALL ON public.evenements TO service_role;
ALTER TABLE public.evenements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read evenements" ON public.evenements
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff manage evenements" ON public.evenements
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));

-- MEDIAS
CREATE TABLE public.medias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evenement_id UUID NOT NULL REFERENCES public.evenements(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'image',
  url TEXT NOT NULL,
  legende TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.medias TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medias TO authenticated;
GRANT ALL ON public.medias TO service_role;
ALTER TABLE public.medias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read medias" ON public.medias
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Staff manage medias" ON public.medias
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));
