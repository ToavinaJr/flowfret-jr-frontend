import { Globe2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type LanguageOption = "en" | "fr";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { t, i18n } = useTranslation();
  const activeLanguage = i18n.resolvedLanguage ?? i18n.language;
  const language: LanguageOption = activeLanguage.startsWith("fr") ? "fr" : "en";

  function changeLanguage(value: string) {
    if (value !== "en" && value !== "fr") return;
    document.documentElement.lang = value;
    window.localStorage.setItem("fretflow-language", value);
    void i18n.changeLanguage(value);
  }

  return (
    <div className={`flex items-center gap-2 ${compact ? "w-full" : ""}`}>
      <Globe2 className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <Select name="landing-language" value={language} onValueChange={changeLanguage}>
        <SelectTrigger
          aria-label={t("settings.language")}
          className={compact ? "min-h-10 flex-1 border-border bg-background" : "h-10 w-[7.5rem] border-border bg-card"}
        >
          <SelectValue placeholder={t("settings.language")} />
        </SelectTrigger>
        <SelectContent className="z-[70]">
          <SelectItem value="en">{t("settings.english")}</SelectItem>
          <SelectItem value="fr">{t("settings.french")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
