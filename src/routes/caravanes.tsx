import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { createPaytechPayment, reconcilePaytechPayment } from "@/lib/payments.functions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Bus,
  MapPin,
  Calendar,
  CreditCard,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Loader2,
  QrCode,
} from "lucide-react";

export const Route = createFileRoute("/caravanes")({
  head: () => ({
    meta: [
      { title: "Caravanes · AERT–UAM" },
      {
        name: "description",
        content: "Inscris-toi aux caravanes organisées par l'AERT–UAM entre l'UAM et Thiès.",
      },
      { property: "og:title", content: "Caravanes AERT–UAM" },
      { property: "og:description", content: "Voyager entre UAM et Thiès, en toute simplicité." },
    ],
  }),
  component: CaravanesPublic,
});

type Caravane = {
  id: string;
  titre: string;
  trajet: string;
  date_depart: string;
  lieu_depart: string;
  prix: number;
  places_total: number;
  numero_wave: string | null;
  numero_om: string | null;
  description: string | null;
};

function CaravanesPublic() {
  const [items, setItems] = useState<Caravane[]>([]);
  const [loading, setLoading] = useState(true);
  const reconcilePayment = useServerFn(reconcilePaytechPayment);
  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const paid = params.get("paid");
    const payment = params.get("payment");
    const cancelled = params.get("cancelled");
    if (paid) toast.success(`Paiement reçu ! Ton inscription ${paid} est en cours de validation.`);
    if (cancelled) toast.info(`Paiement annulé (${cancelled}). Tu peux réessayer.`);
    if (payment) {
      reconcilePayment({ data: { inscription_id: payment } })
        .then((result) => {
          if (result.status === "validated") {
            toast.success(
              `Paiement confirmé ! Ton inscription ${result.reference ?? ""} est validée.`,
            );
            // On redirige directement vers le billet (avec QR code) au lieu de laisser
            // la référence disparaître dans un toast — l'utilisateur a le temps de
            // l'enregistrer ou d'en faire une capture d'écran.
            navigate({ to: "/billet/$id", params: { id: payment } });
          } else {
            toast.info(
              "Paiement en cours de confirmation. Ton inscription sera mise à jour automatiquement.",
            );
          }
        })
        .catch(() => toast.info("Paiement reçu. La confirmation automatique est encore en cours."));
    }
    if (paid || payment || cancelled) {
      const url = new URL(window.location.href);
      url.searchParams.delete("paid");
      url.searchParams.delete("payment");
      url.searchParams.delete("cancelled");
      window.history.replaceState({}, "", url.toString());
    }
  }, [reconcilePayment, navigate]);

  useEffect(() => {
    let ignore = false;
    async function load() {
      const { data, error } = await supabase
        .from("caravanes")
        .select("*")
        .eq("status", "ouverte")
        .order("date_depart");
      if (!ignore) {
        if (error) toast.error(error.message);
        setItems((data ?? []) as Caravane[]);
        setLoading(false);
      }
    }
    load();

    const channel = supabase
      .channel("caravanes-public")
      .on("postgres_changes", { event: "*", schema: "public", table: "caravanes" }, () => load())
      .subscribe();

    return () => {
      ignore = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="container-prose py-16">
      <header className="max-w-2xl">
        <div className="text-xs uppercase tracking-[0.2em] text-gold">Caravanes</div>
        <h1 className="font-display text-4xl md:text-5xl text-primary mt-2">
          Voyager entre l'UAM et Thiès
        </h1>
        <p className="text-muted-foreground mt-3">
          Inscris-toi à une caravane organisée par l'AERT–UAM. Bagages pris en charge, départ
          groupé, paiement simple via Wave ou Orange Money.
        </p>
      </header>

      {items.length > 0 && <LookupCard />}

      <div className="mt-10 grid md:grid-cols-2 gap-4">
        {items.map((c) => (
          <article
            key={c.id}
            className="rounded-2xl border border-border bg-card p-6 flex flex-col"
          >
            <div className="flex items-start justify-between">
              <h2 className="font-display text-2xl text-primary">{c.titre}</h2>
              <span className="text-xs bg-gold/15 text-gold-foreground border border-gold/30 px-2 py-1 rounded-full">
                {c.prix} FCFA
              </span>
            </div>
            <ul className="mt-4 space-y-2 text-sm text-foreground/80">
              <li className="flex items-center gap-2">
                <Bus className="h-4 w-4 text-primary" /> {c.trajet}
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> {c.lieu_depart}
              </li>
              <li className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />{" "}
                {new Date(c.date_depart).toLocaleString("fr-FR", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </li>
            </ul>
            {c.description && <p className="mt-3 text-sm text-muted-foreground">{c.description}</p>}
            <div className="mt-auto pt-5">
              <InscriptionDialog caravane={c} />
            </div>
          </article>
        ))}
        {items.length === 0 && (
          <div className="md:col-span-2 text-sm text-muted-foreground rounded-md border border-dashed border-border p-10 text-center flex flex-col items-center justify-center gap-2">
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Chargement…
              </>
            ) : (
              "Aucune caravane ouverte pour le moment. Reviens bientôt !"
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InscriptionDialog({ caravane }: { caravane: Caravane }) {
  const [open, setOpen] = useState(false);
  const [nom, setNom] = useState("");
  const [tel, setTel] = useState("");
  const [email, setEmail] = useState("");
  const [filiere, setFiliere] = useState("");
  const [bagages, setBagages] = useState(1);

  const [loading, setLoading] = useState(false);

  const startCheckout = useServerFn(createPaytechPayment);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const inscriptionId = crypto.randomUUID();
    const { error } = await supabase.from("inscriptions").insert({
      id: inscriptionId,
      caravane_id: caravane.id,
      nom_complet: nom,
      telephone: tel,
      email: email || null,
      filiere: filiere || null,
      bagages,
      montant: caravane.prix,
      moyen_paiement: "paytech",
    });

    if (error) {
      setLoading(false);
      toast.error(error.message ?? "Erreur lors de l'inscription");
      return;
    }

    try {
      const pay = await startCheckout({ data: { inscription_id: inscriptionId } });
      if (!pay?.url) {
        setLoading(false);
        toast.error(pay?.error ?? "Impossible d'initier le paiement. Contacte le bureau.");
        return;
      }
      toast.success("Ouverture de la page de paiement sécurisée…");
      // La page PayTech refuse d'être affichée dans une iframe (aperçu Lovable) :
      // on sort de l'iframe ou on ouvre un nouvel onglet.
      const opened = window.open(pay.url, "_blank", "noopener,noreferrer");
      if (!opened) {
        if (window.top && window.top !== window.self) {
          window.top.location.href = pay.url;
        } else {
          window.location.href = pay.url;
        }
      }
      setLoading(false);
      setOpen(false);
    } catch {
      setLoading(false);
      toast.error("Impossible d'initier le paiement. Contacte le bureau.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">S'inscrire</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>S'inscrire à la caravane</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Nom complet</Label>
            <Input required value={nom} onChange={(e) => setNom(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Téléphone</Label>
              <Input
                required
                value={tel}
                onChange={(e) => setTel(e.target.value)}
                placeholder="77 000 00 00"
              />
            </div>
            <div>
              <Label>Bagages</Label>
              <Input
                required
                type="number"
                min={1}
                value={bagages}
                onChange={(e) => setBagages(+e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label>Email (optionnel)</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label>Filière (optionnel)</Label>
            <Input value={filiere} onChange={(e) => setFiliere(e.target.value)} />
          </div>
          <div className="rounded-md border border-gold/40 bg-gold/5 p-3 text-xs text-foreground/80 flex items-start gap-2">
            <CreditCard className="h-4 w-4 mt-0.5 text-primary shrink-0" />
            <span>
              Tu seras redirigé vers la page de paiement sécurisée <strong>PayTech</strong> pour
              payer par <strong>Wave</strong>, <strong>Orange Money</strong>,{" "}
              <strong>Free Money</strong> ou carte bancaire. Ton inscription sera validée{" "}
              <strong>automatiquement</strong> dès réception du paiement.
            </span>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Préparation du paiement…" : `Payer ${caravane.prix} FCFA (Wave / OM)`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

type LookupResult = {
  id: string;
  reference: string;
  nom_complet: string;
  statut: string;
  caravane_titre: string;
  caravane_trajet: string;
  caravane_date: string;
  bus_nom: string | null;
  bus_numero: number | null;
  bus_status: string | null;
};

function LookupCard() {
  const [ref, setRef] = useState("");
  const [tel, setTel] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [searched, setSearched] = useState(false);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setSearched(false);
    const { data, error } = await supabase.rpc("lookup_inscription", {
      _reference: ref,
      _telephone: tel,
    });
    setLoading(false);
    setSearched(true);
    if (error) {
      toast.error(error.message);
      setResult(null);
      return;
    }
    const row = (data as LookupResult[] | null)?.[0] ?? null;
    setResult(row);
  }

  const statutInfo = result
    ? result.statut === "valide"
      ? { icon: CheckCircle2, label: "Validée", cls: "text-emerald-600" }
      : result.statut === "refuse"
        ? { icon: XCircle, label: "Refusée", cls: "text-destructive" }
        : { icon: Clock, label: "En attente de validation", cls: "text-amber-600" }
    : null;

  return (
    <section className="mt-10 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-center gap-2 text-primary">
        <Search className="h-4 w-4" />
        <h2 className="font-display text-xl">Vérifier mon inscription & mon car</h2>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        Entre ta référence et ton numéro de téléphone pour voir le statut et le car qui te sera
        attribué.
      </p>
      <form onSubmit={search} className="mt-4 grid sm:grid-cols-[1fr_1fr_auto] gap-3">
        <Input
          placeholder="Référence (ex. AERT-XXXX)"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          required
        />
        <Input
          placeholder="Téléphone"
          value={tel}
          onChange={(e) => setTel(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? "..." : "Vérifier"}
        </Button>
      </form>

      {searched && !result && (
        <div className="mt-4 text-sm text-muted-foreground rounded-md border border-dashed border-border p-4">
          Aucune inscription trouvée avec ces informations.
        </div>
      )}

      {result && statutInfo && (
        <div className="mt-5 grid sm:grid-cols-2 gap-3">
          <div className="rounded-lg border border-border p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Référence</div>
            <div className="font-display text-xl text-primary">{result.reference}</div>
            <div className="text-sm mt-1">{result.nom_complet}</div>
            <div className={`mt-2 inline-flex items-center gap-1 text-sm ${statutInfo.cls}`}>
              <statutInfo.icon className="h-4 w-4" /> {statutInfo.label}
            </div>
            {result.statut === "valide" && (
              <Button asChild size="sm" className="mt-3 w-full">
                <Link to="/billet/$id" params={{ id: result.id }}>
                  <QrCode className="mr-1.5 h-4 w-4" /> Voir mon billet
                </Link>
              </Button>
            )}
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Caravane</div>
            <div className="font-medium">{result.caravane_titre}</div>
            <div className="text-sm text-foreground/80 flex items-center gap-1 mt-1">
              <Bus className="h-3.5 w-3.5" /> {result.caravane_trajet}
            </div>
            <div className="text-sm text-foreground/80 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />{" "}
              {new Date(result.caravane_date).toLocaleString("fr-FR", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </div>
          </div>
          <div className="sm:col-span-2 rounded-lg border border-gold/40 bg-gold/5 p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Ton car</div>
            {result.bus_nom ? (
              <div className="mt-1 flex items-center gap-2 text-primary">
                <Bus className="h-5 w-5" />
                <span className="font-display text-lg">{result.bus_nom}</span>
                <span className="text-xs text-muted-foreground">(N°{result.bus_numero})</span>
              </div>
            ) : (
              <div className="mt-1 text-sm text-muted-foreground">
                {result.statut === "valide"
                  ? "Aucun car attribué pour le moment, contacte le bureau."
                  : "Le car te sera attribué dès la validation de ton paiement par le bureau."}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
