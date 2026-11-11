import { Brackets, RotateCcw } from "lucide-react";
import { useId, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePlayback } from "@/contexts/usePlayback";
import { isPracticeLoopValid } from "@/services/practiceLoop";

function formatTime(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds) || seconds < 0) return "—";
  const minutes = Math.floor(seconds / 60);
  const wholeSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
  const tenths = Math.floor((seconds % 1) * 10);
  return `${minutes}:${wholeSeconds}.${tenths}`;
}

export function PracticeLoopControl({ className = "" }: { className?: string }) {
  const { t } = useTranslation();
  const panelId = useId();
  const {
    practiceLoop,
    currentTime,
    duration,
    setPracticeLoopStart,
    setPracticeLoopEnd,
    setPracticeLoopEnabled,
    clearPracticeLoop,
  } = usePlayback();
  const [open, setOpen] = useState(false);
  const hasValidLoop = isPracticeLoopValid(practiceLoop, duration);
  const canSetEnd = practiceLoop.start !== null &&
    currentTime - practiceLoop.start >= 0.5 &&
    (duration <= 0 || currentTime <= duration);
  const hasMarkers = practiceLoop.start !== null || practiceLoop.end !== null;

  const panel = (
    <section
      id={panelId}
      aria-label={t("mediaPlayer.practiceLoop")}
      className="fixed bottom-[calc(var(--mobile-nav-offset)+12rem)] left-2 right-2 z-50 w-auto rounded-lg border border-border bg-card p-4 shadow-xl sm:bottom-[calc(var(--mobile-nav-offset)+9.5rem)] md:bottom-[9.5rem] xl:bottom-[6.5rem] sm:left-auto sm:right-2 sm:w-[min(24rem,calc(100vw-1rem))] sm:p-4"
    >
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">
            {t("mediaPlayer.practiceLoop")}
          </h2>
          <span data-testid="practice-loop-times" className="ml-auto shrink-0 rounded-md bg-secondary px-2 py-1 font-mono tabular-nums text-xs text-foreground">
            {t("mediaPlayer.practiceLoopStartAt", { time: formatTime(practiceLoop.start) })}
            {" · "}
            {t("mediaPlayer.practiceLoopEndAt", { time: formatTime(practiceLoop.end) })}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {t("mediaPlayer.practiceLoopHint")}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={setPracticeLoopStart}
          className="min-h-11 rounded-md border border-border bg-background px-3 py-2 text-center text-sm font-medium leading-tight text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {t("mediaPlayer.practiceLoopSetStart")}
        </button>
        <button
          type="button"
          onClick={() => setPracticeLoopEnd()}
          disabled={!canSetEnd}
          title={!canSetEnd ? t("mediaPlayer.practiceLoopEndHint") : undefined}
          className="min-h-11 rounded-md border border-border bg-background px-3 py-2 text-center text-sm font-medium leading-tight text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-45"
        >
          {t("mediaPlayer.practiceLoopSetEnd")}
        </button>
        <button
          type="button"
          onClick={() => setPracticeLoopEnabled(!practiceLoop.enabled)}
          disabled={!hasValidLoop}
          aria-pressed={practiceLoop.enabled}
          className="min-h-11 rounded-md bg-primary px-3 py-2 text-center text-sm font-semibold leading-tight text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {t(practiceLoop.enabled ? "mediaPlayer.practiceLoopDisable" : "mediaPlayer.practiceLoopEnable")}
        </button>
        <button
          type="button"
          onClick={clearPracticeLoop}
          disabled={!hasMarkers}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-center text-sm leading-tight text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-45"
        >
          <RotateCcw className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {t("mediaPlayer.practiceLoopClear")}
        </button>
      </div>
    </section>
  );

  return (
    <div className={`relative flex shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex size-9 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${open || practiceLoop.enabled ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
        aria-label={t("mediaPlayer.practiceLoopConfigure")}
        aria-expanded={open}
        aria-controls={panelId}
        aria-pressed={practiceLoop.enabled}
        title={t("mediaPlayer.practiceLoop")}
      >
        <Brackets className="size-4" aria-hidden="true" />
      </button>
      {open ? panel : null}
    </div>
  );
}
