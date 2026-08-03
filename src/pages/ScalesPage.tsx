import { SCALES } from "@/constants/scalesConstants";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
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
    <div className={PAGE_SHELL}>
      <h1 className={`${PAGE_TITLE} mb-2`}>Scales</h1>
      <p className="mb-4 text-sm text-muted-foreground sm:mb-6">
        Explore modes on the fretboard — tap notes to hear them.
      </p>

      <div className="mb-3 rounded-lg border border-border bg-card p-3 sm:mb-4 sm:p-4">
        <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
          Root
        </div>
        <div className="flex flex-wrap gap-2">
          {availableKeys.map((key) => (
            <button
              key={key.label}
              type="button"
              onClick={() => changeKey(key)}
              className={`min-h-[44px] min-w-[44px] rounded-md px-3 text-sm font-medium transition-colors ${
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

      <div className="mb-4 rounded-lg border border-border bg-card p-3 sm:mb-6 sm:p-4">
        <div className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">
          Scale
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {availableScales.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => changeScale(id)}
              className={`min-h-[44px] rounded-md px-3 text-left text-sm transition-colors ${
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

      <div className="mb-4 overflow-x-auto rounded-lg border border-border bg-card p-3 sm:p-4">
        <ScaleFretboard
          rootIndex={selectedKey.index}
          scaleIntervals={scale.intervals}
        />
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        {scaleNotes.map((note) => (
          <span
            key={note}
            className="inline-flex min-h-[36px] items-center rounded-md bg-secondary px-3 font-musical text-sm text-foreground"
          >
            {note}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ScalesPage;
