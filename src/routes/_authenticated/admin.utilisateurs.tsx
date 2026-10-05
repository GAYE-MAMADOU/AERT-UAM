import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  listUsersWithRoles,
  assignRole,
  revokeRole,
  createBureauUser,
  deleteUser,
} from "@/lib/admin-users.functions";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  Shield,
  ShieldCheck,
  UserMinus,
  UserPlus,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

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
  const doCreate = useServerFn(createBureauUser);
  const doDelete = useServerFn(deleteUser);

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

  async function removeUser(u: Row) {
    try {
      await doDelete({ data: { userId: u.id } });
      toast.success("Utilisateur supprimé");
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
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-primary">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground">
            Créer des comptes bureau et gérer les rôles d'accès à l'espace de gestion.
          </p>
        </div>
        <CreateUserDialog onCreated={load} doCreate={doCreate} />
      </div>

      <Input
        placeholder="Rechercher par email…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="mt-4 w-full sm:max-w-xs"
      />

      <div className="mt-6 rounded-xl border border-border bg-card overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
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
                      <div className="flex justify-end gap-2 flex-wrap">
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
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
                              <AlertDialogDescription>
                                <span className="font-medium text-foreground">{u.email}</span>{" "}
                                perdra définitivement l'accès à l'espace bureau. Cette action est
                                irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => removeUser(u)}
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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

function CreateUserDialog({
  onCreated,
  doCreate,
}: {
  onCreated: () => void;
  doCreate: ReturnType<typeof useServerFn<typeof createBureauUser>>;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"bureau" | "admin">("bureau");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await doCreate({ data: { email, password, role } });
      toast.success("Utilisateur créé");
      setOpen(false);
      setEmail("");
      setPassword("");
      setRole("bureau");
      onCreated();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <UserPlus className="mr-2 h-4 w-4" /> Nouvel utilisateur
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Créer un compte bureau</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="new-email">Email</Label>
            <Input
              id="new-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="new-password">Mot de passe</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-0 top-0 h-full px-3 text-muted-foreground hover:text-foreground"
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Au moins 8 caractères.</p>
          </div>
          <div>
            <Label htmlFor="new-role">Rôle</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "bureau" | "admin")}>
              <SelectTrigger id="new-role"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bureau">Bureau</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer le compte"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
