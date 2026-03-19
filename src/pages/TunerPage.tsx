import { useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { motion } from "framer-motion";

const STRINGS = [
  { note: "E4", freq: 329.63 },
  { note: "B3", freq: 246.94 },
  { note: "G3", freq: 196.0 },
  { note: "D3", freq: 146.83 },
  { note: "A2", freq: 110.0 },
  { note: "E2", freq: 82.41 },
];

const TunerPage = () => {
  const [isListening, setIsListening] = useState(false);
  const [selectedString, setSelectedString] = useState<number | null>(null);
  const [detectedNote] = useState("A4");
  const [detectedFreq] = useState(440.0);
  const [cents] = useState(2);
  const [mode, setMode] = useState<"auto" | "manual">("auto");

  const isInTune = Math.abs(cents) <= 2;
  const needleRotation = Math.max(-45, Math.min(45, cents * 2));

  return (
    <div className="max-w-[600px] mx-auto px-4 py-6 pb-20 md:pb-6">
      <h1 className="text-display text-foreground mb-6">Guitar Tuner</h1>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-8">
        <button
          onClick={() => setMode("auto")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            mode === "auto" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          }`}
        >
          Automatic
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            mode === "manual" ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
          }`}
        >
          Manual
        </button>
      </div>

      {/* Tuner gauge */}
      <div className={`bg-card rounded-lg p-8 mb-6 transition-colors ${isInTune && isListening ? "animate-pulse-tune" : ""}`}>
        {/* Semi-circle gauge */}
        <div className="relative mx-auto w-64 h-32 overflow-hidden">
          {/* Gauge background */}
          <div className="absolute inset-0 border-t-[3px] border-l-[3px] border-r-[3px] border-border rounded-t-full" />

          {/* Tick marks */}
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

          {/* Labels */}
          <span className="absolute bottom-1 left-4 text-xs font-musical text-muted-foreground">♭</span>
          <span className="absolute bottom-1 right-4 text-xs font-musical text-muted-foreground">♯</span>
          <span className="absolute top-1 left-1/2 -translate-x-1/2 text-xs font-musical text-accent">●</span>

          {/* Needle */}
          <motion.div
            className="absolute bottom-0 left-1/2 origin-bottom w-0.5 h-28 rounded-t-full"
            style={{
              backgroundColor: isInTune ? "hsl(var(--accent))" : "hsl(var(--primary))",
              marginLeft: "-1px",
            }}
            animate={{ rotate: needleRotation }}
            transition={{ type: "tween", duration: 0.1, ease: [0.17, 0.67, 0.83, 0.67] }}
          />

          {/* Center dot */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-0 h-3 w-3 rounded-full bg-foreground" />
        </div>

        {/* Note display */}
        <div className="text-center mt-6">
          <div className="font-musical text-4xl font-bold text-foreground">{detectedNote}</div>
          <div className="font-musical text-sm text-muted-foreground mt-1">
            {detectedFreq.toFixed(1)}Hz · {cents > 0 ? "+" : ""}{cents}¢
          </div>
          {isInTune && isListening && (
            <div className="text-xs text-accent font-medium mt-2">In Tune ✓</div>
          )}
        </div>
      </div>

      {/* Mic button */}
      <div className="flex justify-center mb-8">
        <button
          onClick={() => setIsListening(!isListening)}
          className={`h-14 w-14 rounded-full flex items-center justify-center transition-all ${
            isListening
              ? "bg-primary text-primary-foreground shadow-[0_0_20px_-5px] shadow-primary"
              : "bg-card text-muted-foreground border border-border hover:text-foreground"
          }`}
        >
          {isListening ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </button>
      </div>

      {/* String selector */}
      <div className="bg-card rounded-lg p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
          {mode === "manual" ? "Select String" : "Strings"}
        </div>
        <div className="grid grid-cols-6 gap-2">
          {STRINGS.map((s, i) => (
            <button
              key={i}
              onClick={() => mode === "manual" && setSelectedString(i)}
              className={`py-3 rounded-md text-center transition-colors ${
                selectedString === i && mode === "manual"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-surface-hover"
              }`}
            >
              <div className="font-musical text-sm font-bold">{s.note}</div>
              <div className="font-musical text-[10px] text-muted-foreground mt-0.5">{s.freq}Hz</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TunerPage;
