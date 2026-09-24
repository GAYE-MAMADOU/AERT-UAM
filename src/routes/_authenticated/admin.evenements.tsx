import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Upload, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/evenements")({
  component: AdminEvenements,
});

const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

type Evenement = {
  id: string;
  titre: string;
  description: string | null;
  date_evenement: string;
  type: string | null;
};

type Media = { id: string; url: string; type: string; legende: string | null };

function AdminEvenements() {
  const [items, setItems] = useState<Evenement[]>([]);
  const [open, setOpen] = useState(false);
  const [medias, setMedias] = useState<Record<string, Media[]>>({});

  async function load() {
    const { data, error } = await supabase
      .from("evenements")
      .select("*")
      .order("date_evenement", { ascending: false });
    if (error) toast.error(error.message);
    else setItems((data ?? []) as Evenement[]);
  }
  useEffect(() => { load(); }, []);

  async function loadMedias(eventId: string) {
    const { data } = await supabase.from("medias").select("*").eq("evenement_id", eventId).order("created_at");
    setMedias((m) => ({ ...m, [eventId]: (data ?? []) as Media[] }));
  }

  async function removeEvent(id: string) {
    if (!confirm("Supprimer cet événement et ses médias ?")) return;
    const { error } = await supabase.from("evenements").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Supprimé"); load(); }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-primary">Archives</h1>
          <p className="text-sm text-muted-foreground">Événements et galerie photo/vidéo.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" /> Nouvel événement</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Créer un événement</DialogTitle></DialogHeader>
            <EventForm onDone={() => { setOpen(false); load(); }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8 grid gap-4">
        {items.map((e) => (
          <div key={e.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-foreground">{e.titre}</h3>
                <div className="text-xs text-muted-foreground">
                  {new Date(e.date_evenement).toLocaleDateString("fr-FR")} {e.type ? `· ${e.type}` : ""}
                </div>
                {e.description && <p className="text-sm mt-2 text-foreground/80">{e.description}</p>}
              </div>
              <Button variant="ghost" size="sm" onClick={() => removeEvent(e.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
            <MediaManager
              eventId={e.id}
              medias={medias[e.id]}
              onOpen={() => !medias[e.id] && loadMedias(e.id)}
              onChange={() => loadMedias(e.id)}
            />
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-sm text-muted-foreground rounded-md border border-dashed border-border p-8 text-center">
            Aucun événement. Crée le premier pour commencer à archiver.
          </div>
        )}
      </div>
    </div>
  );
}

function EventForm({ onDone }: { onDone: () => void }) {
  const [titre, setTitre] = useState("");
  const [desc, setDesc] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from("evenements").insert({
      titre, description: desc || null, date_evenement: date, type: type || null,
    });
    setLoading(false);
    if (error) toast.error(error.message);
    else { toast.success("Créé"); onDone(); }
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <div><Label>Titre</Label><Input required value={titre} onChange={(e) => setTitre(e.target.value)} /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><Label>Date</Label><Input required type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        <div><Label>Type</Label><Input value={type} onChange={(e) => setType(e.target.value)} placeholder="Intégration, Caravane…" /></div>
      </div>
      <div><Label>Description</Label><Textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
      <Button type="submit" disabled={loading} className="w-full">{loading ? "..." : "Créer"}</Button>
    </form>
  );
}

function MediaManager({ eventId, medias, onOpen, onChange }: {
  eventId: string;
  medias: Media[] | undefined;
  onOpen: () => void;
  onChange: () => void;
}) {
  const [shown, setShown] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  function toggle() {
    setShown((s) => { if (!s) onOpen(); return !s; });
  }

  async function upload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${eventId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("archives").upload(path, file, {
          contentType: file.type, upsert: false,
        });
        if (upErr) throw upErr;
        const { data: signed, error: sErr } = await supabase.storage.from("archives").createSignedUrl(path, TEN_YEARS);
        if (sErr) throw sErr;
        const type = file.type.startsWith("video/") ? "video" : "image";
        const { error: insErr } = await supabase.from("medias").insert({
          evenement_id: eventId, type, url: signed.signedUrl,
        });
        if (insErr) throw insErr;
      }
      toast.success("Médias ajoutés");
      onChange();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur d'upload");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function removeMedia(m: Media) {
    if (!confirm("Supprimer ce média ?")) return;
    const { error } = await supabase.from("medias").delete().eq("id", m.id);
    if (error) toast.error(error.message);
    else { toast.success("Supprimé"); onChange(); }
  }

  return (
    <div className="mt-4 border-t border-border pt-3">
      <div className="flex items-center justify-between">
        <button onClick={toggle} className="text-xs text-primary font-medium">
          {shown ? "Masquer les médias" : "Gérer les médias"}
        </button>
        {shown && (
          <div className="flex items-center gap-2">
            <input ref={fileRef} type="file" multiple accept="image/*,video/*" hidden onChange={(e) => upload(e.target.files)} />
            <Button size="sm" variant="outline" disabled={uploading} onClick={() => fileRef.current?.click()}>
              <Upload className="h-3.5 w-3.5 mr-1" /> {uploading ? "Upload..." : "Ajouter"}
            </Button>
          </div>
        )}
      </div>
      {shown && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(medias ?? []).map((m) => (
            <div key={m.id} className="relative group rounded-md overflow-hidden border border-border aspect-square bg-muted">
              {m.type === "video" ? (
                <video src={m.url} className="w-full h-full object-cover" />
              ) : (
                <img src={m.url} alt="" className="w-full h-full object-cover" />
              )}
              <button
                onClick={() => removeMedia(m)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded p-1.5 opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                aria-label="Supprimer"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {medias && medias.length === 0 && (
            <div className="col-span-full text-xs text-muted-foreground py-4 text-center">Aucun média.</div>
          )}
        </div>
      )}
    </div>
  );
}
