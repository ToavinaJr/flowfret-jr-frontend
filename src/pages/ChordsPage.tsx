import { useMemo, useState, type ChangeEvent } from "react";
import { Search, Play } from "lucide-react";
import { ChordDiagram } from "@/components/features/chords/ChordDiagram";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import {
  categorizeSuffix,
  formatChordLabel,
  getChordPosition,
  getChordsByKey,
  getKeys,
  getSuffixesByKey,
} from "@/utils/chords";
import { playStringNote, strumChord } from "@/utils/stringSound";
import { useTranslation } from "react-i18next";

type CategoryFilter = "All" | "Major" | "Minor" | "7th" | "Other";

const CATEGORIES: CategoryFilter[] = ["All", "Major", "Minor", "7th", "Other"];

const ChordsPage = () => {
  const { t } = useTranslation();
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
    <div className={PAGE_SHELL}>
      <h1 className={PAGE_TITLE}>{t("chords.title")}</h1>

      <div className="relative mb-3 sm:mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          id="chord-search"
          name="chordSearch"
          type="text"
          placeholder={t("chords.searchPlaceholder")}
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="w-full min-h-[44px] rounded-lg border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      <div className="-mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1 sm:mb-4">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              setSelectedKey(key);
              setSelectedSuffix(null);
              setPositionIndex(0);
            }}
            className={`min-h-[44px] min-w-[44px] shrink-0 rounded-md px-3 text-xs font-medium transition-colors ${
              selectedKey === key
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {key}
          </button>
        ))}
      </div>

      <div className="-mx-1 mb-4 flex gap-2 overflow-x-auto px-1 pb-1 sm:mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            className={`min-h-[44px] shrink-0 rounded-md px-3 text-xs font-medium transition-colors ${
              category === cat
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
        <div className="order-2 max-h-[50vh] overflow-x-hidden overflow-y-auto pr-1 lg:order-1 lg:max-h-[480px]">
          <div className="grid grid-cols-[repeat(auto-fill,minmax(8.5rem,1fr))] gap-2">
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
                  className={`flex min-h-[64px] flex-col items-center justify-center rounded-lg px-2 py-2.5 text-center transition-colors ${
                    isActive
                      ? "border border-primary bg-primary/20 text-foreground"
                      : "border border-border bg-card text-foreground hover:bg-surface-elevated"
                  }`}
                >
                  <span className="w-full font-musical text-sm font-bold uppercase leading-snug tracking-tight [overflow-wrap:anywhere] sm:text-[0.9375rem]">
                    {name}
                  </span>
                  <span className="mt-1 text-[10px] text-muted-foreground">
                    {categorizeSuffix(suffix)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="order-1 flex flex-col items-center lg:order-2">
          {position ? (
            <div className="w-full max-w-sm lg:sticky lg:top-6">
              <div className="flex flex-col items-center rounded-lg border border-border bg-card p-4 sm:p-6">
                <ChordDiagram
                  chord={label}
                  position={position}
                  onStringPress={(si, df) => {
                    void handleStringPress(si, df);
                  }}
                />
                <div className="mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    className="min-h-[44px] min-w-[44px] rounded-md bg-secondary px-3 text-sm disabled:opacity-40"
                    disabled={positionIndex <= 0}
                    onClick={() => setPositionIndex((i) => Math.max(0, i - 1))}
                  >
                    ←
                  </button>
                  <span className="text-xs font-musical text-muted-foreground">
                    {t("chords.voicing")} {positionIndex + 1}/
                    {chord?.positions.length ?? 1}
                  </span>
                  <button
                    type="button"
                    className="min-h-[44px] min-w-[44px] rounded-md bg-secondary px-3 text-sm disabled:opacity-40"
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
                  className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Play className="h-4 w-4" />
                  {t("chords.strum")}
                </button>
              </div>
            </div>
          ) : (
            <div className="py-8 text-sm text-muted-foreground sm:py-12">
              {t("chords.selectPrompt")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChordsPage;
