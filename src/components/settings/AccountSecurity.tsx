import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { changeAccountPassword, deleteAccount } from "@/services/accountApi";
import { useAuth } from "@/hooks/useAuth";

export function AccountSecurity() {
  const { logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState<"password" | "delete" | null>(null);

  async function changePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword.length < 8) return;
    setPending("password");
    try {
      await changeAccountPassword(currentPassword, newPassword);
      toast.success("Mot de passe modifié. Reconnectez-vous.");
      await logout();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Modification impossible");
    } finally {
      setPending(null);
    }
  }

  async function removeAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (confirmation !== "DELETE") return;
    setPending("delete");
    try {
      await deleteAccount(currentPassword, confirmation);
      toast.success("Compte supprimé");
      await logout();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Suppression impossible");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={changePassword} className="space-y-3 rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">Changer le mot de passe</h2>
        <PasswordInput label="Mot de passe actuel" value={currentPassword} onChange={setCurrentPassword} />
        <PasswordInput label="Nouveau mot de passe" value={newPassword} onChange={setNewPassword} minLength={8} />
        <button
          type="submit"
          disabled={pending !== null || !currentPassword || newPassword.length < 8}
          className="min-h-11 rounded-md bg-primary px-4 text-sm text-primary-foreground disabled:opacity-50"
        >
          Enregistrer et déconnecter les sessions
        </button>
      </form>
      <form onSubmit={removeAccount} className="space-y-3 rounded-xl border border-destructive/40 bg-card p-4">
        <h2 className="font-semibold text-destructive">Supprimer le compte</h2>
        <p className="text-xs text-muted-foreground">
          Cette action désactive immédiatement le compte et toutes ses sessions.
          Saisissez DELETE pour confirmer.
        </p>
        <input
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          placeholder="DELETE"
          aria-label="Confirmation de suppression"
          className="min-h-11 w-full rounded-md border border-border bg-secondary px-3 text-sm"
        />
        <button
          type="submit"
          disabled={pending !== null || confirmation !== "DELETE"}
          className="min-h-11 rounded-md bg-destructive px-4 text-sm text-destructive-foreground disabled:opacity-50"
        >
          Supprimer définitivement mon compte
        </button>
      </form>
    </div>
  );
}

function PasswordInput({
  label,
  value,
  onChange,
  minLength = 1,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minLength?: number;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-muted-foreground">{label}</span>
      <input
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        minLength={minLength}
        maxLength={72}
        autoComplete={minLength > 1 ? "new-password" : "current-password"}
        className="min-h-11 w-full rounded-md border border-border bg-secondary px-3"
      />
    </label>
  );
}
