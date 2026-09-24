import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertStaff(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("is_staff", { _user_id: ctx.userId });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}

// Extrait un UUID depuis un texte scanné (URL complète du billet, ou UUID brut).
function extractInscriptionId(scanned: string): string | null {
  const match = scanned.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  );
  return match ? match[0] : null;
}

export const checkInInscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { scanned: string }) => {
    if (!d?.scanned) throw new Error("Donnée scannée manquante");
    return d;
  })
  .handler(async ({ data, context }) => {
    await assertStaff(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const id = extractInscriptionId(data.scanned);
    if (!id) return { status: "invalid" as const };

    const { data: insc, error } = await supabaseAdmin
      .from("inscriptions")
      .select(
        "id, reference, nom_complet, statut, embarque, embarque_le, caravanes(titre, trajet), bus(nom, numero)",
      )
      .eq("id", id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!insc) return { status: "not_found" as const };
    if (insc.statut !== "valide") {
      return {
        status: "not_paid" as const,
        nom_complet: insc.nom_complet,
        reference: insc.reference,
      };
    }

    const caravane = insc.caravanes as unknown as { titre: string; trajet: string } | null;
    const bus = insc.bus as unknown as { nom: string | null; numero: number } | null;

    if (insc.embarque) {
      return {
        status: "already" as const,
        nom_complet: insc.nom_complet,
        reference: insc.reference,
        caravane_titre: caravane?.titre ?? "",
        bus_label: bus ? `${bus.nom ?? "Car"} (N°${bus.numero})` : null,
        embarque_le: insc.embarque_le,
      };
    }

    const { error: updErr } = await supabaseAdmin
      .from("inscriptions")
      .update({
        embarque: true,
        embarque_le: new Date().toISOString(),
        embarque_par: context.userId,
      })
      .eq("id", id);
    if (updErr) throw new Error(updErr.message);

    return {
      status: "ok" as const,
      nom_complet: insc.nom_complet,
      reference: insc.reference,
      caravane_titre: caravane?.titre ?? "",
      bus_label: bus ? `${bus.nom ?? "Car"} (N°${bus.numero})` : null,
    };
  });
