import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { changeAccountPassword, deleteAccount } from "@/services/accountApi";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

export function AccountSecurity() {
  const { t } = useTranslation();
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
      toast.success(t("account.security.passwordChanged"));
      await logout();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("account.security.changeFailed"));
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
      toast.success(t("account.security.accountDeleted"));
      await logout();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("account.security.deleteFailed"));
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={changePassword} className="space-y-3 rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold">{t("account.security.changePassword")}</h2>
        <PasswordInput id="current-password" label={t("account.security.currentPassword")} value={currentPassword} onChange={setCurrentPassword} />
        <PasswordInput id="new-account-password" label={t("account.security.newPassword")} value={newPassword} onChange={setNewPassword} minLength={8} />
        <button
          type="submit"
          disabled={pending !== null || !currentPassword || newPassword.length < 8}
          className="min-h-11 rounded-md bg-primary px-4 text-sm text-primary-foreground disabled:opacity-50"
        >
          {t("account.security.saveAndLogout")}
        </button>
      </form>
      <form onSubmit={removeAccount} className="space-y-3 rounded-xl border border-destructive/40 bg-card p-4">
        <h2 className="font-semibold text-destructive">{t("account.security.deleteAccount")}</h2>
        <p className="text-xs text-muted-foreground">
          {t("account.security.deleteDescription")}
        </p>
        <input
          id="delete-account-confirmation"
          name="confirmation"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          placeholder="DELETE"
          aria-label={t("account.security.deleteConfirmation")}
          className="min-h-11 w-full rounded-md border border-border bg-secondary px-3 text-sm"
        />
        <button
          type="submit"
          disabled={pending !== null || confirmation !== "DELETE"}
          className="min-h-11 rounded-md bg-destructive px-4 text-sm text-destructive-foreground disabled:opacity-50"
        >
          {t("account.security.deletePermanently")}
        </button>
      </form>
    </div>
  );
}

function PasswordInput({
  id,
  label,
  value,
  onChange,
  minLength = 1,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  minLength?: number;
}) {
  return (
    <label htmlFor={id} className="block text-sm">
      <span className="mb-1 block text-muted-foreground">{label}</span>
      <input
        id={id}
        name={id}
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
