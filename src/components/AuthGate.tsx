import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Guitar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AuthHeader } from "@/components/auth/AuthHeader";
import { AuthFormFields } from "@/components/auth/AuthFormFields";
import { AuthHighlights } from "@/components/auth/AuthHighlights";
import { AuthModeSwitcher } from "@/components/auth/AuthModeSwitcher";
import { OtpForm } from "@/components/auth/OtpForm";
import { useAuth } from "@/hooks/useAuth";
import { useAuthForm } from "@/hooks/useAuthForm";
import {
  getGoogleClientId,
  requestGoogleAccessToken,
} from "@/services/googleAuth";
import { ApiClientError } from "@/types/api";
import type { AuthMode } from "@/types/auth";

interface AuthGateProps {
  children: ReactNode;
}

function GoogleLogo({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function AuthGate({ children }: AuthGateProps) {
  const {
    status,
    login,
    loginWithGoogle,
    register,
    verifyEmail,
    resendVerification,
  } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    mode,
    setMode,
    pendingAction,
    setPendingAction,
    formState,
    setField,
    resetForm,
  } = useAuthForm();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [verificationToken, setVerificationToken] = useState("");
  const [pendingEmail, setPendingEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const googleConfigured = getGoogleClientId().length > 0;

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    const isVerifyPath = window.location.pathname === "/verify-email";
    if (tokenFromUrl && (isVerifyPath || searchParams.has("token"))) {
      setVerificationToken(tokenFromUrl);
      setMode("verify");
    }
  }, [searchParams, setMode]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (status === "authenticated") {
    return <>{children}</>;
  }

  function switchMode(next: AuthMode) {
    setMode(next);
    setError(null);
    setAcceptedTerms(false);
    resetForm();
    if (next !== "verify") {
      setVerificationToken("");
      setPendingEmail("");
      if (searchParams.has("token")) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("token");
        setSearchParams(nextParams, { replace: true });
      }
    }
  }

  async function handleGoogleClick() {
    if (pendingAction) {
      return;
    }

    if (!googleConfigured) {
      setError("Connexion Google non configurée. Ajoutez VITE_GOOGLE_CLIENT_ID.");
      return;
    }

    setPendingAction("google");
    setError(null);
    try {
      const accessToken = await requestGoogleAccessToken();
      await loginWithGoogle(accessToken);
      toast.success("Connecté avec Google");
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else if (err instanceof Error) {
        const cancelled = /popup_closed|user.*cancel|access_denied|timed.?out/i.test(err.message);
        setError(
          cancelled
            ? "Connexion Google annulée."
            : "Impossible de se connecter avec Google. Réessayez.",
        );
      } else {
        setError("Impossible de se connecter avec Google. Réessayez.");
      }
    } finally {
      setPendingAction(null);
    }
  }

  function handleForgotPassword() {
    toast.message("Réinitialisation bientôt disponible.", {
      description: "Contactez le support si vous avez besoin de récupérer l’accès.",
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pendingAction) {
      return;
    }

    setPendingAction("submit");
    setError(null);

    try {
      if (mode === "login") {
        await login({ email: formState.email, password: formState.password });
        return;
      }

      if (mode === "verify") {
        if (!verificationToken) {
          setError("Lien de vérification manquant.");
          return;
        }
        if (!/^\d{6}$/.test(formState.otp)) {
          setError("Saisissez le code OTP à 6 chiffres.");
          return;
        }
        await verifyEmail({ token: verificationToken, code: formState.otp });
        toast.success("Compte vérifié. Bienvenue !");
        return;
      }

      if (formState.password !== formState.confirmPassword) {
        setError("Les mots de passe ne correspondent pas.");
        return;
      }

      if (!acceptedTerms) {
        setError("Veuillez accepter les conditions pour créer un compte.");
        return;
      }

      if (formState.password.length < 8) {
        setError("Le mot de passe doit contenir au moins 8 caractères.");
        return;
      }

      const pending = await register({
        email: formState.email,
        password: formState.password,
        username: formState.username,
      });
      setPendingEmail(pending.email);
      setVerificationToken(pending.verificationToken);
      setMode("verify");
      toast.success("Code OTP envoyé", {
        description: pending.message,
      });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError(
          mode === "login"
            ? "Impossible de se connecter. Vérifiez vos identifiants."
            : mode === "verify"
              ? "Impossible de vérifier le code. Réessayez."
              : "Impossible de créer le compte. Réessayez plus tard.",
        );
      }
    } finally {
      setPendingAction(null);
    }
  }

  async function handleResendOtp() {
    if (pendingAction) {
      return;
    }

    if (!verificationToken) {
      setError("Lien de vérification manquant.");
      return;
    }

    setPendingAction("resend");
    setError(null);
    try {
      const pending = await resendVerification(verificationToken);
      setVerificationToken(pending.verificationToken);
      setPendingEmail(pending.email);
      toast.success("Nouveau code envoyé", {
        description: pending.message,
      });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Impossible de renvoyer le code. Réessayez.");
      }
    } finally {
      setPendingAction(null);
    }
  }

  const title =
    mode === "login"
      ? "Bon retour"
      : mode === "register"
        ? "Créer un compte"
        : "Vérifier votre e-mail";

  const subtitle =
    mode === "login"
      ? "Connectez-vous pour continuer à pratiquer et partager."
      : mode === "register"
        ? "Rejoignez FretFlow et débloquez votre workflow guitare."
        : `Saisissez le code à 6 chiffres envoyé à ${pendingEmail || "votre e-mail"}.`;

  return (
    <div className="grid min-h-screen w-full overflow-x-hidden bg-background lg:grid-cols-2">
      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10 xl:px-16">
        <div className="w-full max-w-md">
          <AuthHeader title={title} subtitle={subtitle} />

          {mode !== "verify" && (
            <AuthModeSwitcher mode={mode} onSwitchMode={switchMode} />
          )}

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-4"
            >
              {mode === "verify" ? (
                <>
                  <OtpForm
                    otp={formState.otp}
                    onOtpChange={(value) => setField("otp", value)}
                    loading={pendingAction === "submit"}
                    onSubmit={() => {
                      const syntheticEvent = {
                        preventDefault: () => undefined,
                      } as FormEvent<HTMLFormElement>;
                      void handleSubmit(syntheticEvent);
                    }}
                    onResend={handleResendOtp}
                    resendPending={pendingAction === "resend"}
                  />
                  {error && (
                    <p className="text-sm text-destructive" role="alert">
                      {error}
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="w-full min-h-[44px] text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Retour à la connexion
                  </button>
                </>
              ) : (
                <>
                  <AuthFormFields
                    mode={mode}
                    email={formState.email}
                    password={formState.password}
                    confirmPassword={formState.confirmPassword}
                    username={formState.username}
                    acceptedTerms={acceptedTerms}
                    onEmailChange={(value) => setField("email", value)}
                    onPasswordChange={(value) => setField("password", value)}
                    onConfirmPasswordChange={(value) => setField("confirmPassword", value)}
                    onUsernameChange={(value) => setField("username", value)}
                    onTermsChange={setAcceptedTerms}
                    onForgotPassword={handleForgotPassword}
                    onOpenTerms={() =>
                      toast.message("Conditions d’utilisation", {
                        description: "Les conditions complètes seront bientôt disponibles.",
                      })
                    }
                  />

                  {error && (
                    <p className="text-sm text-destructive" role="alert">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={pendingAction !== null}
                    className="inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-md bg-primary font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {pendingAction === "submit" && <Loader2 className="h-4 w-4 animate-spin" />}
                    {mode === "login" ? "Se connecter" : "Créer mon compte"}
                  </button>

                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-wider">
                      <span className="bg-background px-3 text-muted-foreground">ou</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={pendingAction !== null}
                    onClick={handleGoogleClick}
                    className="inline-flex w-full min-h-[44px] items-center justify-center gap-3 rounded-md border border-border bg-card text-sm text-foreground transition-colors hover:bg-surface-hover disabled:opacity-50"
                  >
                    {pendingAction === "google" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <GoogleLogo className="h-5 w-5" />
                    )}
                    {mode === "login" ? "Continuer avec Google" : "S’inscrire avec Google"}
                  </button>
                </>
              )}
            </motion.form>
          </AnimatePresence>
        </div>
      </section>

      <aside className="relative hidden overflow-hidden border-l border-border lg:flex lg:flex-col lg:justify-between">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 70% 20%, hsla(346, 77%, 49%, 0.28), transparent 55%), radial-gradient(ellipse 70% 50% at 20% 80%, hsla(173, 58%, 39%, 0.16), transparent 50%), hsl(240 10% 6%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(0 0% 100% / 0.08) 1px, transparent 1px), linear-gradient(to bottom, hsl(0 0% 100% / 0.08) 1px, transparent 1px)",
            backgroundSize: "48px 28px",
          }}
        />

        <div className="relative z-10 flex flex-1 flex-col justify-center px-10 py-12 xl:px-16">
          <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 ring-1 ring-primary/40">
            <Guitar className="h-8 w-8 text-primary" />
          </div>
          <h2 className="max-w-md text-3xl font-medium tracking-tight text-foreground xl:text-4xl">
            Libérez le potentiel de votre guitare
          </h2>
          <p className="mt-4 max-w-md text-base text-muted-foreground">
            Analysez, pratiquez et partagez — un workbench pensé pour les guitaristes.
          </p>
          <AuthHighlights />
        </div>

        <div className="relative z-10 px-10 pb-10 text-xs text-muted-foreground xl:px-16">
          FretFlow — Analyser. Pratiquer. Partager.
        </div>
      </aside>
    </div>
  );
}
