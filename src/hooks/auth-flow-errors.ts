import { ApiClientError } from "@/types/api";
import type { AuthMode } from "@/types/auth";

type Translate = (key: string) => string;

export class LocalAuthError extends Error {}

export function assertPasswords(
  password: string,
  confirmation: string,
  translate: Translate,
) {
  if (password.length < 8)
    throw new LocalAuthError(translate("auth.errors.passwordTooShort"));
  if (password !== confirmation)
    throw new LocalAuthError(translate("auth.errors.passwordMismatch"));
}

export function googleError(cause: unknown, translate: Translate): string {
  if (cause instanceof ApiClientError) return cause.message;
  if (cause instanceof Error) {
    if (/popup_failed_to_open|failed to open popup|popup.*blocked/i.test(cause.message))
      return translate("auth.errors.googlePopupBlocked");
    if (/Google Identity script failed|Google Identity Services unavailable/i.test(cause.message))
      return translate("auth.errors.googleLoadFailed");
    return /popup_closed|user.*cancel|access_denied|timed.?out/i.test(
      cause.message,
    )
      ? translate("auth.errors.googleCancelled")
      : translate("auth.errors.googleLoginFailed");
  }
  return translate("auth.errors.googleLoginFailed");
}

export function submitError(
  cause: unknown,
  mode: AuthMode,
  translate: Translate,
): string {
  if (cause instanceof ApiClientError || cause instanceof LocalAuthError)
    return cause.message;
  if (mode === "login") return translate("auth.errors.loginFailed");
  if (mode === "verify") return translate("auth.errors.verificationFailed");
  return translate("auth.errors.registrationFailed");
}
