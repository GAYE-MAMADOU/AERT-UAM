import { Link, Outlet, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LogOut, LayoutDashboard, Bus, Images, Users, ScanLine, Menu } from "lucide-react";

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
  const [navOpen, setNavOpen] = useState(false);

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

  const NavLinks = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1">
      {links.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          activeOptions={{ exact: l.exact }}
          onClick={onNavigate}
          className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-foreground/80 hover:bg-primary/5 hover:text-primary"
          activeProps={{ className: "bg-primary/10 text-primary font-medium" }}
        >
          <l.icon className="h-4 w-4 shrink-0" />
          {l.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-[calc(100vh-5rem)] md:grid md:grid-cols-[240px_1fr]">
      {/* Barre mobile : logo + menu hamburger, visible uniquement sous md */}
      <div className="flex md:hidden items-center justify-between border-b border-border bg-card/40 px-4 py-3 sticky top-0 z-30">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Espace bureau
          </div>
          <div className="font-display text-base text-primary leading-tight">AERT–UAM</div>
        </div>
        <Sheet open={navOpen} onOpenChange={setNavOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Ouvrir le menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-4 flex flex-col">
            <SheetHeader className="mb-4 text-left">
              <SheetTitle className="font-display text-primary">Espace bureau</SheetTitle>
            </SheetHeader>
            <NavLinks onNavigate={() => setNavOpen(false)} />
            <div className="mt-auto pt-4 border-t border-border text-xs text-muted-foreground">
              <div className="mb-2 truncate">{email}</div>
              <SheetClose asChild>
                <Button size="sm" variant="outline" className="w-full" onClick={signOut}>
                  <LogOut className="mr-2 h-3.5 w-3.5" /> Déconnexion
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Sidebar desktop */}
      <aside className="hidden md:block border-r border-border bg-card/40 p-4 md:min-h-full">
        <div className="mb-6">
          <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Espace bureau
          </div>
          <div className="font-display text-lg text-primary">AERT–UAM</div>
        </div>
        <NavLinks />
        <div className="mt-8 text-xs text-muted-foreground">
          <div className="mb-2 truncate">{email}</div>
          <Button size="sm" variant="outline" onClick={signOut}>
            <LogOut className="mr-2 h-3.5 w-3.5" /> Déconnexion
          </Button>
        </div>
      </aside>

      <section className="p-4 sm:p-6 md:p-10 min-w-0">
        <Outlet />
      </section>
    </div>
  );
}
