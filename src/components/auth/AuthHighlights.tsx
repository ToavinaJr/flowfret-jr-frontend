import { Music2, Radio, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

const HIGHLIGHTS = [
  {
    icon: Music2,
    key: "savedProgressions",
  },
  {
    icon: Radio,
    key: "realtimePractice",
  },
  {
    icon: Sparkles,
    key: "clearProgress",
  },
] as const;

export function AuthHighlights() {
  const { t } = useTranslation();
  return (
    <ul className="mt-10 space-y-5">
      {HIGHLIGHTS.map((item) => (
        <li key={item.key} className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-card/80 ring-1 ring-border">
            <item.icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">{t(`auth.highlights.${item.key}.title`)}</div>
            <p className="mt-1 text-sm text-muted-foreground">{t(`auth.highlights.${item.key}.description`)}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
