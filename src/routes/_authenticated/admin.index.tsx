import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const [stats, setStats] = useState({ caravanes: 0, pending: 0, events: 0 });

  useEffect(() => {
    (async () => {
      const [c, p, e] = await Promise.all([
        supabase.from("caravanes").select("id", { count: "exact", head: true }).eq("status", "ouverte"),
        supabase.from("inscriptions").select("id", { count: "exact", head: true }).eq("statut", "en_attente"),
        supabase.from("evenements").select("id", { count: "exact", head: true }),
      ]);
      setStats({ caravanes: c.count ?? 0, pending: p.count ?? 0, events: e.count ?? 0 });
    })();
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl text-primary">Tableau de bord</h1>
      <p className="text-sm text-muted-foreground mt-1">Vue d'ensemble de l'activité.</p>

      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        <Stat label="Caravanes ouvertes" value={stats.caravanes} to="/admin/caravanes" />
        <Stat label="Paiements en attente" value={stats.pending} to="/admin/caravanes" highlight />
        <Stat label="Événements archivés" value={stats.events} to="/admin/evenements" />
      </div>
    </div>
  );
}

function Stat({ label, value, to, highlight }: { label: string; value: number; to: string; highlight?: boolean }) {
  return (
    <Link
      to={to}
      className={`rounded-xl border p-5 transition-colors ${highlight ? "border-gold/50 bg-gold/5" : "border-border bg-card"} hover:border-primary`}
    >
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-2 font-display text-4xl text-primary">{value}</div>
    </Link>
  );
}
