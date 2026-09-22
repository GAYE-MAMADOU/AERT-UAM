// Attribution automatique du car + validation d'une inscription payée.
export async function assignBusAndValidate(inscriptionId: string, transactionRef: string | null) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: insc } = await supabaseAdmin
    .from("inscriptions")
    .select("id, statut, caravane_id, bus_id")
    .eq("id", inscriptionId)
    .maybeSingle();

  if (!insc) return "not_found";
  if (insc.statut === "valide") return "already";

  let busId: string | null = insc.bus_id;
  if (!busId) {
    const { data: buses } = await supabaseAdmin
      .from("bus")
      .select("id, places_total, status")
      .eq("caravane_id", insc.caravane_id)
      .eq("status", "ouvert")
      .order("numero", { ascending: true });

    for (const b of buses ?? []) {
      const { count } = await supabaseAdmin
        .from("inscriptions")
        .select("id", { count: "exact", head: true })
        .eq("bus_id", b.id)
        .eq("statut", "valide");
      if ((count ?? 0) < b.places_total) {
        busId = b.id;
        if ((count ?? 0) + 1 >= b.places_total) {
          await supabaseAdmin.from("bus").update({ status: "plein" }).eq("id", b.id);
        }
        break;
      }
    }
  }

  await supabaseAdmin
    .from("inscriptions")
    .update({
      statut: "valide",
      reference_transaction: transactionRef,
      valide_le: new Date().toISOString(),
      bus_id: busId,
    })
    .eq("id", insc.id);

  return "ok";
}
