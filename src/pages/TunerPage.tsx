import { Mic, MicOff } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { playStringNote } from "@/utils/stringSound";

const STRINGS = [
  { note: "E4", freq: 329.63, stringIdx: 5, fret: 0 },
  { note: "B3", freq: 246.94, stringIdx: 4, fret: 0 },
  { note: "G3", freq: 196.0, stringIdx: 3, fret: 0 },
  { note: "D3", freq: 146.83, stringIdx: 2, fret: 0 },
  { note: "A2", freq: 110.0, stringIdx: 1, fret: 0 },
  { note: "E2", freq: 82.41, stringIdx: 0, fret: 0 },
];

type TunerMode = "auto" | "manual";

const TunerPage = () => {
  const { isListening, reading, error, toggle } = usePitchDetection();
  const [selectedString, setSelectedString] = useState<number | null>(null);
  const [mode, setMode] = useState<TunerMode>("auto");

  const target = useMemo(() => {
    if (mode === "manual" && selectedString !== null) {
      return STRINGS[selectedString];
    }
    if (!reading) return null;
    let best = STRINGS[0];
    let bestDiff = Math.abs(Math.log2(reading.frequency / best.freq));
    for (const s of STRINGS) {
      const diff = Math.abs(Math.log2(reading.frequency / s.freq));
      if (diff < bestDiff) {
        best = s;
        bestDiff = diff;
      }
    }
    return best;
  }, [mode, selectedString, reading]);

  const cents = useMemo(() => {
    if (!reading || !target) return 0;
    return Math.round(1200 * Math.log2(reading.frequency / target.freq));
  }, [reading, target]);

  const displayNote = reading?.note ?? target?.note ?? "—";
  const displayFreq = reading?.frequency ?? target?.freq ?? 0;
  const isInTune = Math.abs(cents) <= 5 && isListening && reading !== null;
  const needleRotation = Math.max(-45, Math.min(45, cents / 2));

  return (
    <div className="max-w-[600px] mx-auto px-4 py-6 pb-20 md:pb-6">
      <h1 className="text-display text-foreground mb-6">Guitar Tuner</h1>

      <div className="flex gap-2 mb-8">
        <button
          type="button"
          onClick={() => setMode("auto")}
          className={`min-h-[44px] px-3 rounded-md text-xs font-medium transition-colors ${
            mode === "auto"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          Automatic
        </button>
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`min-h-[44px] px-3 rounded-md text-xs font-medium transition-colors ${
            mode === "manual"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          Manual
        </button>
      </div>

      <div
        className={`bg-card border border-border rounded-lg p-8 mb-6 transition-colors ${
          isInTune ? "animate-pulse-tune" : ""
        }`}
      >
        <div className="relative mx-auto w-64 h-32 overflow-hidden">
          <div className="absolute inset-0 border-t-[3px] border-l-[3px] border-r-[3px] border-border rounded-t-full" />
          {Array.from({ length: 21 }).map((_, i) => {
            const angle = -90 + (i * 180) / 20;
            const isMajor = i % 5 === 0;
            return (
              <div
                key={i}
                className="absolute bottom-0 left-1/2 origin-bottom"
                style={{
                  transform: `rotate(${angle}deg)`,
                  height: isMajor ? "16px" : "8px",
                  width: isMajor ? "2px" : "1px",
                  backgroundColor: `hsl(var(--muted-foreground) / ${isMajor ? 0.6 : 0.3})`,
                }}
              />
            );
          })}
          <span className="absolute bottom-1 left-4 text-xs font-musical text-muted-foreground">
            ♭
          </span>
          <span className="absolute bottom-1 right-4 text-xs font-musical text-muted-foreground">
            ♯
          </span>
          <motion.div
            className="absolute bottom-0 left-1/2 origin-bottom w-0.5 h-28 rounded-t-full"
            style={{
              backgroundColor: isInTune
                ? "hsl(var(--accent))"
                : "hsl(var(--primary))",
              marginLeft: "-1px",
            }}
            animate={{ rotate: needleRotation }}
            transition={{ type: "tween", duration: 0.1 }}
          />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-3 w-3 rounded-full bg-foreground" />
        </div>

        <div className="text-center mt-6">
          <div className="font-musical text-4xl font-bold text-foreground">
            {displayNote}
          </div>
          <div className="font-musical text-sm text-muted-foreground mt-1">
            {displayFreq.toFixed(1)}Hz · {cents > 0 ? "+" : ""}
            {cents}¢
          </div>
          {isInTune && (
            <div className="text-xs text-accent font-medium mt-2">In Tune ✓</div>
          )}
        </div>
      </div>

      <div className="flex justify-center mb-8">
        <button
          type="button"
          onClick={() => {
            void toggle();
          }}
          className={`h-14 w-14 min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center transition-all ${
            isListening
              ? "bg-primary text-primary-foreground shadow-[0_0_20px_-5px] shadow-primary"
              : "bg-card text-muted-foreground border border-border hover:text-foreground"
          }`}
          aria-label={isListening ? "Stop microphone" : "Start microphone"}
        >
          {isListening ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </button>
      </div>

      {error && (
        <p className="text-center text-sm text-destructive mb-4" role="alert">
          {error}
        </p>
      )}

      <div className="bg-card border border-border rounded-lg p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
          {mode === "manual" ? "Select String" : "Reference strings"}
        </div>
        <div className="grid grid-cols-6 gap-2">
          {STRINGS.map((s, i) => (
            <button
              key={s.note}
              type="button"
              onClick={() => {
                if (mode === "manual") setSelectedString(i);
                void playStringNote(s.stringIdx, s.fret);
              }}
              className={`min-h-[56px] py-3 rounded-md text-center transition-colors ${
                selectedString === i && mode === "manual"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-surface-hover"
              }`}
            >
              <div className="font-musical text-sm font-bold">{s.note}</div>
              <div className="font-musical text-[10px] text-muted-foreground mt-0.5">
                {s.freq}Hz
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TunerPage;
