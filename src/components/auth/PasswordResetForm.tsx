import { Loader2 } from "lucide-react";
import { PasswordField } from "@/components/auth/PasswordField";

interface PasswordResetFormProps {
  mode: "forgot" | "reset";
  email: string;
  password: string;
  confirmPassword: string;
  pending: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
}

export function PasswordResetForm({
  mode,
  email,
  password,
  confirmPassword,
  pending,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
}: PasswordResetFormProps) {
  return (
    <>
      {mode === "forgot" ? (
        <div>
          <label className="text-xs text-muted-foreground" htmlFor="reset-email">
            E-mail
          </label>
          <input
            id="reset-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            className="auth-input"
          />
        </div>
      ) : (
        <>
          <PasswordField
            id="new-password"
            label="Nouveau mot de passe"
            value={password}
            autoComplete="new-password"
            onChange={onPasswordChange}
          />
          <PasswordField
            id="confirm-new-password"
            label="Confirmer le nouveau mot de passe"
            value={confirmPassword}
            autoComplete="new-password"
            onChange={onConfirmPasswordChange}
          />
        </>
      )}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-primary font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {mode === "forgot" ? "Envoyer le lien" : "Modifier le mot de passe"}
      </button>
    </>
  );
}
