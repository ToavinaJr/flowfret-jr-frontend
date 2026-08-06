import { useEffect, useRef, type ChangeEvent } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface OtpFormProps {
  otp: string;
  onOtpChange: (value: string) => void;
  loading: boolean;
  onSubmit: () => void;
  onResend: () => void;
  resendPending: boolean;
}

export function OtpForm({
  otp,
  onOtpChange,
  loading,
  onSubmit,
  onResend,
  resendPending,
}: OtpFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border/70 bg-background/80 p-4 text-sm text-muted-foreground">
        Un code de vérification a été envoyé à votre adresse e-mail. Entrez-le ci-dessous.
      </div>

      <div>
        <label className="text-xs text-muted-foreground" htmlFor="otp">
          Code de vérification
        </label>
        <input
          ref={inputRef}
          id="otp"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={otp}
          onChange={(e: ChangeEvent<HTMLInputElement>) => onOtpChange(e.target.value.replace(/\D/g, ""))}
          placeholder="1234"
          className="auth-input !mt-0"
          maxLength={4}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onSubmit}
          className={cn(
            "inline-flex min-h-[44px] flex-1 items-center justify-center rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70",
            loading && "cursor-wait",
          )}
          disabled={loading || otp.length !== 4}
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Vérification...
            </span>
          ) : (
            "Vérifier"
          )}
        </button>

        <button
          type="button"
          onClick={onResend}
          className="inline-flex min-h-[44px] items-center justify-center rounded-lg border border-border px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary"
          disabled={resendPending}
        >
          {resendPending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Envoi...
            </span>
          ) : (
            "Renvoyer le code"
          )}
        </button>
      </div>
    </div>
  );
}
