import { useEffect, useMemo, useState } from "react";
import { ChordDiagram } from "@/components/features/chords/ChordDiagram";
import { usePlayback, type PlaybackItem } from "@/contexts/PlaybackContext";
import type { ImportedSong } from "@/types/song";
import { getChordPosition } from "@/utils/chords";
import { getCueIndexAtTime, normaliseKey } from "@/utils/songCues";
import { useTranslation } from "react-i18next";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
}

function chordShape(label?: string) {
  const match = /^([A-G](?:#|b)?)(maj7|m7|sus2|sus4|dim|aug|7|m)?$/.exec(
    label ?? "",
  );
  if (!match) return { label: label ?? "—", position: undefined };
  const key = normaliseKey(match[1]);
  const suffixByLabel: Record<string, string> = {
    "": "major",
    m: "minor",
    maj7: "maj7",
    m7: "m7",
    sus2: "sus2",
    sus4: "sus4",
    dim: "dim",
    aug: "aug",
    "7": "7",
  };
  return {
    label: `${key}${match[2] ?? ""}`,
    position: getChordPosition(key, suffixByLabel[match[2] ?? ""]),
  };
}

export function ImportedSongPlayer({ song }: { song: ImportedSong }) {
  const { t } = useTranslation();
  const { item, currentTime, select } = usePlayback();
  const [previewChord, setPreviewChord] = useState<string | null>(null);
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
    }),
    [song, t],
  );
  const active = item?.id === playbackItem.id;
  const position = active ? currentTime : 0;
  const foundCueIndex = getCueIndexAtTime(song.meta.cues, position);
  const activeCueIndex = foundCueIndex >= 0 ? foundCueIndex : 0;
  const previousCue = song.meta.cues[activeCueIndex - 1];
  const activeCue = song.meta.cues[activeCueIndex];
  const nextCue = song.meta.cues[activeCueIndex + 1];
  const previous = chordShape(previousCue?.chord);
  const current = chordShape(activeCue?.chord);
  const next = chordShape(nextCue?.chord);
  const displayed = previewChord ? chordShape(previewChord) : current;
  const chordSet = useMemo(
    () => [
      ...new Set(song.meta.cues.map((cue) => chordShape(cue.chord).label)),
    ],
    [song.meta.cues],
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
      <div className="relative flex min-h-[390px] items-center justify-center overflow-hidden p-4 sm:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.09),transparent_62%)]" />
        <div className="relative flex w-full items-center justify-center gap-0 sm:gap-4">
          <div
            key={`previous-${activeCueIndex}`}
            className="hidden -translate-x-3 scale-75 opacity-20 blur-[0.4px] transition-all duration-500 sm:block"
            aria-hidden="true"
          >
            {previous.position ? (
              <ChordDiagram
                chord={previous.label}
                position={previous.position}
                scale={0.78}
                dimmed
              />
            ) : null}
          </div>
          <div
            key={`current-${previewChord ?? activeCueIndex}`}
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
              {previewChord
                ? t("player.chordPreviewHint")
                : `${formatTime(activeCue.start)} – ${formatTime(activeCue.end)}`}
            </p>
          </div>
          <div
            key={`next-${activeCueIndex}`}
            className="hidden translate-x-3 scale-75 opacity-20 blur-[0.4px] transition-all duration-500 sm:block"
            aria-hidden="true"
          >
            {next.position ? (
              <ChordDiagram
                chord={next.label}
                position={next.position}
                scale={0.78}
                dimmed
              />
            ) : null}
          </div>
        </div>
        <div
          className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5"
          aria-hidden="true"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/25" />
          <span className="h-1.5 w-5 rounded-full bg-primary" />
          <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/25" />
        </div>
      </div>

      <aside
        className="border-t border-border bg-background/45 p-3 lg:border-l lg:border-t-0"
        aria-label={t("player.detectedChords")}
      >
        <div className="mb-3 flex items-center justify-between gap-2 px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("player.allChords")}
          </h2>
          <span className="font-musical text-xs text-muted-foreground">
            {chordSet.length}
          </span>
        </div>
        <div className="grid max-h-80 grid-cols-3 gap-2 overflow-y-auto pr-1 lg:max-h-[370px] lg:grid-cols-2">
          {chordSet.map((label) => (
            <button
              key={label}
              type="button"
              onClick={() =>
                setPreviewChord((selected) =>
                  selected === label ? null : label,
                )
              }
              aria-pressed={previewChord === label}
              className={`rounded-lg border px-2 py-3 text-center transition-all ${previewChord === label ? "border-primary bg-primary text-primary-foreground shadow-sm" : label === current.label && !previewChord ? "border-primary/60 bg-primary/10 text-primary" : "border-border bg-secondary text-foreground hover:border-primary/50"}`}
            >
              <span className="block text-center font-musical text-base font-semibold">
                {label}
              </span>
            </button>
          ))}
        </div>
      </aside>
    </section>
  );
}
