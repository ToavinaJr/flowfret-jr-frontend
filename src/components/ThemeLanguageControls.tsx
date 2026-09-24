import { Moon, Sun, Monitor, Globe2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ThemeMode = "light" | "dark" | "system";
type LanguageOption = "en" | "fr";

const themeIcons: Record<ThemeMode, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor,
};

interface ThemeLanguageControlsProps {
  compact?: boolean;
  showTheme?: boolean;
}

const ThemeLanguageControls = ({ compact = false, showTheme = true }: ThemeLanguageControlsProps) => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState<LanguageOption>("en");

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("fretflow-language") as LanguageOption | null;
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    const activeLanguage = i18n.resolvedLanguage ?? i18n.language ?? language;
    document.documentElement.lang = language;
    window.localStorage.setItem("fretflow-language", language);

    if (activeLanguage !== language) {
      void i18n.changeLanguage(language);
    }
  }, [i18n, language]);

  const currentTheme = (theme as ThemeMode | undefined) ?? "system";
  const Icon = useMemo(() => themeIcons[currentTheme], [currentTheme]);

  return (
    <div className={`space-y-3 rounded-lg border border-border bg-card ${compact ? "p-2" : "p-3 sm:p-4"}`}>
      {!compact && (
        <div className="space-y-1">
          <div className="text-sm font-medium text-foreground">{t("settings.appearance")}</div>
          <p className="text-xs text-muted-foreground">{t("settings.description")}</p>
        </div>
      )}

      {showTheme && <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Globe2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{t("settings.language")}</span>
        </div>
        <Select name="language" value={language} onValueChange={(value) => setLanguage(value as LanguageOption)}>
          <SelectTrigger id="language-select" aria-label={t("settings.language")} className="w-full border-border bg-background text-foreground hover:border-primary/60 focus:ring-primary">
            <SelectValue placeholder={t("settings.language")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en" className="focus:bg-primary/10 focus:text-foreground data-[state=checked]:bg-primary/10">
              {t("settings.english")}
            </SelectItem>
            <SelectItem value="fr" className="focus:bg-primary/10 focus:text-foreground data-[state=checked]:bg-primary/10">
              {t("settings.french")}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>}

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-foreground">{t("settings.theme")}</span>
        </div>
        <div className={compact ? "grid grid-cols-3 gap-1.5" : "grid grid-cols-3 gap-2"}>
          {(["light", "dark", "system"] as const).map((option) => (
            <Button
              key={option}
              type="button"
              variant={currentTheme === option ? "default" : "secondary"}
              className="min-h-[44px] capitalize"
              onClick={() => setTheme(option)}
            >
              {t(`settings.${option}`)}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeLanguageControls;
