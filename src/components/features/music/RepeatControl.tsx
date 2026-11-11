import { Repeat, Repeat1 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePlayback } from "@/contexts/usePlayback";

export function RepeatControl({ className = "" }: { className?: string }) {
  const { t } = useTranslation();
  const { repeatMode, setRepeatMode, queue } = usePlayback();
  const nextMode = repeatMode === "off" ? "queue" : repeatMode === "queue" ? "one" : "off";
  const label = t(`mediaPlayer.repeatModes.${repeatMode}`);
  return (
    <button
      type="button"
      disabled={queue.length === 0}
      onClick={() => setRepeatMode(nextMode)}
      className={`grid h-9 w-9 shrink-0 place-items-center rounded-md disabled:opacity-30 ${repeatMode !== "off" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"} ${className}`}
      aria-label={t("mediaPlayer.repeatLabel", { mode: label })}
      title={t("mediaPlayer.repeatLabel", { mode: label })}
      aria-pressed={repeatMode !== "off"}
    >
      {repeatMode === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
    </button>
  );
}
