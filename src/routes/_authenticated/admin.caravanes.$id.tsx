import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Check, X, Bus as BusIcon, Plus, Lock, Unlock, Save, Users } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/caravanes/$id")({
  component: CaravaneDetail,
});

type Inscription = {
  id: string;
  reference: string;
  nom_complet: string;
  telephone: string;
  email: string | null;
  bagages: number;
  montant: number;
  moyen_paiement: string | null;
  reference_transaction: string | null;
  statut: "en_attente" | "valide" | "refuse";
  bus_id: string | null;
  created_at: string;
};

type Bus = {
  id: string;
  numero: number;
  nom: string | null;
  places_total: number;
  status: "ouvert" | "ferme" | "plein";
};

function CaravaneDetail() {
  const { id } = Route.useParams();
  const [caravane, setCaravane] = useState<{ titre: string; trajet: string } | null>(null);
  const [items, setItems] = useState<Inscription[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [refs, setRefs] = useState<Record<string, string>>({});
  const [newBus, setNewBus] = useState({ nom: "", places: 50 });
  const [editPlaces, setEditPlaces] = useState<Record<string, number>>({});

  async function load() {
    const [c, i, b] = await Promise.all([
      supabase.from("caravanes").select("titre, trajet").eq("id", id).single(),
      supabase.from("inscriptions").select("*").eq("caravane_id", id).order("created_at", { ascending: false }),
      supabase.from("bus").select("*").eq("caravane_id", id).order("numero", { ascending: true }),
    ]);
    if (c.data) setCaravane(c.data);
    if (i.data) setItems(i.data as Inscription[]);
    if (b.data) setBuses(b.data as Bus[]);
  }

  useEffect(() => { load(); }, [id]);

  // Realtime: refresh on bus & inscriptions changes for this caravane
  useEffect(() => {
    const ch = supabase
      .channel(`caravane-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "bus", filter: `caravane_id=eq.${id}` }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "inscriptions", filter: `caravane_id=eq.${id}` }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Compte par bus (inscrits validés)
  function countInBus(busId: string) {
    return items.filter((x) => x.statut === "valide" && x.bus_id === busId).length;
  }

  // Trouve le premier bus ouvert non plein
  function pickOpenBus(): Bus | null {
    for (const b of buses) {
      if (b.status !== "ouvert") continue;
      if (countInBus(b.id) < b.places_total) return b;
    }
    return null;
  }

  async function addBus(e: React.FormEvent) {
    e.preventDefault();
    const nextNum = (buses[buses.length - 1]?.numero ?? 0) + 1;
    const { error } = await supabase.from("bus").insert({
      caravane_id: id, numero: nextNum,
      nom: newBus.nom || `Bus ${nextNum}`,
      places_total: newBus.places, status: "ouvert",
    });
    if (error) toast.error(error.message);
    else { toast.success(`Bus ${nextNum} ajouté`); setNewBus({ nom: "", places: 50 }); load(); }
  }

  async function toggleBus(b: Bus) {
    const next = b.status === "ouvert" ? "ferme" : "ouvert";
    const { error } = await supabase.from("bus").update({ status: next }).eq("id", b.id);
    if (error) toast.error(error.message); else load();
  }

  async function savePlaces(b: Bus) {
    const val = editPlaces[b.id];
    if (!val || val < 1) { toast.error("Nombre de places invalide"); return; }
    const used = countInBus(b.id);
    if (val < used) { toast.error(`Impossible : ${used} place(s) déjà occupée(s)`); return; }
    const nextStatus: Bus["status"] = used >= val ? "plein" : (b.status === "plein" ? "ouvert" : b.status);
    const { error } = await supabase.from("bus").update({ places_total: val, status: nextStatus }).eq("id", b.id);
    if (error) toast.error(error.message);
    else { toast.success("Capacité mise à jour"); setEditPlaces((p) => { const n = { ...p }; delete n[b.id]; return n; }); load(); }
  }

  async function removeBus(b: Bus) {
    if (countInBus(b.id) > 0) { toast.error("Bus non vide, impossible de supprimer"); return; }
    if (!confirm(`Supprimer ${b.nom ?? "Bus " + b.numero} ?`)) return;
    const { error } = await supabase.from("bus").delete().eq("id", b.id);
    if (error) toast.error(error.message); else { toast.success("Supprimé"); load(); }
  }

  async function validate(insc: Inscription) {
    const txRef = refs[insc.id] ?? insc.reference_transaction ?? "";
    if (!txRef) { toast.error("Saisis la référence Wave/OM"); return; }
    const bus = pickOpenBus();
    if (!bus) { toast.error("Aucun bus ouvert disponible. Ouvre un nouveau bus."); return; }

    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("inscriptions").update({
      statut: "valide", reference_transaction: txRef, bus_id: bus.id,
      valide_par: u.user?.id, valide_le: new Date().toISOString(),
    }).eq("id", insc.id);
    if (error) { toast.error(error.message); return; }

    // Si le bus devient plein, on le marque comme plein
    const newCount = countInBus(bus.id) + 1;
    if (newCount >= bus.places_total) {
      await supabase.from("bus").update({ status: "plein" }).eq("id", bus.id);
    }
    toast.success(`Validé · placé dans ${bus.nom ?? "Bus " + bus.numero}`);
    load();
  }

  async function refuse(insc: Inscription) {
    if (!confirm("Marquer ce paiement comme refusé ?")) return;
    const { error } = await supabase.from("inscriptions").update({ statut: "refuse" }).eq("id", insc.id);
    if (error) toast.error(error.message);
    else { toast.success("Refusé"); load(); }
  }

  const counts = {
    valide: items.filter(i => i.statut === "valide").length,
    en_attente: items.filter(i => i.statut === "en_attente").length,
    refuse: items.filter(i => i.statut === "refuse").length,
  };

  const totalPlaces = buses.reduce((s, b) => s + b.places_total, 0);
  const openBus = pickOpenBus();

  return (
    <div>
      <Link to="/admin/caravanes" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Retour
      </Link>
      <h1 className="font-display text-3xl text-primary mt-2">{caravane?.titre ?? "Caravane"}</h1>
      <p className="text-sm text-muted-foreground">{caravane?.trajet}</p>

      <div className="mt-6 flex gap-3 text-xs flex-wrap">
        <Pill label="Validés" value={counts.valide} tone="ok" />
        <Pill label="En attente" value={counts.en_attente} tone="warn" />
        <Pill label="Refusés" value={counts.refuse} tone="bad" />
        <Pill label="Places (bus)" value={`${counts.valide}/${totalPlaces}`} tone="ok" />
      </div>

      {/* OCCUPATION GLOBALE */}
      {buses.length > 0 && (
        <section className="mt-6 p-4 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-semibold flex items-center gap-2"><Users className="h-4 w-4" /> Occupation globale</div>
            <div className="text-xs text-muted-foreground">
              {counts.valide} / {totalPlaces} places · {totalPlaces > 0 ? Math.round((counts.valide / totalPlaces) * 100) : 0}%
            </div>
          </div>
          <div className="h-2 bg-muted rounded overflow-hidden">
            <div
              className={`h-full transition-all ${counts.valide >= totalPlaces ? "bg-red-500" : counts.valide / Math.max(1, totalPlaces) > 0.8 ? "bg-amber-500" : "bg-primary"}`}
              style={{ width: `${Math.min(100, (counts.valide / Math.max(1, totalPlaces)) * 100)}%` }}
            />
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">
            {totalPlaces - counts.valide > 0 ? `${totalPlaces - counts.valide} place(s) disponible(s)` : "Complet"}
            {openBus ? ` · Prochain : ${openBus.nom ?? `Bus ${openBus.numero}`}` : " · Aucun bus ouvert"}
          </div>
        </section>
      )}

      {/* GESTION DES BUS */}
      <section className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-xl text-primary flex items-center gap-2"><BusIcon className="h-5 w-5" /> Bus</h2>
        </div>

        <form onSubmit={addBus} className="flex flex-wrap gap-2 items-end mb-4 p-3 rounded-lg border border-border bg-card">
          <div className="flex-1 min-w-[140px]">
            <label className="text-xs text-muted-foreground">Nom (optionnel)</label>
            <Input value={newBus.nom} onChange={(e) => setNewBus({ ...newBus, nom: e.target.value })} placeholder={`Bus ${(buses[buses.length - 1]?.numero ?? 0) + 1}`} />
          </div>
          <div className="w-28">
            <label className="text-xs text-muted-foreground">Places</label>
            <Input type="number" min={1} value={newBus.places} onChange={(e) => setNewBus({ ...newBus, places: Number(e.target.value) })} />
          </div>
          <Button type="submit"><Plus className="h-4 w-4 mr-1" /> Ajouter un bus</Button>
        </form>

        {buses.length === 0 ? (
          <div className="text-sm text-muted-foreground rounded-md border border-dashed border-border p-6 text-center">
            Aucun bus. Ajoute le premier bus pour pouvoir valider les paiements.
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {buses.map((b) => {
              const used = countInBus(b.id);
              const full = used >= b.places_total;
              const pct = Math.min(100, (used / Math.max(1, b.places_total)) * 100);
              const isNext = openBus?.id === b.id;
              const editing = editPlaces[b.id] !== undefined;
              return (
                <div key={b.id} className={`rounded-lg border p-3 ${isNext ? "border-primary ring-1 ring-primary/30" : "border-border"} bg-card`}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold flex items-center gap-2 flex-wrap">
                        {b.nom ?? `Bus ${b.numero}`}
                        {isNext && <span className="text-[10px] uppercase bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Prochain</span>}
                        {full && <span className="text-[10px] uppercase bg-red-500 text-white px-1.5 py-0.5 rounded">Plein</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{used} / {b.places_total} places · {Math.round(pct)}% · {b.status}</div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button size="sm" variant="outline" onClick={() => toggleBus(b)} title={b.status === "ouvert" ? "Fermer" : "Rouvrir"}>
                        {b.status === "ouvert" ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => removeBus(b)}><X className="h-3 w-3" /></Button>
                    </div>
                  </div>

                  <div className="h-2 bg-muted rounded mt-2 overflow-hidden">
                    <div className={`h-full transition-all ${full ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                  </div>

                  <div className="mt-2 flex items-end gap-2">
                    <div className="flex-1">
                      <label className="text-[11px] text-muted-foreground">Capacité (places)</label>
                      <Input
                        type="number"
                        min={used || 1}
                        value={editing ? editPlaces[b.id] : b.places_total}
                        onChange={(e) => setEditPlaces({ ...editPlaces, [b.id]: Number(e.target.value) })}
                        className="h-8"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={() => savePlaces(b)}
                      disabled={!editing || editPlaces[b.id] === b.places_total}
                    >
                      <Save className="h-3 w-3 mr-1" /> Enregistrer
                    </Button>
                  </div>
                  {used > 0 && (
                    <div className="text-[10px] text-muted-foreground mt-1">Minimum : {used} (places déjà occupées)</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>


      {/* INSCRIPTIONS */}
      <section className="mt-8">
        <h2 className="font-display text-xl text-primary mb-3">Inscriptions</h2>
        <div className="grid gap-3">
          {items.length === 0 && (
            <div className="text-sm text-muted-foreground rounded-md border border-dashed border-border p-8 text-center">
              Aucune inscription pour le moment.
            </div>
          )}
          {items.map((i) => {
            const bus = buses.find((b) => b.id === i.bus_id);
            return (
              <div key={i.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-start gap-3 justify-between">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{i.nom_complet}</span>
                      <code className="text-[11px] bg-muted px-1.5 py-0.5 rounded">{i.reference}</code>
                      <StatusBadge s={i.statut} />
                      {bus && (
                        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary inline-flex items-center gap-1">
                          <BusIcon className="h-3 w-3" /> {bus.nom ?? `Bus ${bus.numero}`}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      📞 {i.telephone} · {i.email ?? "—"} · 🎒 {i.bagages} bagage(s) · 💰 {i.montant} FCFA
                      {i.moyen_paiement ? ` · ${i.moyen_paiement}` : ""}
                    </div>
                  </div>
                  {i.statut === "en_attente" && (
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Réf. transaction Wave/OM"
                        className="w-56"
                        value={refs[i.id] ?? ""}
                        onChange={(e) => setRefs({ ...refs, [i.id]: e.target.value })}
                      />
                      <Button size="sm" onClick={() => validate(i)} disabled={!openBus} title={openBus ? "" : "Aucun bus ouvert"}>
                        <Check className="h-4 w-4 mr-1" /> Valider
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => refuse(i)}><X className="h-4 w-4" /></Button>
                    </div>
                  )}
                  {i.statut === "valide" && i.reference_transaction && (
                    <div className="text-xs text-muted-foreground">Tx: {i.reference_transaction}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Pill({ label, value, tone }: { label: string; value: number | string; tone: "ok" | "warn" | "bad" }) {
  const cls =
    tone === "ok" ? "bg-emerald-500/10 text-emerald-700" :
    tone === "warn" ? "bg-amber-500/10 text-amber-700" :
    "bg-red-500/10 text-red-700";
  return <span className={`px-3 py-1 rounded-full ${cls}`}>{label} · {value}</span>;
}

function StatusBadge({ s }: { s: Inscription["statut"] }) {
  const map = {
    valide: ["bg-emerald-500/10 text-emerald-700", "Validé"],
    en_attente: ["bg-amber-500/10 text-amber-700", "En attente"],
    refuse: ["bg-red-500/10 text-red-700", "Refusé"],
  } as const;
  const [cls, lbl] = map[s];
  return <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${cls}`}>{lbl}</span>;
}
