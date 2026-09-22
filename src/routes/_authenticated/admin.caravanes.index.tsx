import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Trash2, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/caravanes/")({
  component: AdminCaravanes,
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
  status: "ouverte" | "fermee" | "terminee";
};

function AdminCaravanes() {
  const [items, setItems] = useState<Caravane[]>([]);
  const [open, setOpen] = useState(false);

  async function load() {
    const { data, error } = await supabase
      .from("caravanes")
      .select("*")
      .order("date_depart", { ascending: false });
    if (error) toast.error(error.message);
    else setItems((data ?? []) as Caravane[]);
  }

  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Supprimer cette caravane et toutes ses inscriptions ?")) return;
    const { error } = await supabase.from("caravanes").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Supprimée"); load(); }
  }

  async function setStatus(id: string, status: Caravane["status"]) {
    const { error } = await supabase.from("caravanes").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-primary">Caravanes</h1>
          <p className="text-sm text-muted-foreground">Gestion des voyages organisés.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Nouvelle caravane</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Créer une caravane</DialogTitle></DialogHeader>
            <CaravaneForm onDone={() => { setOpen(false); load(); }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 grid gap-3">
        {items.length === 0 && (
          <div className="text-sm text-muted-foreground rounded-md border border-dashed border-border p-8 text-center">
            Aucune caravane. Crée la première.
          </div>
        )}
        {items.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground">{c.titre}</h3>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  c.status === "ouverte" ? "bg-emerald-500/10 text-emerald-700" :
                  c.status === "fermee" ? "bg-amber-500/10 text-amber-700" :
                  "bg-muted text-muted-foreground"
                }`}>{c.status}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {c.trajet} · {new Date(c.date_depart).toLocaleString("fr-FR")} · {c.prix} FCFA · {c.places_total} places
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={c.status} onValueChange={(v) => setStatus(c.id, v as Caravane["status"])}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ouverte">Ouverte</SelectItem>
                  <SelectItem value="fermee">Fermée</SelectItem>
                  <SelectItem value="terminee">Terminée</SelectItem>
                </SelectContent>
              </Select>
              <Link to="/admin/caravanes/$id" params={{ id: c.id }}>
                <Button variant="outline" size="sm"><ExternalLink className="h-4 w-4 mr-1" /> Inscrits</Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => remove(c.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type BusDraft = { nom: string; places: number };

function CaravaneForm({ onDone }: { onDone: () => void }) {
  const [titre, setTitre] = useState("");
  const [trajet, setTrajet] = useState("UAM → Thiès");
  const [dateDepart, setDateDepart] = useState("");
  const [lieuDepart, setLieuDepart] = useState("UAM Diamniadio");
  const [prix, setPrix] = useState(2000);
  const [wave, setWave] = useState("");
  const [om, setOm] = useState("");
  const [desc, setDesc] = useState("");
  const [buses, setBuses] = useState<BusDraft[]>([{ nom: "Car 1", places: 50 }]);
  const [loading, setLoading] = useState(false);

  const totalPlaces = buses.reduce((s, b) => s + (Number(b.places) || 0), 0);

  function addBus() {
    setBuses((b) => [...b, { nom: `Car ${b.length + 1}`, places: 50 }]);
  }
  function removeBus(i: number) {
    setBuses((b) => b.filter((_, idx) => idx !== i));
  }
  function updateBus(i: number, patch: Partial<BusDraft>) {
    setBuses((b) => b.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (buses.length === 0) { toast.error("Ajoute au moins un car"); return; }
    if (buses.some((b) => !b.nom.trim() || b.places <= 0)) {
      toast.error("Chaque car doit avoir un nom et des places > 0"); return;
    }
    setLoading(true);
    const { data, error } = await supabase.from("caravanes").insert({
      titre, trajet, date_depart: new Date(dateDepart).toISOString(),
      lieu_depart: lieuDepart, prix, places_total: totalPlaces,
      numero_wave: wave || null, numero_om: om || null, description: desc || null,
    }).select("id").single();
    if (error || !data) { setLoading(false); toast.error(error?.message ?? "Erreur"); return; }

    const rows = buses.map((b, i) => ({
      caravane_id: data.id,
      numero: i + 1,
      nom: b.nom.trim(),
      places_total: Number(b.places),
      status: (i === 0 ? "ouvert" : "ferme") as "ouvert" | "ferme",
    }));
    const { error: bErr } = await supabase.from("bus").insert(rows);
    setLoading(false);
    if (bErr) { toast.error("Caravane créée mais cars en erreur: " + bErr.message); onDone(); return; }
    toast.success("Caravane créée avec " + buses.length + " car(s)");
    onDone();
  }

  return (
    <form onSubmit={submit} className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
      <div><Label>Titre</Label><Input required value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Caravane Tabaski 2026" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Trajet</Label><Input required value={trajet} onChange={(e) => setTrajet(e.target.value)} /></div>
        <div><Label>Date et heure</Label><Input required type="datetime-local" value={dateDepart} onChange={(e) => setDateDepart(e.target.value)} /></div>
      </div>
      <div><Label>Lieu de départ</Label><Input required value={lieuDepart} onChange={(e) => setLieuDepart(e.target.value)} /></div>
      <div><Label>Prix (FCFA)</Label><Input required type="number" value={prix} onChange={(e) => setPrix(+e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Numéro Wave</Label><Input value={wave} onChange={(e) => setWave(e.target.value)} placeholder="77 000 00 00" /></div>
        <div><Label>Numéro Orange Money</Label><Input value={om} onChange={(e) => setOm(e.target.value)} placeholder="78 000 00 00" /></div>
      </div>
      <div><Label>Description</Label><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={3} /></div>

      <div className="rounded-lg border border-border p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm">Cars de la caravane</Label>
            <p className="text-xs text-muted-foreground">Total: {totalPlaces} places · Le premier car est ouvert, les suivants ouvrent quand le précédent est plein.</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addBus}>
            <Plus className="h-4 w-4 mr-1" /> Ajouter
          </Button>
        </div>
        {buses.map((b, i) => (
          <div key={i} className="flex items-end gap-2">
            <div className="flex-1">
              <Label className="text-xs">Nom</Label>
              <Input value={b.nom} onChange={(e) => updateBus(i, { nom: e.target.value })} />
            </div>
            <div className="w-28">
              <Label className="text-xs">Places</Label>
              <Input type="number" min={1} value={b.places} onChange={(e) => updateBus(i, { places: +e.target.value })} />
            </div>
            <Button type="button" variant="ghost" size="sm" onClick={() => removeBus(i)} disabled={buses.length === 1}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button type="submit" disabled={loading} className="w-full">{loading ? "..." : "Créer"}</Button>
    </form>
  );
}
