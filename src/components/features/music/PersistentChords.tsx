import { Guitar, X } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { PlaybackItem } from "@/contexts/PlaybackContext";
import { useChordAnalysis } from "@/hooks/useChordAnalysis";
import { ChordDiagram } from "@/components/features/chords/ChordDiagram";
import { getDisplayChordShape } from "@/utils/chordShape";
import { getCueIndexAtTime } from "@/utils/songCues";

interface PersistentChordsProps {
  item: PlaybackItem;
  currentTime: number;
  onSeek: (time: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
}

export function PersistentChords({
  item,
  currentTime,
  onSeek,
  open,
  onOpenChange,
}: PersistentChordsProps) {
  const { t } = useTranslation();
  const { analysis, status, progress, phase } = useChordAnalysis(item, open);
  const activeIndex = analysis
    ? Math.max(0, getCueIndexAtTime(analysis.cues, currentTime))
    : 0;
  const activeCue = analysis?.cues[activeIndex];
  const activeChord = getDisplayChordShape(activeCue?.chord);
  const nearbyCues = analysis?.cues.slice(
    Math.max(0, activeIndex - 2),
    activeIndex + 4,
  );
  const chordCount = useMemo(
    () => new Set(analysis?.cues.map((cue) => cue.chord) ?? []).size,
    [analysis?.cues],
  );

  return (
    <>
      {open ? (
        <div
          id="persistent-chords-panel"
          className="isolate absolute bottom-full left-0 right-0 max-h-[calc(100dvh-8rem)] overflow-y-auto border-t border-border bg-card/95 shadow-[0_-20px_50px_rgba(0,0,0,0.45)] backdrop-blur-3xl supports-[backdrop-filter]:bg-card/90 md:left-auto md:w-[min(36rem,100%)]"
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <div className="min-w-0">
              <h2 className="text-sm font-semibold">{t("chordPlayer.title")}</h2>
              <p className="truncate text-xs text-muted-foreground">
                {item.title}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary"
              aria-label={t("chordPlayer.close")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {status === "loading" ? (
            <div className="space-y-3 px-4 py-5" aria-live="polite">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span>{t(`chordPlayer.phases.${phase}`)}</span>
                <span className="font-musical text-muted-foreground">
                  {Math.round(progress * 100)}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-[width]"
                  style={{ width: `${Math.max(4, progress * 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t("chordPlayer.analysisHint")}
              </p>
            </div>
          ) : null}

          {status === "unavailable" ? (
            <p className="px-4 py-6 text-sm text-muted-foreground" role="status">
              {t("chordPlayer.directSourceRequired")}
            </p>
          ) : null}

          {status === "error" ? (
            <p className="px-4 py-6 text-sm text-destructive" role="alert">
              {t("chordPlayer.error")}
            </p>
          ) : null}

          {status === "success" && analysis && activeCue ? (
            <div className="px-4 py-4">
              <div>
                <div className="flex min-w-0 flex-col items-center">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {t("chordPlayer.current")}
                  </p>
                  {activeChord.positions?.length ? (
                    <div className="mt-3 grid w-full grid-cols-2 place-items-center gap-2 rounded-xl border border-border/80 bg-background/80 p-2 shadow-inner backdrop-blur-xl sm:grid-cols-4">
                      {activeChord.positions.map((position, index) => (
                        <div
                          key={`${activeChord.label}-${position.baseFret}-${index}`}
                          className="relative min-w-0"
                        >
                          <span className="absolute right-1 top-5 z-10 grid h-5 min-w-5 place-items-center rounded-full bg-secondary px-1 font-musical text-[10px] text-muted-foreground">
                            {index + 1}
                          </span>
                          <ChordDiagram
                            chord={activeChord.label}
                            position={position}
                            scale={0.58}
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 font-musical text-5xl font-bold text-primary">
                      {activeChord.label}
                    </p>
                  )}
                </div>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {formatTime(activeCue.start)} – {formatTime(activeCue.end)}
                  <br />
                  {t("chordPlayer.chordCount", { count: chordCount })}
                </p>
              </div>

              <div
                className="mt-4 flex gap-2 overflow-x-auto pb-1"
                aria-label={t("chordPlayer.timeline")}
              >
                {nearbyCues?.map((cue) => {
                  const active = cue === activeCue;
                  return (
                    <button
                      key={`${cue.start}-${cue.chord}`}
                      type="button"
                      onClick={() => onSeek(cue.start)}
                      aria-current={active ? "true" : undefined}
                      className={`min-w-20 rounded-lg border px-3 py-2 text-left backdrop-blur-xl ${active ? "border-primary bg-primary/20 text-primary" : "border-border bg-secondary text-foreground hover:border-primary/50"}`}
                    >
                      <span className="block font-musical font-semibold">
                        {cue.chord}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        {formatTime(cue.start)}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>
          ) : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${open ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
        aria-label={open ? t("chordPlayer.close") : t("chordPlayer.open")}
        aria-expanded={open}
        aria-controls="persistent-chords-panel"
      >
        <Guitar className="h-5 w-5" />
      </button>
    </>
  );
}
