import { useEffect, useMemo, useState } from "react";
import { Pause, Play, SkipBack } from "lucide-react";
import { ChordDiagram } from "@/components/features/chords/ChordDiagram";
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

  const { playState, currentTime, duration, play, pause, seek, toggle } =
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
    <div className="px-4 py-6 pb-20 md:pb-6 max-w-3xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-display text-foreground">{meta.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {uniqueChords.length} chords · {formatTime(meta.duration)}
            {imported ? " · Imported" : " · Demo track"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => seek(0)}
          className="min-h-[44px] min-w-[44px] rounded-md bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground"
          aria-label="Restart"
        >
          <SkipBack className="h-4 w-4" />
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 mb-4 flex justify-center">
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
          <div className="text-muted-foreground text-sm py-16">
            Play to sync chords
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg p-4 mb-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => {
              void toggle();
            }}
            className="h-12 w-12 min-h-[44px] min-w-[44px] rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity"
            aria-label={playState === "playing" ? "Pause" : "Play"}
          >
            {playState === "playing" ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5 ml-0.5" />
            )}
          </button>
          <div className="flex-1">
            <input
              type="range"
              min={0}
              max={duration || meta.duration || 1}
              step={0.05}
              value={currentTime}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                seek(Number(e.target.value))
              }
              className="w-full accent-primary"
              aria-label="Seek"
            />
            <div className="flex justify-between mt-1 text-xs font-musical text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration || meta.duration)}</span>
            </div>
          </div>
        </div>
        <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        {playState === "error" && (
          <p className="text-xs text-destructive mt-2">
            Unable to play this audio source.
          </p>
        )}
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
          Chord timeline
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
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
                  className={`min-h-[56px] min-w-[64px] px-3 rounded-lg text-center transition-all ${
                    isActive
                      ? "bg-primary/20 border border-primary"
                      : "bg-secondary border border-transparent hover:bg-surface-hover"
                  }`}
                >
                  <div className="text-chord text-sm">{key}</div>
                  <div className="text-[10px] font-musical text-muted-foreground">
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
