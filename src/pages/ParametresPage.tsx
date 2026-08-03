import { useState } from "react";

type ThemePreference = "dark" | "system";

const ParametresPage = () => {
  const [theme, setTheme] = useState<ThemePreference>("dark");

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-20 md:pb-6">
      <h1 className="text-display text-foreground mb-6">Settings</h1>

      <div className="bg-card border border-border rounded-lg p-4 mb-4">
        <div className="text-sm text-foreground mb-1">Appearance</div>
        <p className="text-xs text-muted-foreground mb-3">
          FretFlow uses a dark design system. System preference is reserved for
          future light theme support.
        </p>
        <div className="flex gap-2">
          {(["dark", "system"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setTheme(option)}
              className={`flex-1 min-h-[44px] rounded-md text-sm capitalize ${
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

      <div className="bg-card border border-border rounded-lg p-4 text-sm text-muted-foreground">
        Audio unlocks automatically on first interaction (browser autoplay
        policy). Chord detection runs entirely in your browser.
      </div>
    </div>
  );
};

export default ParametresPage;
