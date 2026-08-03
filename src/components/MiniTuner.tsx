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
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="truncate text-xs uppercase tracking-wider text-muted-foreground">
          Quick Tune
        </span>
        <button
          type="button"
          onClick={() => {
            void toggle();
          }}
          className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md p-1.5 transition-colors ${
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

      <div className="py-2 text-center">
        <div className="font-musical text-xl font-bold text-foreground sm:text-2xl">
          {note}
        </div>
        <div className="mt-0.5 font-musical text-xs text-muted-foreground">
          {frequency > 0
            ? `${frequency.toFixed(1)}Hz · ${cents > 0 ? "+" : ""}${cents}¢`
            : "Tap mic"}
        </div>
      </div>

      <div className="mt-2 grid grid-cols-6 gap-1">
        {NOTES.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => {
              void playStringNote(item.stringIdx, item.fret);
            }}
            className="min-h-[36px] rounded bg-secondary py-1 text-center font-musical text-xs text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MiniTuner;
