import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Bus, Calendar, Loader2, Ticket as TicketIcon, XCircle } from "lucide-react";

export const Route = createFileRoute("/billet/$id")({
  head: () => ({
    meta: [{ title: "Mon billet · AERT–UAM" }],
  }),
  component: BilletPage,
});

type TicketData = {
  id: string;
  reference: string;
  nom_complet: string;
  telephone: string;
  statut: string;
  montant: number;
  caravane_titre: string;
  caravane_trajet: string;
  caravane_date: string;
  bus_nom: string | null;
  bus_numero: number | null;
};

function BilletPage() {
  const { id } = Route.useParams();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc("get_ticket", { _id: id });
      const row = (data as TicketData[] | null)?.[0] ?? null;
      if (error || !row) {
        setNotFound(true);
        setLoading(false);
        return;
      }
      setTicket(row);
      // Le QR encode l'URL du billet elle-même : scanné par l'appli de contrôle du
      // bureau, il déclenche l'embarquement ; scanné par un téléphone quelconque,
      // il rouvre simplement cette page.
      const url = `${window.location.origin}/billet/${row.id}`;
      const dataUrl = await QRCode.toDataURL(url, { width: 320, margin: 2 });
      setQrDataUrl(dataUrl);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="container-prose py-24 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !ticket) {
    return (
      <div className="container-prose py-24 max-w-lg text-center">
        <XCircle className="h-10 w-10 text-destructive mx-auto mb-3" />
        <h1 className="font-display text-2xl text-primary mb-2">Billet introuvable</h1>
        <p className="text-muted-foreground mb-6">
          Ce billet n'existe pas, ou ton paiement n'est pas encore validé. Si tu viens de payer,
          patiente quelques instants puis vérifie via ta référence et ton numéro sur la page
          Caravanes.
        </p>
        <Button asChild>
          <Link to="/caravanes">Retour aux caravanes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-prose py-12 max-w-md">
      <div className="rounded-2xl border border-gold/40 bg-card overflow-hidden shadow-sm">
        <div className="bg-primary text-primary-foreground px-6 py-4 flex items-center gap-2">
          <TicketIcon className="h-5 w-5" />
          <span className="font-display text-lg">Billet AERT–UAM</span>
        </div>
        <div className="p-6 flex flex-col items-center text-center">
          {qrDataUrl && (
            <img
              src={qrDataUrl}
              alt="QR code du billet"
              width={220}
              height={220}
              className="rounded-lg border border-border"
            />
          )}
          <div className="mt-4 text-xs uppercase tracking-wider text-muted-foreground">
            Référence
          </div>
          <div className="font-display text-2xl text-primary">{ticket.reference}</div>
          <div className="mt-1 text-sm font-medium">{ticket.nom_complet}</div>

          <div className="mt-5 w-full text-left rounded-lg border border-border p-4 space-y-2">
            <div className="font-medium">{ticket.caravane_titre}</div>
            <div className="text-sm text-foreground/80 flex items-center gap-1.5">
              <Bus className="h-3.5 w-3.5" /> {ticket.caravane_trajet}
            </div>
            <div className="text-sm text-foreground/80 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(ticket.caravane_date).toLocaleString("fr-FR", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </div>
            {ticket.bus_nom && (
              <div className="pt-2 mt-2 border-t border-border text-sm">
                <span className="text-muted-foreground">Car assigné : </span>
                <span className="font-medium text-primary">
                  {ticket.bus_nom} (N°{ticket.bus_numero})
                </span>
              </div>
            )}
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Présente ce QR code (à l'écran ou en capture d'écran) à l'embarquement. Enregistre
            cette page ou fais une capture d'écran pour la retrouver facilement.
          </p>
        </div>
      </div>
    </div>
  );
}
