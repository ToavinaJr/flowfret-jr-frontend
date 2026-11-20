import { Music } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNotation } from "@/contexts/useNotation";
import { NOTATION_STYLES, formatNoteName, isNotationStyle } from "@/utils/noteNaming";

export function NotationSetting() {
  const { t } = useTranslation();
  const { notation, setNotation } = useNotation();

  return (
    <div className="space-y-2 rounded-lg border border-border bg-card p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <Music className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <span className="text-sm font-medium text-foreground">{t("settings.notation")}</span>
      </div>
      <p className="text-xs text-muted-foreground">{t("settings.notationDescription")}</p>
      <Select
        name="notation"
        value={notation}
        onValueChange={(value) => {
          if (isNotationStyle(value)) setNotation(value);
        }}
      >
        <SelectTrigger aria-label={t("settings.notation")} className="w-full border-border bg-background text-foreground">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {NOTATION_STYLES.map((style) => (
            <SelectItem key={style} value={style}>
              {t(`settings.notationStyles.${style}`, { example: ["C", "D", "E"].map((note) => formatNoteName(note, style)).join(" ") })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
