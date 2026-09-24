-- Contrôle d'embarquement : colonnes de suivi sur inscriptions
ALTER TABLE public.inscriptions
  ADD COLUMN embarque BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN embarque_le TIMESTAMPTZ,
  ADD COLUMN embarque_par UUID REFERENCES auth.users(id);

-- RPC publique pour afficher le billet (uniquement si l'inscription est validée).
-- SECURITY DEFINER car un visiteur anonyme doit pouvoir la lire via l'ID (non devinable),
-- mais on ne renvoie rien tant que le paiement n'est pas validé.
CREATE OR REPLACE FUNCTION public.get_ticket(_id uuid)
RETURNS TABLE (
  id uuid,
  reference text,
  nom_complet text,
  telephone text,
  statut text,
  montant integer,
  caravane_titre text,
  caravane_trajet text,
  caravane_date timestamptz,
  bus_nom text,
  bus_numero int
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.id, i.reference, i.nom_complet, i.telephone, i.statut::text, i.montant,
         c.titre, c.trajet, c.date_depart,
         b.nom, b.numero
  FROM public.inscriptions i
  JOIN public.caravanes c ON c.id = i.caravane_id
  LEFT JOIN public.bus b ON b.id = i.bus_id
  WHERE i.id = _id AND i.statut = 'valide'
  LIMIT 1
$$;

REVOKE EXECUTE ON FUNCTION public.get_ticket(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_ticket(uuid) TO anon, authenticated;

-- lookup_inscription renvoie désormais aussi l'id, pour permettre le lien "Voir mon billet"
DROP FUNCTION IF EXISTS public.lookup_inscription(text, text);

CREATE FUNCTION public.lookup_inscription(_reference text, _telephone text)
RETURNS TABLE (
  id uuid,
  reference text,
  nom_complet text,
  statut text,
  caravane_titre text,
  caravane_trajet text,
  caravane_date timestamptz,
  bus_nom text,
  bus_numero int,
  bus_status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT i.id, i.reference, i.nom_complet, i.statut::text,
         c.titre, c.trajet, c.date_depart,
         b.nom, b.numero, b.status
  FROM public.inscriptions i
  JOIN public.caravanes c ON c.id = i.caravane_id
  LEFT JOIN public.bus b ON b.id = i.bus_id
  WHERE i.reference = upper(trim(_reference))
    AND regexp_replace(i.telephone, '\s+', '', 'g') = regexp_replace(_telephone, '\s+', '', 'g')
  LIMIT 1
$$;

REVOKE EXECUTE ON FUNCTION public.lookup_inscription(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.lookup_inscription(text, text) TO anon, authenticated;
