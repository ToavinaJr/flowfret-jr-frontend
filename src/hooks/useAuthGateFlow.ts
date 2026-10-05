import { useEffect, useRef, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "./useAuth";
import { useAuthForm } from "./useAuthForm";
import {
  getGoogleClientId,
  prepareGoogleIdentity,
  requestGoogleAccessToken,
} from "@/services/googleAuth";
import { ApiClientError } from "@/types/api";
import type { AuthMode } from "@/types/auth";
import {
  assertPasswords,
  googleError,
  LocalAuthError,
  submitError,
} from "./auth-flow-errors";

export function useAuthGateFlow() {
  const { t } = useTranslation();
  const auth = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const form = useAuthForm();
  const { setMode } = form;
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [passwordResetToken, setPasswordResetToken] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [googleReady, setGoogleReady] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const actionInFlight = useRef(false);

  useEffect(() => {
    if (!getGoogleClientId()) return;
    let active = true;
    setGoogleLoading(true);
    void prepareGoogleIdentity()
      .then(() => {
        if (active) setGoogleReady(true);
      })
      .catch((cause: unknown) => {
        if (active) setError(googleError(cause, t));
      })
      .finally(() => {
        if (active) setGoogleLoading(false);
      });
    return () => {
      active = false;
    };
  }, [t]);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) return;
    if (window.location.pathname === "/reset-password") {
      setPasswordResetToken(token);
      setMode("reset");
    } else if (
      window.location.pathname === "/verify-email" ||
      searchParams.has("token")
    ) {
      setVerificationToken(token);
      setMode("verify");
    }
  }, [searchParams, setMode]);

  function switchMode(next: AuthMode) {
  setMode(next);
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
    if (!googleReady) {
      setError(t("auth.errors.googleLoading"));
      return;
    }
    actionInFlight.current = true;
    form.setPendingAction("google");
    setError(null);
    try {
      const accessToken = await requestGoogleAccessToken();
      await auth.registerWithGoogle(accessToken);
      toast.success(t("auth.toasts.googleConnected"));
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
    await auth.register({
      email: state.email,
      password: state.password,
      username: state.username,
    });
    toast.success(t("auth.toasts.accountCreated"));
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
    googleReady: googleReady || !getGoogleClientId(),
    googleLoading,
    switchMode,
    handleGoogleClick,
    handleSubmit,
    handleResendOtp,
  };
}
