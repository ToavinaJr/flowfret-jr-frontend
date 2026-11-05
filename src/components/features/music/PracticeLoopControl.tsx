import { Repeat2, RotateCcw } from "lucide-react";
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

  return (
    <div className={`relative flex shrink-0 ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex h-10 w-10 items-center justify-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${open || practiceLoop.enabled ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
        aria-label={t("mediaPlayer.practiceLoopConfigure")}
        aria-expanded={open}
        aria-controls={panelId}
        aria-pressed={practiceLoop.enabled}
        title={t("mediaPlayer.practiceLoop")}
      >
        <Repeat2 className="h-5 w-5" aria-hidden="true" />
      </button>
      {open ? (
        <section
          id={panelId}
          aria-label={t("mediaPlayer.practiceLoop")}
          className="fixed bottom-[calc(var(--mobile-nav-offset)+6.75rem+0.5rem)] left-2 right-2 z-50 w-auto rounded-lg border border-border bg-card p-3 shadow-xl sm:bottom-[calc(76px+0.5rem)] sm:left-auto sm:right-2 sm:w-[min(22rem,calc(100vw-1rem))] sm:p-4"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {t("mediaPlayer.practiceLoop")}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {t("mediaPlayer.practiceLoopHint")}
              </p>
            </div>
            <span data-testid="practice-loop-times" className="shrink-0 rounded-md bg-secondary px-2 py-1 font-mono text-xs text-foreground">
              {t("mediaPlayer.practiceLoopStartAt", { time: formatTime(practiceLoop.start) })}
              {" · "}
              {t("mediaPlayer.practiceLoopEndAt", { time: formatTime(practiceLoop.end) })}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={setPracticeLoopStart}
              className="min-h-10 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {t("mediaPlayer.practiceLoopSetStart")}
            </button>
            <button
              type="button"
              onClick={() => setPracticeLoopEnd()}
              disabled={!canSetEnd}
              title={!canSetEnd ? t("mediaPlayer.practiceLoopEndHint") : undefined}
              className="min-h-10 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-45"
            >
              {t("mediaPlayer.practiceLoopSetEnd")}
            </button>
            <button
              type="button"
              onClick={() => setPracticeLoopEnabled(!practiceLoop.enabled)}
              disabled={!hasValidLoop}
              aria-pressed={practiceLoop.enabled}
              className="min-h-10 rounded-md bg-primary px-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {t(practiceLoop.enabled ? "mediaPlayer.practiceLoopDisable" : "mediaPlayer.practiceLoopEnable")}
            </button>
            <button
              type="button"
              onClick={clearPracticeLoop}
              disabled={!hasMarkers}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-sm text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-45"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              {t("mediaPlayer.practiceLoopClear")}
            </button>
          </div>
        </section>
      ) : null}
    </div>
  );
}
