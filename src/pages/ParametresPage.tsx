import { useState } from "react";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";

type ThemePreference = "dark" | "system";

const ParametresPage = () => {
  const [theme, setTheme] = useState<ThemePreference>("dark");

  return (
    <div className={`${PAGE_SHELL} max-w-lg lg:max-w-lg`}>
      <h1 className={PAGE_TITLE}>Settings</h1>

      <div className="mb-4 rounded-lg border border-border bg-card p-3 sm:p-4">
        <div className="mb-1 text-sm text-foreground">Appearance</div>
        <p className="mb-3 text-xs text-muted-foreground">
          FretFlow uses a dark design system. System preference is reserved for
          future light theme support.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(["dark", "system"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTheme(option)}
              className={`min-h-[44px] rounded-md text-sm capitalize ${
                theme === option
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground sm:p-4">
        Audio unlocks automatically on first interaction (browser autoplay
        policy). Chord detection runs entirely in your browser.
      </div>
    </div>
  );
};

export default ParametresPage;
