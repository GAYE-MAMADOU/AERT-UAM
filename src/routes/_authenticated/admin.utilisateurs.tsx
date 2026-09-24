import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  listUsersWithRoles,
  assignRole,
  revokeRole,
} from "@/lib/admin-users.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Shield, ShieldCheck, UserMinus, UserPlus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/utilisateurs")({
  component: AdminUtilisateurs,
});

type Row = {
  id: string;
  email: string;
  created_at: string;
  roles: ("admin" | "bureau" | "member")[];
};

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  bureau: "Bureau",
  member: "Membre",
};

function AdminUtilisateurs() {
  const fetchUsers = useServerFn(listUsersWithRoles);
  const doAssign = useServerFn(assignRole);
  const doRevoke = useServerFn(revokeRole);

  const [users, setUsers] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  async function load() {
    setLoading(true);
    try {
      const data = await fetchUsers();
      setUsers(data as Row[]);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleRole(u: Row, role: "admin" | "bureau") {
    const has = u.roles.includes(role);
    try {
      if (has) {
        await doRevoke({ data: { userId: u.id, role } });
        toast.success(`Rôle ${ROLE_LABEL[role]} retiré`);
      } else {
        await doAssign({ data: { userId: u.id, role } });
        toast.success(`Rôle ${ROLE_LABEL[role]} attribué`);
      }
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  }

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(q.toLowerCase()),
  );

  if (error) {
    return (
      <div>
        <h1 className="font-display text-3xl text-primary">Utilisateurs</h1>
        <p className="mt-4 text-sm text-destructive">{error}</p>
        <p className="text-xs text-muted-foreground mt-2">
          Seuls les administrateurs peuvent accéder à cette page.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-primary">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground">
            Attribuer ou retirer les rôles d'accès à l'espace bureau.
          </p>
        </div>
        <Input
          placeholder="Rechercher par email…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full sm:max-w-xs"
        />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-muted/40 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Rôles</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  Chargement…
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((u) => {
                const isAdmin = u.roles.includes("admin");
                const isBureau = u.roles.includes("bureau");
                return (
                  <tr key={u.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{u.email}</div>
                      <div className="text-xs text-muted-foreground">
                        Inscrit le {new Date(u.created_at).toLocaleDateString("fr-FR")}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap">
                        {u.roles.length === 0 && (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                        {u.roles.map((r) => (
                          <span
                            key={r}
                            className={`text-[11px] px-2 py-0.5 rounded-full border ${
                              r === "admin"
                                ? "bg-gold/10 border-gold/40 text-foreground"
                                : "bg-primary/5 border-primary/30 text-primary"
                            }`}
                          >
                            {ROLE_LABEL[r]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant={isBureau ? "outline" : "secondary"}
                          onClick={() => toggleRole(u, "bureau")}
                        >
                          {isBureau ? (
                            <><UserMinus className="h-3.5 w-3.5 mr-1" /> Bureau</>
                          ) : (
                            <><UserPlus className="h-3.5 w-3.5 mr-1" /> Bureau</>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant={isAdmin ? "outline" : "default"}
                          onClick={() => toggleRole(u, "admin")}
                        >
                          {isAdmin ? (
                            <><Shield className="h-3.5 w-3.5 mr-1" /> Retirer admin</>
                          ) : (
                            <><ShieldCheck className="h-3.5 w-3.5 mr-1" /> Admin</>
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                  Aucun utilisateur.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
