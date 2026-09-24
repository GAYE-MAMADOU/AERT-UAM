import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard, Bus, Images, Users, ScanLine } from "lucide-react";

const baseLinks = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, exact: true, adminOnly: false },
  { to: "/admin/caravanes", label: "Caravanes", icon: Bus, exact: false, adminOnly: false },
  { to: "/admin/scan", label: "Contrôle d'embarquement", icon: ScanLine, exact: true, adminOnly: false },
  { to: "/admin/evenements", label: "Archives", icon: Images, exact: false, adminOnly: false },
  { to: "/admin/utilisateurs", label: "Utilisateurs", icon: Users, exact: false, adminOnly: true },
] as const;

export function AdminShell() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string | null>(null);
  const [isStaff, setIsStaff] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setEmail(data.user?.email ?? null);
      if (!data.user) return;
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      const list = roles ?? [];
      setIsStaff(list.some((r) => r.role === "admin" || r.role === "bureau"));
      setIsAdmin(list.some((r) => r.role === "admin"));
    })();
  }, []);

  const links = baseLinks.filter((l) => !l.adminOnly || isAdmin);

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (isStaff === false) {
    return (
      <div className="container-prose py-16 max-w-xl">
        <h1 className="font-display text-3xl text-primary mb-3">Accès en attente</h1>
        <p className="text-muted-foreground mb-2">
          Connecté en tant que <span className="font-medium text-foreground">{email}</span>.
        </p>
        <p className="text-muted-foreground mb-6">
          Ton compte n'a pas encore le rôle <code>bureau</code>. Un administrateur doit te
          l'attribuer pour accéder à l'espace de gestion.
        </p>
        <Button variant="outline" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5rem)] grid md:grid-cols-[240px_1fr]">
      <aside className="border-r border-border bg-card/40 p-4 md:min-h-full">
        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Espace bureau</div>
          <div className="font-display text-lg text-primary">AERT–UAM</div>
        </div>
        <nav className="flex md:flex-col gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.exact }}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-primary/5 hover:text-primary"
              activeProps={{ className: "bg-primary/10 text-primary font-medium" }}
            >
              <l.icon className="h-4 w-4" />
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-8 hidden md:block text-xs text-muted-foreground">
          <div className="mb-2 truncate">{email}</div>
          <Button size="sm" variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-3.5 w-3.5" /> Déconnexion
          </Button>
        </div>
      </aside>
      <section className="p-6 md:p-10">
        <Outlet />
      </section>
    </div>
  );
}
