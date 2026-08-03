import { useCallback, useEffect, useRef, useState } from "react";
import { Minus, Plus, Play, Square } from "lucide-react";
import { playClick } from "@/utils/stringSound";
import {
  registerAudioOwner,
  releaseAudioOwner,
  requestAudioOwner,
} from "@/utils/audioPriority";

const MIN_BPM = 40;
const MAX_BPM = 220;
const BEATS_OPTIONS = [2, 3, 4, 6] as const;
type BeatsPerMeasure = (typeof BEATS_OPTIONS)[number];

const MetronomePage = () => {
  const [bpm, setBpm] = useState(100);
  const [beats, setBeats] = useState<BeatsPerMeasure>(4);
  const [isPlaying, setIsPlaying] = useState(false);
  const [beatIndex, setBeatIndex] = useState(0);
  const [tapTimes, setTapTimes] = useState<number[]>([]);

  const intervalRef = useRef<number | null>(null);
  const beatRef = useRef(0);
  const bpmRef = useRef(bpm);
  const beatsRef = useRef(beats);

  useEffect(() => {
    bpmRef.current = bpm;
  }, [bpm]);

  useEffect(() => {
    beatsRef.current = beats;
  }, [beats]);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPlaying(false);
    setBeatIndex(0);
    beatRef.current = 0;
    releaseAudioOwner("metronome");
  }, []);

  const tick = useCallback(() => {
    const accent = beatRef.current === 0;
    void playClick(accent);
    setBeatIndex(beatRef.current);
    beatRef.current = (beatRef.current + 1) % beatsRef.current;
  }, []);

  const start = useCallback(() => {
    stop();
    requestAudioOwner("metronome");
    setIsPlaying(true);
    beatRef.current = 0;
    tick();
    const ms = (60_000 / bpmRef.current);
    intervalRef.current = window.setInterval(() => {
      tick();
    }, ms);
  }, [stop, tick]);

  useEffect(() => {
    const unregister = registerAudioOwner("metronome", stop);
    return () => {
      unregister();
      stop();
    };
  }, [stop]);

  useEffect(() => {
    if (!isPlaying) return;
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
    }
    const ms = 60_000 / bpm;
    intervalRef.current = window.setInterval(() => {
      tick();
    }, ms);
  }, [bpm, isPlaying, tick]);

  function adjustBpm(delta: number) {
    setBpm((prev) => Math.min(MAX_BPM, Math.max(MIN_BPM, prev + delta)));
  }

  function handleTapTempo() {
    const now = performance.now();
    const next = [...tapTimes, now].filter((t) => now - t < 3000).slice(-6);
    setTapTimes(next);
    if (next.length < 2) return;
    const intervals: number[] = [];
    for (let i = 1; i < next.length; i++) {
      intervals.push(next[i] - next[i - 1]);
    }
    const avg =
      intervals.reduce((sum, v) => sum + v, 0) / intervals.length;
    const nextBpm = Math.round(60_000 / avg);
    setBpm(Math.min(MAX_BPM, Math.max(MIN_BPM, nextBpm)));
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-20 md:pb-6">
      <h1 className="text-display text-foreground mb-8">Metronome</h1>

      <div className="bg-card border border-border rounded-lg p-8 text-center mb-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
          BPM
        </div>
        <div className="text-6xl font-musical text-foreground mb-6">{bpm}</div>

        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            type="button"
            onClick={() => adjustBpm(-1)}
            className="h-12 w-12 min-h-[44px] min-w-[44px] rounded-full bg-secondary flex items-center justify-center hover:bg-surface-hover"
            aria-label="Decrease BPM"
          >
            <Minus className="h-5 w-5" />
          </button>
          <input
            type="range"
            min={MIN_BPM}
            max={MAX_BPM}
            value={bpm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setBpm(Number(e.target.value))
            }
            className="flex-1 max-w-[200px] accent-primary"
            aria-label="BPM"
          />
          <button
            type="button"
            onClick={() => adjustBpm(1)}
            className="h-12 w-12 min-h-[44px] min-w-[44px] rounded-full bg-secondary flex items-center justify-center hover:bg-surface-hover"
            aria-label="Increase BPM"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="flex justify-center gap-2 mb-8">
          {Array.from({ length: beats }, (_, i) => (
            <div
              key={i}
              className={`h-3 w-3 rounded-full transition-colors ${
                isPlaying && beatIndex === i
                  ? i === 0
                    ? "bg-primary"
                    : "bg-accent"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            if (isPlaying) stop();
            else start();
          }}
          className="h-16 w-16 min-h-[44px] min-w-[44px] rounded-full bg-primary text-primary-foreground inline-flex items-center justify-center hover:opacity-90 transition-opacity"
          aria-label={isPlaying ? "Stop" : "Start"}
        >
          {isPlaying ? <Square className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
        </button>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 mb-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Time signature
        </div>
        <div className="flex gap-2">
          {BEATS_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setBeats(option)}
              className={`flex-1 min-h-[44px] rounded-md text-sm font-medium transition-colors ${
                beats === option
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {option}/4
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleTapTempo}
        className="w-full min-h-[52px] rounded-lg bg-secondary text-foreground font-medium hover:bg-surface-hover transition-colors"
      >
        Tap Tempo
      </button>
    </div>
  );
};

export default MetronomePage;
