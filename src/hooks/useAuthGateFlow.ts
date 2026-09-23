import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "./useAuth";
import { useAuthForm } from "./useAuthForm";
import {
  getGoogleClientId,
  requestGoogleAccessToken,
} from "@/services/googleAuth";
import { ApiClientError } from "@/types/api";
import type { AuthMode } from "@/types/auth";

export function useAuthGateFlow() {
  const { t } = useTranslation();
  const auth = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const form = useAuthForm();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [passwordResetToken, setPasswordResetToken] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const actionInFlight = useRef(false);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;
    if (window.location.pathname === "/reset-password") {
      setPasswordResetToken(token);
      form.setMode("reset");
    } else if (
      window.location.pathname === "/verify-email" ||
      searchParams.has("token")
    ) {
      setVerificationToken(token);
      form.setMode("verify");
    }
  }, [searchParams, form.setMode]);

  function switchMode(next: AuthMode) {
    form.setMode(next);
    setError(null);
    setAcceptedTerms(false);
    form.resetForm();
    if (next !== "verify") {
      setVerificationToken("");
      setPendingEmail("");
      if (searchParams.has("token")) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("token");
        setSearchParams(nextParams, { replace: true });
      }
    }
    if (next !== "reset") setPasswordResetToken("");
  }

  async function handleGoogleClick() {
    if (actionInFlight.current) return;
    if (form.mode === "register" && !acceptedTerms) {
      setError(t("auth.errors.acceptTermsBeforeRegister"));
      return;
    }
    if (!getGoogleClientId()) {
      setError(t("auth.errors.googleNotConfigured"));
      return;
    }
    actionInFlight.current = true;
    form.setPendingAction("google");
    setError(null);
    try {
      const accessToken = await requestGoogleAccessToken();
      if (form.mode === "login") {
        await auth.loginWithGoogle(accessToken);
        toast.success(t("auth.toasts.googleConnected"));
      } else {
        await auth.registerWithGoogle(accessToken);
        toast.success(t("auth.toasts.googleAccountCreated"));
      }
    } catch (cause) {
      setError(googleError(cause, t));
    } finally {
      actionInFlight.current = false;
      form.setPendingAction(null);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (actionInFlight.current) return;
    actionInFlight.current = true;
    form.setPendingAction("submit");
    setError(null);
    try {
      await submitCurrentMode();
    } catch (cause) {
      setError(submitError(cause, form.mode, t));
    } finally {
      actionInFlight.current = false;
      form.setPendingAction(null);
    }
  }

  async function submitCurrentMode() {
    const state = form.formState;
    if (form.mode === "forgot") {
      await auth.requestPasswordReset(state.email);
      toast.success(t("auth.toasts.resetRequestSent"), {
        description: t("auth.toasts.resetRequestDescription"),
      });
      switchMode("login");
      return;
    }
    if (form.mode === "reset") {
      if (!passwordResetToken)
        throw new LocalAuthError(t("auth.errors.resetLinkMissing"));
      assertPasswords(state.password, state.confirmPassword, t);
      await auth.resetPassword(passwordResetToken, state.password);
      toast.success(t("auth.toasts.passwordChanged"), {
        description: t("auth.toasts.passwordChangedDescription"),
      });
      switchMode("login");
      return;
    }
    if (form.mode === "login") {
      await auth.login({ email: state.email, password: state.password });
      return;
    }
    if (form.mode === "verify") {
      if (!verificationToken)
        throw new LocalAuthError(t("auth.errors.verificationLinkMissing"));
      if (!/^\d{4}$/.test(state.otp))
        throw new LocalAuthError(t("auth.errors.otpInvalid"));
      await auth.verifyEmail({ token: verificationToken, code: state.otp });
      toast.success(t("auth.toasts.accountVerified"));
      return;
    }
    assertPasswords(state.password, state.confirmPassword, t);
    if (!acceptedTerms)
      throw new LocalAuthError(t("auth.errors.acceptTerms"));
    const pending = await auth.register({
      email: state.email,
      password: state.password,
      username: state.username,
    });
    setPendingEmail(pending.email);
    setVerificationToken(pending.verificationToken);
    form.setMode("verify");
    toast.success(t("auth.toasts.otpSent"), { description: pending.message });
  }

  async function handleResendOtp() {
    if (actionInFlight.current) return;
    if (!verificationToken) {
      setError(t("auth.errors.verificationLinkMissing"));
      return;
    }
    actionInFlight.current = true;
    form.setPendingAction("resend");
    setError(null);
    try {
      const pending = await auth.resendVerification(verificationToken);
      setVerificationToken(pending.verificationToken);
      setPendingEmail(pending.email);
      toast.success(t("auth.toasts.newOtpSent"), {
        description: pending.message,
      });
    } catch (cause) {
      setError(
        cause instanceof ApiClientError
          ? cause.message
          : t("auth.errors.resendOtpFailed"),
      );
    } finally {
      actionInFlight.current = false;
      form.setPendingAction(null);
    }
  }

  return {
    status: auth.status,
    ...form,
    acceptedTerms,
    setAcceptedTerms,
    pendingEmail,
    error,
    switchMode,
    handleGoogleClick,
    handleSubmit,
    handleResendOtp,
  };
}

type Translate = (key: string) => string;

class LocalAuthError extends Error {}

function assertPasswords(password: string, confirmation: string, t: Translate) {
  if (password.length < 8)
    throw new LocalAuthError(t("auth.errors.passwordTooShort"));
  if (password !== confirmation)
    throw new LocalAuthError(t("auth.errors.passwordMismatch"));
}

function googleError(cause: unknown, t: Translate): string {
  if (cause instanceof ApiClientError) return cause.message;
  if (cause instanceof Error) {
    return /popup_closed|user.*cancel|access_denied|timed.?out/i.test(
      cause.message,
    )
      ? t("auth.errors.googleCancelled")
      : t("auth.errors.googleLoginFailed");
  }
  return t("auth.errors.googleLoginFailed");
}

function submitError(cause: unknown, mode: AuthMode, t: Translate): string {
  if (cause instanceof ApiClientError || cause instanceof LocalAuthError)
    return cause.message;
  if (mode === "login") return t("auth.errors.loginFailed");
  if (mode === "verify") return t("auth.errors.verificationFailed");
  return t("auth.errors.registrationFailed");
}
