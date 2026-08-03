import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { Pause, Play, SkipBack } from "lucide-react";
import { ChordDiagram } from "@/components/features/chords/ChordDiagram";
import { PAGE_SHELL } from "@/constants/navigation";
import { usePlayerAudio } from "@/hooks/usePlayerAudio";
import audioMetaJson from "@/data/csv/audio.json";
import type { ChordCue, SongMeta } from "@/types/song";
import {
  getChordPosition,
  getFirstSuffixForKey,
  formatChordLabel,
} from "@/utils/chords";
import {
  getCueIndexAtTime,
  isSongMeta,
  normaliseKey,
} from "@/utils/songCues";
import {
  getImportedSong,
  getImportVersion,
} from "@/utils/importStore";
import { playStringNote } from "@/utils/stringSound";

function loadDefaultMeta(): SongMeta {
  if (!isSongMeta(audioMetaJson)) {
    throw new Error("Invalid default song metadata");
  }
  return audioMetaJson;
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const PlayerPage = () => {
  const defaultMeta = useMemo(() => loadDefaultMeta(), []);
  const [importVersion, setImportVersion] = useState(getImportVersion());
  const imported = getImportedSong();

  useEffect(() => {
    const id = window.setInterval(() => {
      const v = getImportVersion();
      setImportVersion((prev) => (prev === v ? prev : v));
    }, 500);
    return () => window.clearInterval(id);
  }, []);

  const meta: SongMeta = imported?.meta ?? defaultMeta;
  const src = imported?.uri ?? "/audio/audio.mp3";

  const { playState, currentTime, duration, play, seek, toggle } =
    usePlayerAudio({ src });

  const cueIndex = getCueIndexAtTime(meta.cues, currentTime);
  const activeCue: ChordCue | null =
    cueIndex >= 0 ? meta.cues[cueIndex] : null;
  const activeKey = activeCue ? normaliseKey(activeCue.chord) : null;
  const activeSuffix = activeKey ? getFirstSuffixForKey(activeKey) : null;
  const position =
    activeKey && activeSuffix
      ? getChordPosition(activeKey, activeSuffix, 0)
      : undefined;
  const label =
    activeKey && activeSuffix
      ? formatChordLabel(activeKey, activeSuffix)
      : "—";

  const uniqueChords = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const cue of meta.cues) {
      const key = normaliseKey(cue.chord);
      if (!seen.has(key)) {
        seen.add(key);
        list.push(key);
      }
    }
    return list;
  }, [meta.cues, importVersion]);

  const progress =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className={PAGE_SHELL}>
      <div className="mb-4 flex flex-col gap-3 sm:mb-6 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-display text-base text-foreground sm:text-lg md:text-xl">
            {meta.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {uniqueChords.length} chords · {formatTime(meta.duration)}
            {imported ? " · Imported" : " · Demo track"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => seek(0)}
          className="flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center self-start rounded-md bg-secondary text-muted-foreground hover:text-foreground"
          aria-label="Restart"
        >
          <SkipBack className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-4 flex justify-center overflow-x-auto rounded-lg border border-border bg-card p-4 sm:p-6">
        {position ? (
          <ChordDiagram
            chord={label}
            position={position}
            onStringPress={(si, df) => {
              const actual = df === 0 ? 0 : position.baseFret - 1 + df;
              void playStringNote(si, actual);
            }}
          />
        ) : (
          <div className="py-10 text-sm text-muted-foreground sm:py-16">
            Play to sync chords
          </div>
        )}
      </div>

      <div className="mb-4 rounded-lg border border-border bg-card p-3 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <button
            type="button"
            onClick={() => {
              void toggle();
            }}
            className="mx-auto flex h-12 w-12 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 sm:mx-0"
            aria-label={playState === "playing" ? "Pause" : "Play"}
          >
            {playState === "playing" ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="ml-0.5 h-5 w-5" />
            )}
          </button>
          <div className="min-w-0 flex-1">
            <input
              type="range"
              min={0}
              max={duration || meta.duration || 1}
              step={0.05}
              value={currentTime}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                seek(Number(e.target.value))
              }
              className="w-full accent-primary"
              aria-label="Seek"
            />
            <div className="mt-1 flex justify-between font-musical text-xs text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration || meta.duration)}</span>
            </div>
          </div>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        {playState === "error" && (
          <p className="mt-2 text-xs text-destructive">
            Unable to play this audio source.
          </p>
        )}
      </div>

      <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
        <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
          Chord timeline
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
          {meta.cues
            .filter((c, i, arr) => i === 0 || c.chord !== arr[i - 1]?.chord)
            .slice(0, 48)
            .map((cue, i) => {
              const key = normaliseKey(cue.chord);
              const isActive =
                activeCue !== null &&
                cue.start <= currentTime &&
                currentTime < cue.end;
              return (
                <button
                  key={`${cue.start}-${i}`}
                  type="button"
                  onClick={() => {
                    seek(cue.start);
                    void play();
                  }}
                  className={`min-h-[56px] min-w-[64px] shrink-0 rounded-lg px-3 text-center transition-all ${
                    isActive
                      ? "border border-primary bg-primary/20"
                      : "border border-transparent bg-secondary hover:bg-surface-hover"
                  }`}
                >
                  <div className="text-chord text-sm">{key}</div>
                  <div className="font-musical text-[10px] text-muted-foreground">
                    {cue.start.toFixed(0)}s
                  </div>
                </button>
              );
            })}
        </div>
      </div>

      {(playState === "idle" || playState === "paused") && (
        <button
          type="button"
          className="sr-only"
          onClick={() => {
            void play();
          }}
        >
          Unlock audio
        </button>
      )}
    </div>
  );
};

export default PlayerPage;
