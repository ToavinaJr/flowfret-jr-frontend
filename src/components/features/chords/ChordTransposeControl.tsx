import { Minus, Plus, RotateCcw } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ChordTransposeControl({ semitones, onChange }: {
  semitones: number;
  onChange: (value: number) => void;
}) {
  const { t } = useTranslation();
  const buttonClass = "grid h-11 w-11 shrink-0 place-items-center rounded-md hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-40 disabled:hover:bg-transparent";
  return (
    <div className="border-t border-border py-3" role="group" aria-label={t("player.transpose")}>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-sm text-muted-foreground">{t("player.transpose")}</span>
        <button type="button" className={buttonClass} disabled={semitones === 0} onClick={() => onChange(0)} aria-label={t("player.resetTranspose")} title={t("player.resetTranspose")}>
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <div className="flex items-center justify-between gap-2 rounded-md border border-border bg-background">
        <button type="button" className={buttonClass} disabled={semitones <= -12} onClick={() => onChange(Math.max(-12, semitones - 1))} aria-label={t("player.transposeDown")}>
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <output className="text-center text-sm tabular-nums" aria-live="polite">
          {t("player.semitones", { value: semitones > 0 ? `+${semitones}` : semitones })}
        </output>
        <button type="button" className={buttonClass} disabled={semitones >= 12} onClick={() => onChange(Math.min(12, semitones + 1))} aria-label={t("player.transposeUp")}>
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{t("player.transposeHint")}</p>
    </div>
  );
}
