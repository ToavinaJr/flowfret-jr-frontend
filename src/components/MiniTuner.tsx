import { Mic, MicOff } from "lucide-react";
import { usePitchDetection } from "@/hooks/usePitchDetection";
import { playStringNote } from "@/utils/stringSound";

const NOTES = [
  { label: "E", stringIdx: 0, fret: 0 },
  { label: "A", stringIdx: 1, fret: 0 },
  { label: "D", stringIdx: 2, fret: 0 },
  { label: "G", stringIdx: 3, fret: 0 },
  { label: "B", stringIdx: 4, fret: 0 },
  { label: "e", stringIdx: 5, fret: 0 },
];

const MiniTuner = () => {
  const { isListening, reading, toggle } = usePitchDetection();
  const note = reading?.note ?? "—";
  const frequency = reading?.frequency ?? 0;
  const cents = reading?.cents ?? 0;

  return (
    <div className="rounded-lg bg-card p-3 border border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">
          Quick Tune
        </span>
        <button
          type="button"
          onClick={() => {
            void toggle();
          }}
          className={`p-1.5 min-h-[44px] min-w-[44px] rounded-md transition-colors inline-flex items-center justify-center ${
            isListening
              ? "bg-primary/20 text-primary"
              : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
          aria-label={isListening ? "Stop tuner" : "Start tuner"}
        >
          {isListening ? (
            <Mic className="h-3.5 w-3.5" />
          ) : (
            <MicOff className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      <div className="text-center py-2">
        <div className="font-musical text-2xl font-bold text-foreground">{note}</div>
        <div className="font-musical text-xs text-muted-foreground mt-0.5">
          {frequency > 0 ? `${frequency.toFixed(1)}Hz · ${cents > 0 ? "+" : ""}${cents}¢` : "Tap mic"}
        </div>
      </div>

      <div className="flex gap-1 mt-2">
        {NOTES.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              void playStringNote(item.stringIdx, item.fret);
            }}
            className="flex-1 min-h-[36px] text-center py-1 rounded text-xs font-musical bg-secondary text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MiniTuner;
