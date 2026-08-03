import { SCALES } from "@/constants/scalesConstants";
import { ScaleFretboard } from "@/components/features/scales/ScaleFretboard";
import { useScaleNotes } from "@/hooks/useScaleNotes";
import { useScaleSelection } from "@/hooks/useScaleSelection";

const ScalesPage = () => {
  const {
    selectedKey,
    selectedScale,
    changeKey,
    changeScale,
    availableKeys,
    availableScales,
  } = useScaleSelection();
  const { scale, scaleNotes } = useScaleNotes({ selectedKey, selectedScale });

  return (
    <div className="px-4 py-6 pb-20 md:pb-6">
      <h1 className="text-display text-foreground mb-2">Scales</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Explore modes on the fretboard — tap notes to hear them.
      </p>

      <div className="bg-card border border-border rounded-lg p-4 mb-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Root
        </div>
        <div className="flex flex-wrap gap-2">
          {availableKeys.map((key) => (
            <button
              key={key.label}
              type="button"
              onClick={() => changeKey(key)}
              className={`min-h-[44px] min-w-[44px] px-3 rounded-md text-sm font-medium transition-colors ${
                selectedKey.label === key.label
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {key.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">
          Scale
        </div>
        <div className="flex flex-wrap gap-2">
          {availableScales.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => changeScale(id)}
              className={`min-h-[44px] px-3 rounded-md text-sm transition-colors ${
                selectedScale === id
                  ? "bg-accent text-accent-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {SCALES[id].label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-4 mb-4 overflow-x-auto">
        <ScaleFretboard
          rootIndex={selectedKey.index}
          scaleIntervals={scale.intervals}
        />
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {scaleNotes.map((note) => (
          <span
            key={note}
            className="min-h-[36px] px-3 rounded-md bg-secondary text-sm font-musical text-foreground inline-flex items-center"
          >
            {note}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ScalesPage;
