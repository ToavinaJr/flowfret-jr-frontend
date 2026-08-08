import { Mic, MicOff } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { playStringNote } from "@/utils/stringSound";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
    <div className={PAGE_SHELL}>
      <h1 className={PAGE_TITLE}>{t("tuner.title")}</h1>

      <div className="mb-4 flex flex-wrap gap-2 sm:mb-6 md:mb-8">
        <button
          type="button"
          onClick={() => setMode("auto")}
          className={`min-h-[44px] flex-1 rounded-md px-3 text-xs font-medium transition-colors sm:flex-none ${
            mode === "auto"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          {t("tuner.automatic")}
        </button>
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`min-h-[44px] flex-1 rounded-md px-3 text-xs font-medium transition-colors sm:flex-none ${
            mode === "manual"
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          {t("tuner.manual")}
        </button>
      </div>

      <div
        className={`mb-4 rounded-lg border border-border bg-card p-4 transition-colors sm:mb-6 sm:p-6 md:p-8 ${
          isInTune ? "animate-pulse-tune" : ""
        }`}
      >
        <div className="relative mx-auto h-28 w-full max-w-xs overflow-hidden sm:h-32 sm:max-w-sm">
          <div className="absolute inset-0 rounded-t-full border-l-[3px] border-r-[3px] border-t-[3px] border-border" />
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
            className="absolute bottom-0 left-1/2 h-24 w-0.5 origin-bottom rounded-t-full sm:h-28"
            style={{
              backgroundColor: isInTune
                ? "hsl(var(--accent))"
                : "hsl(var(--primary))",
              marginLeft: "-1px",
            }}
            animate={{ rotate: needleRotation }}
            transition={{ type: "tween", duration: 0.1 }}
          />
          <div className="absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-foreground" />
        </div>

        <div className="mt-4 text-center sm:mt-6">
          <div className="font-musical text-3xl font-bold text-foreground sm:text-4xl">
            {displayNote}
          </div>
          <div className="mt-1 font-musical text-sm text-muted-foreground">
            {displayFreq.toFixed(1)}Hz · {cents > 0 ? "+" : ""}
            {cents}¢
          </div>
          {isInTune && (
            <div className="mt-2 text-xs font-medium text-accent">{t("tuner.inTune")}</div>
          )}
        </div>
      </div>

      <div className="mb-4 flex justify-center sm:mb-6 md:mb-8">
        <button
          type="button"
          onClick={() => {
            void toggle();
          }}
          className={`flex h-14 w-14 min-h-[44px] min-w-[44px] items-center justify-center rounded-full transition-all ${
            isListening
              ? "bg-primary text-primary-foreground shadow-[0_0_20px_-5px] shadow-primary"
              : "border border-border bg-card text-muted-foreground hover:text-foreground"
          }`}
          aria-label={t(isListening ? "tuner.stopMicrophone" : "tuner.startMicrophone")}
        >
          {isListening ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </button>
      </div>

      {error && (
        <p className="mb-4 text-center text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="rounded-lg border border-border bg-card p-3 sm:p-4">
        <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
          {t(mode === "manual" ? "tuner.selectString" : "tuner.referenceStrings")}
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {STRINGS.map((s, i) => (
            <button
              key={s.note}
              type="button"
              onClick={() => {
                if (mode === "manual") setSelectedString(i);
                void playStringNote(s.stringIdx, s.fret);
              }}
              className={`min-h-[56px] rounded-md py-3 text-center transition-colors ${
                selectedString === i && mode === "manual"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-surface-hover"
              }`}
            >
              <div className="font-musical text-sm font-bold">{s.note}</div>
              <div className="mt-0.5 font-musical text-[10px] text-muted-foreground">
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
