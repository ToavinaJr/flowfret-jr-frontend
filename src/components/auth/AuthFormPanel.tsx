import { type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { useAuthGateFlow } from "@/hooks/useAuthGateFlow";
import { AuthFormFields } from "./AuthFormFields";
import { AuthHeader } from "./AuthHeader";
import { AuthModeSwitcher } from "./AuthModeSwitcher";
import { GoogleAuthButton } from "./GoogleAuthButton";
import { OtpForm } from "./OtpForm";
import { PasswordResetForm } from "./PasswordResetForm";

type AuthFlow = ReturnType<typeof useAuthGateFlow>;

export function AuthFormPanel({ flow }: { flow: AuthFlow }) {
  const { t } = useTranslation();
  const {
    mode,
    switchMode,
    formState,
    setField,
    pendingAction,
    googleReady,
    googleLoading,
    acceptedTerms,
    setAcceptedTerms,
    pendingEmail,
    error,
    handleSubmit,
    handleResendOtp,
    handleGoogleClick,
  } = flow;
  const auxiliaryMode = ["verify", "forgot", "reset"].includes(mode);

  return (
    <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10 xl:px-16">
      <div className="w-full max-w-md">
        <AuthHeader
          title={t(`auth.title.${mode}`)}
          subtitle={t(`auth.subtitle.${mode}`, {
            email: pendingEmail || t("auth.yourEmail"),
          })}
        />
        {!auxiliaryMode && (
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
              <OtpForm
                otp={formState.otp}
                onOtpChange={(value) => setField("otp", value)}
                loading={pendingAction === "submit"}
                onSubmit={() => {
                  const event = {
                    preventDefault: () => undefined,
                  } as FormEvent<HTMLFormElement>;
                  void handleSubmit(event);
                }}
                onResend={handleResendOtp}
                resendPending={pendingAction === "resend"}
              />
            ) : mode === "forgot" || mode === "reset" ? (
              <PasswordResetForm
                mode={mode}
                email={formState.email}
                password={formState.password}
                confirmPassword={formState.confirmPassword}
                pending={pendingAction === "submit"}
                onEmailChange={(value) => setField("email", value)}
                onPasswordChange={(value) => setField("password", value)}
                onConfirmPasswordChange={(value) =>
                  setField("confirmPassword", value)
                }
              />
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
                  onConfirmPasswordChange={(value) =>
                    setField("confirmPassword", value)
                  }
                  onUsernameChange={(value) => setField("username", value)}
                  onTermsChange={setAcceptedTerms}
                  onForgotPassword={() => switchMode("forgot")}
                  onOpenTerms={() =>
                    toast.message(t("auth.terms.title"), {
                      description: t("auth.terms.description"),
                    })
                  }
                />
                <button
                  type="submit"
                  disabled={pendingAction !== null}
                  className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-md bg-primary font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {pendingAction === "submit" && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  {t(mode === "login" ? "auth.login" : "auth.register")}
                </button>
                <AuthDivider />
                <GoogleAuthButton
                  mode={mode}
                  pending={pendingAction !== null}
                  ready={googleReady}
                  loading={googleLoading}
                  onClick={() => void handleGoogleClick()}
                />
              </>
            )}
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            {auxiliaryMode && (
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="min-h-[44px] w-full text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {t("auth.backToLogin")}
              </button>
            )}
          </motion.form>
        </AnimatePresence>
      </div>
    </section>
  );
}

function AuthDivider() {
  const { t } = useTranslation();
  return (
    <div className="relative py-2">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wider">
        <span className="bg-background px-3 text-muted-foreground">
          {t("auth.or")}
        </span>
      </div>
    </div>
  );
}
