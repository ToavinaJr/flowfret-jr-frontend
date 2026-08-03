import { useMemo, useState } from "react";
import { Search, Play } from "lucide-react";
import { ChordDiagram } from "@/components/features/chords/ChordDiagram";
import {
  categorizeSuffix,
  formatChordLabel,
  getChordPosition,
  getChordsByKey,
  getKeys,
  getSuffixesByKey,
} from "@/utils/chords";
import { playStringNote, strumChord } from "@/utils/stringSound";

type CategoryFilter = "All" | "Major" | "Minor" | "7th" | "Other";

const CATEGORIES: CategoryFilter[] = ["All", "Major", "Minor", "7th", "Other"];

const ChordsPage = () => {
  const keys = useMemo(() => getKeys(), []);
  const [selectedKey, setSelectedKey] = useState(keys[0] ?? "C");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("All");
  const [selectedSuffix, setSelectedSuffix] = useState<string | null>(null);
  const [positionIndex, setPositionIndex] = useState(0);

  const suffixes = useMemo(() => getSuffixesByKey(selectedKey), [selectedKey]);

  const filteredSuffixes = useMemo(() => {
    return suffixes.filter((suffix) => {
      const label = formatChordLabel(selectedKey, suffix).toLowerCase();
      const matchSearch =
        search.trim() === "" ||
        label.includes(search.toLowerCase()) ||
        suffix.toLowerCase().includes(search.toLowerCase());
      const cat = categorizeSuffix(suffix);
      const matchCat = category === "All" || cat === category;
      return matchSearch && matchCat;
    });
  }, [suffixes, selectedKey, search, category]);

  const activeSuffix = selectedSuffix ?? filteredSuffixes[0] ?? "major";
  const chord = getChordsByKey(selectedKey).find((c) => c.suffix === activeSuffix);
  const position = getChordPosition(selectedKey, activeSuffix, positionIndex);
  const label = formatChordLabel(selectedKey, activeSuffix);

  async function handleStringPress(stringIndex: number, diagramFret: number) {
    if (!position || diagramFret < 0) return;
    const actualFret =
      diagramFret === 0 ? 0 : position.baseFret - 1 + diagramFret;
    await playStringNote(stringIndex, actualFret);
  }

  async function handleStrum() {
    if (!position) return;
    await strumChord(position.frets, position.baseFret);
  }

  return (
    <div className="px-4 py-6 pb-20 md:pb-6">
      <h1 className="text-display text-foreground mb-6">Chord Explorer</h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search chords... (Am, Cmaj7, F#dim)"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
          className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setSelectedKey(key);
              setSelectedSuffix(null);
              setPositionIndex(0);
            }}
            className={`min-h-[44px] min-w-[44px] px-3 rounded-md text-xs font-medium transition-colors ${
              selectedKey === key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`min-h-[44px] px-3 rounded-md text-xs font-medium transition-colors ${
              category === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[480px] overflow-y-auto pr-1">
          {filteredSuffixes.map((suffix) => {
            const name = formatChordLabel(selectedKey, suffix);
            const isActive = activeSuffix === suffix;
            return (
              <button
                key={suffix}
                type="button"
                onClick={() => {
                  setSelectedSuffix(suffix);
                  setPositionIndex(0);
                }}
                className={`min-h-[64px] py-3 rounded-lg text-center transition-all ${
                  isActive
                    ? "bg-primary/20 border border-primary text-foreground"
                    : "bg-card border border-border text-foreground hover:bg-surface-elevated"
                }`}
              >
                <div className="text-chord text-lg">{name}</div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  {categorizeSuffix(suffix)}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col items-center">
          {position ? (
            <div className="sticky top-6 w-full max-w-sm">
              <div className="bg-card rounded-lg border border-border p-6 flex flex-col items-center">
                <ChordDiagram
                  chord={label}
                  position={position}
                  onStringPress={(si, df) => {
                    void handleStringPress(si, df);
                  }}
                />
                <div className="flex items-center gap-2 mt-4">
                  <button
                    type="button"
                    className="min-h-[44px] min-w-[44px] px-3 rounded-md bg-secondary text-sm disabled:opacity-40"
                    disabled={positionIndex <= 0}
                    onClick={() => setPositionIndex((i) => Math.max(0, i - 1))}
                  >
                    ←
                  </button>
                  <span className="text-xs font-musical text-muted-foreground">
                    Voicing {positionIndex + 1}/
                    {chord?.positions.length ?? 1}
                  </span>
                  <button
                    type="button"
                    className="min-h-[44px] min-w-[44px] px-3 rounded-md bg-secondary text-sm disabled:opacity-40"
                    disabled={
                      !chord || positionIndex >= chord.positions.length - 1
                    }
                    onClick={() =>
                      setPositionIndex((i) =>
                        chord
                          ? Math.min(chord.positions.length - 1, i + 1)
                          : i,
                      )
                    }
                  >
                    →
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    void handleStrum();
                  }}
                  className="mt-4 min-h-[44px] px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium inline-flex items-center gap-2 hover:opacity-90 transition-opacity"
                >
                  <Play className="h-4 w-4" />
                  Strum
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground py-12">
              Select a chord to preview
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChordsPage;
