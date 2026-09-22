
CREATE OR REPLACE FUNCTION public.lookup_inscription(_reference text, _telephone text)
RETURNS TABLE (
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
  SELECT i.reference, i.nom_complet, i.statut::text,
         c.titre, c.trajet, c.date_depart,
         b.nom, b.numero, b.status
  FROM public.inscriptions i
  JOIN public.caravanes c ON c.id = i.caravane_id
  LEFT JOIN public.bus b ON b.id = i.bus_id
  WHERE i.reference = upper(trim(_reference))
    AND regexp_replace(i.telephone, '\s+', '', 'g') = regexp_replace(_telephone, '\s+', '', 'g')
  LIMIT 1
$$;

GRANT EXECUTE ON FUNCTION public.lookup_inscription(text, text) TO anon, authenticated;
