import { useState } from "react";
import { Mic, MicOff } from "lucide-react";

const NOTES = ["E2", "A2", "D3", "G3", "B3", "E4"];

const MiniTuner = () => {
  const [isActive, setIsActive] = useState(false);
  const [currentNote] = useState("A4");
  const [frequency] = useState(440.0);
  const [cents] = useState(0);

  return (
    <div className="rounded-lg bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground uppercase tracking-wider">Quick Tune</span>
        <button
          onClick={() => setIsActive(!isActive)}
          className={`p-1.5 rounded-md transition-colors ${
            isActive ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"
          }`}
        >
          {isActive ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="text-center py-2">
        <div className="font-musical text-2xl font-bold text-foreground">{currentNote}</div>
        <div className="font-musical text-xs text-muted-foreground mt-0.5">
          {frequency.toFixed(1)}Hz · {cents > 0 ? "+" : ""}{cents}¢
        </div>
      </div>

      {/* String indicators */}
      <div className="flex gap-1 mt-2">
        {NOTES.map((note) => (
          <div
            key={note}
            className="flex-1 text-center py-1 rounded text-xs font-musical bg-secondary text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
          >
            {note.replace(/\d/, "")}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiniTuner;
