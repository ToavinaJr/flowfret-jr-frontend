import { Checkbox } from "@/components/ui/checkbox";
import type { AuthMode } from "@/types/auth";
import { PasswordField } from "@/components/auth/PasswordField";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  return (
    <>
      {mode === "register" && (
        <div>
          <label className="text-xs text-muted-foreground" htmlFor="username">
            {t("auth.fields.username")}
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
          {t("auth.fields.email")}
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
        label={t("auth.fields.password")}
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
            {t("auth.forgotPassword")}
          </button>
        </div>
      )}

      {mode === "register" && (
        <>
          <PasswordField
            id="confirm-password"
            label={t("auth.fields.confirmPassword")}
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
              {t("auth.acceptTermsPrefix")}{" "}
              <button
                type="button"
                onClick={onOpenTerms}
                className="text-foreground underline underline-offset-2 hover:text-primary"
              >
                {t("auth.termsLink")}
              </button>
            </label>
          </div>
        </>
      )}
    </>
  );
}
