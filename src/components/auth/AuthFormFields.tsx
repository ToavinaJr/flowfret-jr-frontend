import { Checkbox } from "@/components/ui/checkbox";
import type { AuthMode } from "@/types/auth";
import { PasswordField } from "@/components/auth/PasswordField";

interface AuthFormFieldsProps {
  mode: AuthMode;
  email: string;
  password: string;
  confirmPassword: string;
  username: string;
  acceptedTerms: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onUsernameChange: (value: string) => void;
  onTermsChange: (value: boolean) => void;
  onForgotPassword: () => void;
  onOpenTerms: () => void;
}

export function AuthFormFields({
  mode,
  email,
  password,
  confirmPassword,
  username,
  acceptedTerms,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onUsernameChange,
  onTermsChange,
  onForgotPassword,
  onOpenTerms,
}: AuthFormFieldsProps) {
  return (
    <>
      {mode === "register" && (
        <div>
          <label className="text-xs text-muted-foreground" htmlFor="username">
            Nom d’utilisateur
          </label>
          <input
            id="username"
            type="text"
            required
            autoComplete="username"
            value={username}
            onChange={(event) => onUsernameChange(event.target.value)}
            className="auth-input"
          />
        </div>
      )}

      <div>
        <label className="text-xs text-muted-foreground" htmlFor="email">
          E-mail
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          className="auth-input"
        />
      </div>

      <PasswordField
        id="password"
        label="Mot de passe"
        value={password}
        autoComplete={mode === "login" ? "current-password" : "new-password"}
        onChange={onPasswordChange}
      />

      {mode === "login" && (
        <div className="-mt-2 flex justify-end">
          <button
            type="button"
            onClick={onForgotPassword}
            className="min-h-[36px] text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            Mot de passe oublié ?
          </button>
        </div>
      )}

      {mode === "register" && (
        <>
          <PasswordField
            id="confirm-password"
            label="Confirmer le mot de passe"
            value={confirmPassword}
            autoComplete="new-password"
            onChange={onConfirmPasswordChange}
          />

          <div className="flex items-start gap-3 pt-1">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) => onTermsChange(checked === true)}
              className="mt-0.5 h-5 w-5"
              aria-describedby="terms-label"
            />
            <label
              id="terms-label"
              htmlFor="terms"
              className="text-sm leading-relaxed text-muted-foreground"
            >
              J’accepte les{" "}
              <button
                type="button"
                onClick={onOpenTerms}
                className="text-foreground underline underline-offset-2 hover:text-primary"
              >
                Conditions Générales d’Utilisation
              </button>
            </label>
          </div>
        </>
      )}
    </>
  );
}
