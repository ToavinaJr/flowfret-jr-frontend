import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { PlaybackItem } from "@/contexts/PlaybackContext";
import { useChordAnalysis } from "@/hooks/useChordAnalysis";
import { ChordDiagram } from "@/components/features/chords/ChordDiagram";
import { getDisplayChordShape } from "@/utils/chordShape";
import { getCueIndexAtTime } from "@/utils/songCues";
import { useCapo } from "@/contexts/useCapo";
import { CapoSelect } from "@/components/features/chords/CapoSelect";
import { transposeChordLabel } from "@/utils/chordTransposition";

interface PersistentChordsProps {
  item: PlaybackItem;
  currentTime: number;
  onSeek: (time: number) => void;
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
}: PersistentChordsProps) {
  const { t } = useTranslation();
  const { capo } = useCapo();
  const { analysis, status, progress, phase, failure } = useChordAnalysis(
    item,
    true,
  );
  const activeIndex = analysis
    ? Math.max(0, getCueIndexAtTime(analysis.cues, currentTime))
    : 0;
  const activeCue = analysis?.cues[activeIndex];
  const activeChord = getDisplayChordShape(activeCue?.chord, capo);
  const nearbyCues = analysis?.cues.slice(
    Math.max(0, activeIndex - 2),
    activeIndex + 4,
  );
  const chordCount = useMemo(
    () => new Set(analysis?.cues.map((cue) => cue.chord) ?? []).size,
    [analysis?.cues],
  );

  return (
    <div className="min-w-0">
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
            <p
              className="px-4 py-6 text-sm text-muted-foreground"
              role="status"
            >
              {t("chordPlayer.directSourceRequired")}
            </p>
          ) : null}

          {status === "error" ? (
            <div className="space-y-1 px-4 py-6 text-sm" role="alert">
              <p className="font-medium text-destructive">
                {t("chordPlayer.error")}
              </p>
              <p className="text-xs text-muted-foreground">
                {t(`chordPlayer.errors.${failure?.code ?? "unknown"}`)}
              </p>
              {failure?.diagnosticId ? (
                <p className="break-all font-mono text-[10px] text-muted-foreground">
                  {t("chordPlayer.diagnosticId", {
                    id: failure.diagnosticId,
                  })}
                </p>
              ) : null}
            </div>
          ) : null}

          {status === "success" && analysis && activeCue ? (
            <div className="px-4 py-4">
              <CapoSelect namespace="chordPlayer" />
              <p className="mt-2 text-center text-xs text-muted-foreground">
                {t("chordPlayer.soundingChord")}: <span className="font-musical">{activeCue.chord}</span>
                {capo > 0 ? <> · {t("chordPlayer.playingShape")}: <span className="font-musical">{activeChord.label}</span></> : null}
              </p>
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
                          aria-current={index === 0 ? "true" : undefined}
                          aria-label={
                            index === 0
                              ? t("chordPlayer.playNow")
                              : t("chordPlayer.alternative", {
                                  number: index + 1,
                                })
                          }
                          className={`relative min-w-0 rounded-lg border p-1 transition-colors ${
                            index === 0
                              ? "border-primary bg-primary/15 shadow-[0_0_0_1px_hsl(var(--primary)/0.35)]"
                              : "border-transparent bg-secondary/35 opacity-75"
                          }`}
                        >
                          <div className="flex min-h-6 items-center justify-between gap-1 px-1">
                            <span
                              className={`truncate text-[10px] font-semibold uppercase tracking-wide ${
                                index === 0
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {index === 0
                                ? t("chordPlayer.playNow")
                                : t("chordPlayer.alternative", {
                                    number: index + 1,
                                  })}
                            </span>
                            <span
                              className={`grid h-5 min-w-5 shrink-0 place-items-center rounded-full px-1 font-musical text-[10px] ${
                                index === 0
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-secondary text-muted-foreground"
                              }`}
                            >
                              {index + 1}
                            </span>
                          </div>
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
                        {transposeChordLabel(cue.chord, capo)}
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
  );
}
