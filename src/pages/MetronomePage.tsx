import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";
import { Minus, Plus, Play, Square } from "lucide-react";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
    const ms = 60_000 / bpmRef.current;
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
    const avg = intervals.reduce((sum, v) => sum + v, 0) / intervals.length;
    const nextBpm = Math.round(60_000 / avg);
    setBpm(Math.min(MAX_BPM, Math.max(MIN_BPM, nextBpm)));
  }

  return (
    <div className={`${PAGE_SHELL} max-w-lg lg:max-w-lg`}>
      <h1 className={PAGE_TITLE}>{t("metronome.title")}</h1>

      <div className="mb-4 rounded-lg border border-border bg-card p-4 text-center sm:mb-6 sm:p-6 md:p-8">
        <div className="mb-2 text-xs text-muted-foreground">
          BPM
        </div>
        <div className="mb-4 font-musical text-4xl text-foreground sm:mb-6 sm:text-5xl md:text-6xl">
          {bpm}
        </div>

        <div className="mb-6 flex items-center justify-center gap-2 sm:mb-8 sm:gap-4">
          <button
            type="button"
            onClick={() => adjustBpm(-1)}
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-secondary hover:bg-surface-hover sm:h-12 sm:w-12"
            aria-label={t("metronome.decrease")}
          >
            <Minus className="h-5 w-5" />
          </button>
          <input
            id="metronome-bpm"
            name="bpm"
            type="range"
            min={MIN_BPM}
            max={MAX_BPM}
            value={bpm}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setBpm(Number(e.target.value))
            }
            className="w-full max-w-[8rem] accent-primary sm:max-w-[12rem] md:max-w-[14rem]"
            aria-label={t("metronome.bpm")}
          />
          <button
            type="button"
            onClick={() => adjustBpm(1)}
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-secondary hover:bg-surface-hover sm:h-12 sm:w-12"
            aria-label={t("metronome.increase")}
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 flex justify-center gap-2 sm:mb-8">
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
          className="inline-flex h-14 w-14 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:opacity-90 sm:h-16 sm:w-16"
          aria-label={t(isPlaying ? "metronome.stop" : "metronome.start")}
        >
          {isPlaying ? (
            <Square className="h-6 w-6" />
          ) : (
            <Play className="ml-0.5 h-6 w-6" />
          )}
        </button>
      </div>

      <div className="mb-4 rounded-lg border border-border bg-card p-3 sm:p-4">
        <div className="mb-3 text-xs text-muted-foreground">
          {t("metronome.timeSignature")}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {BEATS_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setBeats(option)}
              className={`min-h-[44px] rounded-md text-sm font-medium transition-colors ${
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
        className="w-full min-h-[52px] rounded-lg bg-secondary font-medium text-foreground transition-colors hover:bg-surface-hover"
      >
        {t("metronome.tapTempo")}
      </button>
    </div>
  );
};

export default MetronomePage;
