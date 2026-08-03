import {
  useState,
  type FormEvent,
  type ReactNode,
  type ChangeEvent,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Guitar,
  Loader2,
  Music2,
  Radio,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { ApiClientError } from "@/types/api";
import { getSafeErrorMessage } from "@/utils/safeError";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "register";

interface AuthGateProps {
  children: ReactNode;
}

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  autoComplete: string;
  onChange: (value: string) => void;
}

function PasswordField({
  id,
  label,
  value,
  autoComplete,
  onChange,
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="text-xs text-muted-foreground" htmlFor={id}>
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          type={visible ? "text" : "password"}
          required
          autoComplete={autoComplete}
          value={value}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            onChange(e.target.value)
          }
          className="auth-input !mt-0 pr-12"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-1 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

const HIGHLIGHTS = [
  {
    icon: Music2,
    title: "Grilles personnalisées",
    text: "Accédez à vos progressions et diagrams sauvegardés.",
  },
  {
    icon: Radio,
    title: "Pratique en temps réel",
    text: "Tuner, métronome et analyse d’accords synchronisés.",
  },
  {
    icon: Sparkles,
    title: "Progression claire",
    text: "Suivez vos sessions et partagez vos riffs.",
  },
] as const;

export function AuthGate({ children }: AuthGateProps) {
  const { status, login, register } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setPassword("");
    setConfirmPassword("");
    setAcceptedTerms(false);
  }

  function handleSocialClick(provider: "Google" | "GitHub" | "Apple") {
    toast.message(`${provider} sign-in is coming soon.`, {
      description: "Use email and password for now.",
    });
  }

  function handleForgotPassword() {
    toast.message("Password reset is coming soon.", {
      description: "Contact support if you need help recovering access.",
    });
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (mode === "login") {
        await login({ email, password });
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      if (!acceptedTerms) {
        setError("Please accept the terms to create an account.");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }

      await register({ email, password, username });
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(
          getSafeErrorMessage(
            mode === "login" ? "auth" : "generic",
            err.message,
          ),
        );
      } else {
        setError(
          mode === "login"
            ? "Unable to sign in. Check your credentials and try again."
            : "Unable to create your account. Please try again later.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen w-full overflow-x-hidden bg-background lg:grid-cols-2">
      <section className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-10 xl:px-16">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Guitar className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-display text-lg text-foreground">FretFlow</span>
          </div>

          <div className="mb-2 text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </div>
          <p className="mb-6 text-sm text-muted-foreground">
            {mode === "login"
              ? "Sign in to continue practicing and sharing."
              : "Join FretFlow and unlock your guitar workflow."}
          </p>

          <div
            className="mb-6 grid grid-cols-2 rounded-lg bg-secondary p-1"
            role="tablist"
            aria-label="Authentication mode"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              onClick={() => switchMode("login")}
              className={cn(
                "min-h-[44px] rounded-md text-sm font-medium transition-colors",
                mode === "login"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Log in
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              onClick={() => switchMode("register")}
              className={cn(
                "min-h-[44px] rounded-md text-sm font-medium transition-colors",
                mode === "register"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Sign up
            </button>
          </div>

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
              {mode === "register" && (
                <div>
                  <label
                    className="text-xs text-muted-foreground"
                    htmlFor="username"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    type="text"
                    required
                    autoComplete="username"
                    value={username}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      setUsername(e.target.value)
                    }
                    className="auth-input"
                  />
                </div>
              )}

              <div>
                <label className="text-xs text-muted-foreground" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  className="auth-input"
                />
              </div>

              <PasswordField
                id="password"
                label="Password"
                value={password}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                onChange={setPassword}
              />

              {mode === "login" && (
                <div className="-mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
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
                    label="Confirm password"
                    value={confirmPassword}
                    autoComplete="new-password"
                    onChange={setConfirmPassword}
                  />

                  <div className="flex items-start gap-3 pt-1">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) =>
                        setAcceptedTerms(checked === true)
                      }
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
                        onClick={() =>
                          toast.message("Terms of use", {
                            description:
                              "Full terms will be available soon. Contact support for details.",
                          })
                        }
                        className="text-foreground underline underline-offset-2 hover:text-primary"
                      >
                        Conditions Générales d’Utilisation
                      </button>
                    </label>
                  </div>
                </>
              )}

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full min-h-[48px] items-center justify-center gap-2 rounded-md bg-primary font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === "login" ? "Se connecter" : "Créer mon compte"}
              </button>

              {mode === "login" && (
                <>
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase tracking-wider">
                      <span className="bg-background px-3 text-muted-foreground">
                        ou
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    {(
                      [
                        { label: "Google", provider: "Google" as const },
                        { label: "GitHub", provider: "GitHub" as const },
                        { label: "Apple", provider: "Apple" as const },
                      ] as const
                    ).map((item) => (
                      <button
                        key={item.provider}
                        type="button"
                        onClick={() => handleSocialClick(item.provider)}
                        className="min-h-[44px] rounded-md border border-border bg-card text-sm text-foreground transition-colors hover:bg-surface-hover"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
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
            Analysez, pratiquez et partagez — un workbench pensé pour les
            guitaristes.
          </p>

          <ul className="mt-10 space-y-5">
            {HIGHLIGHTS.map((item) => (
              <li key={item.title} className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-card/80 ring-1 ring-border">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">
                    {item.title}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 px-10 pb-10 text-xs text-muted-foreground xl:px-16">
          FretFlow — Analyze. Practice. Share.
        </div>
      </aside>
    </div>
  );
}
