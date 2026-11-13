import { useEffect, useMemo, useState } from "react";
import { ChordDiagram } from "@/components/features/chords/ChordDiagram";
import { usePlayback } from "@/contexts/usePlayback";
import type { PlaybackItem } from "@/contexts/playback-context";
import type { ImportedSong } from "@/types/song";
import { getDisplayChordShape } from "@/utils/chordShape";
import { getCueIndexAtTime } from "@/utils/songCues";
import { useCapo } from "@/contexts/useCapo";
import { CapoSelect } from "@/components/features/chords/CapoSelect";
import { useTranslation } from "react-i18next";
import { ChordTimeline } from "./ChordTimeline";
import { ChordTransposeControl } from "@/components/features/chords/ChordTransposeControl";

export function ImportedSongPlayer({ song }: { song: ImportedSong }) {
  const { t } = useTranslation();
  const { item, currentTime, select, seek } = usePlayback();
  const { capo } = useCapo();
  const [previewChord, setPreviewChord] = useState<string | null>(null);
  const [semitones, setSemitones] = useState(0);
  const playbackItem = useMemo<PlaybackItem>(
    () => ({
      id: `import:${song.uri}`,
      src: song.uri,
      title: song.meta.title,
      subtitle: t("player.importedSubtitle"),
      duration: song.meta.duration,
      destination: "/upload",
      trackActivity: false,
      revokeSourceOnRelease: true,
      chordCues: song.meta.cues,
    }),
    [song, t],
  );
  const active = item?.id === playbackItem.id;
  const position = active ? currentTime : 0;
  const foundCueIndex = getCueIndexAtTime(song.meta.cues, position);
  const lastCueIndex = song.meta.cues.length - 1;
  const activeCueIndex = foundCueIndex >= 0
    ? foundCueIndex
    : position >= (song.meta.cues[lastCueIndex]?.end ?? Infinity) ? lastCueIndex : 0;
  const activeCue = song.meta.cues[activeCueIndex];
  const current = getDisplayChordShape(activeCue?.chord, capo, semitones);
  const displayed = getDisplayChordShape(previewChord ?? undefined, capo, semitones);
  const chordSet = useMemo(
    () => [...new Set(song.meta.cues.map((cue) => cue.chord))]
      .map((chord) => ({
        source: chord,
        label: getDisplayChordShape(chord, capo, semitones).label,
      })),
    [song.meta.cues, capo, semitones],
  );

  useEffect(() => {
    select(playbackItem);
  }, [playbackItem, select]);
  if (!activeCue) return null;

  return (
    <section
      className="mt-6 grid min-h-[430px] overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-[minmax(0,1fr)_19rem]"
      aria-label={t("player.chordsFor", { title: song.meta.title })}
    >
      <div className="min-w-0">
        {previewChord ? (
          <div className="relative flex min-h-[250px] items-center justify-center overflow-hidden p-4 sm:min-h-[300px] sm:p-8">
            <div
              key={`preview-${previewChord}`}
              className="z-10 animate-in fade-in zoom-in-95 duration-300"
            >
              {displayed.position ? (
                <ChordDiagram
                  chord={displayed.label}
                  position={displayed.position}
                  scale={1.25}
                />
              ) : (
                <div className="grid h-72 w-48 place-items-center text-5xl font-bold text-primary">
                  {displayed.label}
                </div>
              )}
              <p className="mt-1 text-center font-musical text-xs text-muted-foreground">
                {t("player.chordPreviewHint")}
              </p>
            </div>
          </div>
        ) : (
          <ChordTimeline
            cues={song.meta.cues}
            activeIndex={activeCueIndex}
            capo={capo}
            semitones={semitones}
            onSeek={active ? seek : undefined}
          />
        )}
      </div>

      <aside
        className="border-t border-border bg-background/45 p-3 lg:border-l lg:border-t-0"
        aria-label={t("player.detectedChords")}
      >
        <div className="rounded-lg border border-border/80 bg-card/70 px-4">
          <CapoSelect namespace="chordPlayer" idPrefix="upload-chord-player" />
          <ChordTransposeControl semitones={semitones} onChange={setSemitones} />
        </div>
      </aside>

      <section
        className="border-t border-border bg-background/25 p-3 sm:p-4 lg:col-span-2"
        aria-label={t("player.allChords")}
      >
        <div className="mb-3 flex items-center justify-between gap-2 px-1">
          <h2 className="text-xs font-medium text-muted-foreground">
            {t("player.allChords")}
          </h2>
          <span className="font-musical text-xs tabular-nums text-muted-foreground">
            {chordSet.length}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {chordSet.map(({ source, label }) => (
            <button
              key={source}
              type="button"
              onClick={() =>
                setPreviewChord((selected) =>
                  selected === source ? null : source,
                )
              }
              aria-pressed={previewChord === source}
              className={`min-h-12 rounded-lg border px-3 py-2 text-center transition-[color,background-color,border-color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${previewChord === source ? "border-primary bg-primary text-primary-foreground shadow-sm" : label === current.label && !previewChord ? "border-primary/60 bg-primary/10 text-primary" : "border-border bg-secondary text-foreground hover:border-primary/50"}`}
            >
              <span className="block text-center font-musical text-base font-semibold">
                {label}
              </span>
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}
