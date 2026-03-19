import { useState } from "react";
import { Search } from "lucide-react";
import Fretboard from "@/components/Fretboard";

interface ChordData {
  name: string;
  notes: { string: number; fret: number }[];
  category: string;
}

const CHORDS: ChordData[] = [
  { name: "Am", notes: [{ string: 1, fret: 1 }, { string: 2, fret: 2 }, { string: 3, fret: 2 }], category: "Minor" },
  { name: "C", notes: [{ string: 1, fret: 1 }, { string: 3, fret: 2 }, { string: 4, fret: 3 }], category: "Major" },
  { name: "G", notes: [{ string: 0, fret: 3 }, { string: 4, fret: 2 }, { string: 5, fret: 3 }], category: "Major" },
  { name: "Em", notes: [{ string: 3, fret: 2 }, { string: 4, fret: 2 }], category: "Minor" },
  { name: "Dm", notes: [{ string: 0, fret: 1 }, { string: 1, fret: 3 }, { string: 2, fret: 2 }], category: "Minor" },
  { name: "F", notes: [{ string: 0, fret: 1 }, { string: 1, fret: 1 }, { string: 2, fret: 2 }, { string: 3, fret: 3 }], category: "Major" },
  { name: "Am7", notes: [{ string: 1, fret: 1 }, { string: 2, fret: 2 }], category: "7th" },
  { name: "Cmaj7", notes: [{ string: 3, fret: 2 }, { string: 4, fret: 3 }], category: "7th" },
  { name: "D7", notes: [{ string: 0, fret: 1 }, { string: 1, fret: 2 }, { string: 2, fret: 2 }], category: "7th" },
  { name: "E7", notes: [{ string: 2, fret: 1 }, { string: 3, fret: 2 }], category: "7th" },
  { name: "Bm", notes: [{ string: 0, fret: 2 }, { string: 1, fret: 2 }, { string: 2, fret: 4 }, { string: 3, fret: 4 }, { string: 4, fret: 4 }], category: "Minor" },
  { name: "A", notes: [{ string: 1, fret: 2 }, { string: 2, fret: 2 }, { string: 3, fret: 2 }], category: "Major" },
];

const CATEGORIES = ["All", "Major", "Minor", "7th"];

const ChordsPage = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedChord, setSelectedChord] = useState<ChordData | null>(null);

  const filtered = CHORDS.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || c.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="px-4 py-6 pb-20 md:pb-6">
      <h1 className="text-display text-foreground mb-6">Chord Explorer</h1>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search chords... (Am, Cmaj7, F#dim)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
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
        {/* Chord grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {filtered.map((chord) => (
            <button
              key={chord.name}
              onClick={() => setSelectedChord(chord)}
              className={`py-4 rounded-lg text-center transition-all ${
                selectedChord?.name === chord.name
                  ? "bg-primary/20 border border-primary text-foreground"
                  : "bg-card border border-border text-foreground hover:bg-surface-elevated"
              }`}
            >
              <div className="text-chord text-lg">{chord.name}</div>
              <div className="text-[10px] text-muted-foreground mt-1">{chord.category}</div>
            </button>
          ))}
        </div>

        {/* Selected chord detail */}
        <div className="flex justify-center">
          {selectedChord ? (
            <div className="sticky top-6">
              <Fretboard
                activeNotes={selectedChord.notes}
                chordName={selectedChord.name}
                numFrets={5}
              />
              <div className="mt-4 text-center">
                <span className="text-xs text-muted-foreground">Category: </span>
                <span className="text-xs text-foreground">{selectedChord.category}</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
              Select a chord to view
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChordsPage;
