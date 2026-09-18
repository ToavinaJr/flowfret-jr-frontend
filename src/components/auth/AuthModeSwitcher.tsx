import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import type { AuthMode } from "@/types/auth";

interface AuthModeSwitcherProps {
  mode: AuthMode;
  onSwitchMode: (mode: AuthMode) => void;
}

export function AuthModeSwitcher({ mode, onSwitchMode }: AuthModeSwitcherProps) {
  const { t } = useTranslation();
  return (
    <div
      className="mb-6 grid grid-cols-2 rounded-lg bg-secondary p-1"
      role="tablist"
      aria-label={t("auth.mode")}
    >
      <button
        type="button"
        role="tab"
        aria-selected={mode === "login"}
        onClick={() => onSwitchMode("login")}
        className={cn(
          "min-h-[44px] rounded-md text-sm font-medium transition-colors",
          mode === "login"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {t("auth.login")}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={mode === "register"}
        onClick={() => onSwitchMode("register")}
        className={cn(
          "min-h-[44px] rounded-md text-sm font-medium transition-colors",
          mode === "register"
            ? "bg-primary text-primary-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        {t("auth.register")}
      </button>
    </div>
  );
}
