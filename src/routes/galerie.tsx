import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/galerie")({
  head: () => ({
    meta: [
      { title: "Galerie · AERT–UAM" },
      { name: "description", content: "Archives photos et vidéos des événements de l'AERT–UAM." },
      { property: "og:title", content: "Galerie AERT–UAM" },
      { property: "og:description", content: "Revivez les moments forts de l'amicale en images." },
    ],
  }),
  component: Galerie,
});

type EvenementWithMedias = {
  id: string; titre: string; date_evenement: string; description: string | null;
  medias: { id: string; url: string; type: string }[];
};

function Galerie() {
  const [items, setItems] = useState<EvenementWithMedias[]>([]);

  useEffect(() => {
    supabase
      .from("evenements")
      .select("id, titre, date_evenement, description, medias(id, url, type)")
      .order("date_evenement", { ascending: false })
      .then(({ data }) => setItems((data ?? []) as EvenementWithMedias[]));
  }, []);

  return (
    <div className="container-prose py-16">
      <header className="max-w-2xl">
        <div className="text-xs uppercase tracking-[0.2em] text-gold">Archives</div>
        <h1 className="font-display text-4xl md:text-5xl text-primary mt-2">Galerie de l'amicale</h1>
        <p className="text-muted-foreground mt-3">
          Caravanes, intégrations, dons et événements solidaires : revivez les moments forts.
        </p>
      </header>

      <div className="mt-12 space-y-14">
        {items.map((e) => (
          <section key={e.id}>
            <div className="flex items-baseline justify-between border-b border-border pb-3 mb-5">
              <h2 className="font-display text-2xl text-primary">{e.titre}</h2>
              <span className="text-xs text-muted-foreground">
                {new Date(e.date_evenement).toLocaleDateString("fr-FR", { dateStyle: "long" })}
              </span>
            </div>
            {e.description && <p className="text-sm text-muted-foreground mb-4">{e.description}</p>}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {e.medias.map((m) => (
                <a
                  key={m.id}
                  href={m.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block aspect-square rounded-lg overflow-hidden border border-border bg-muted hover:opacity-90 transition"
                >
                  {m.type === "video" ? (
                    <video src={m.url} className="w-full h-full object-cover" />
                  ) : (
                    <img src={m.url} alt="" loading="lazy" className="w-full h-full object-cover" />
                  )}
                </a>
              ))}
              {e.medias.length === 0 && (
                <div className="col-span-full text-xs text-muted-foreground italic">Aucun média.</div>
              )}
            </div>
          </section>
        ))}
        {items.length === 0 && (
          <div className="text-sm text-muted-foreground rounded-md border border-dashed border-border p-10 text-center">
            Les archives seront bientôt en ligne.
          </div>
        )}
      </div>
    </div>
  );
}
