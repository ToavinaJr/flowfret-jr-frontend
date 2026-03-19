import { Upload, Music } from "lucide-react";
import { useState, useRef } from "react";
import Fretboard from "@/components/Fretboard";

const MOCK_CHORDS = [
  { time: 0, chord: "Am7", notes: [{ string: 1, fret: 1 }, { string: 2, fret: 2 }] },
  { time: 2.4, chord: "Dm9", notes: [{ string: 0, fret: 1 }, { string: 1, fret: 3 }, { string: 2, fret: 2 }] },
  { time: 4.8, chord: "G7", notes: [{ string: 0, fret: 1 }, { string: 4, fret: 2 }, { string: 5, fret: 3 }] },
  { time: 7.2, chord: "Cmaj7", notes: [{ string: 3, fret: 2 }, { string: 4, fret: 3 }] },
];

const UploadPage = () => {
  const [dragOver, setDragOver] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [activeChordIdx, setActiveChordIdx] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    setUploaded(true);
  };

  if (uploaded) {
    const activeChord = MOCK_CHORDS[activeChordIdx];
    return (
      <div className="px-4 py-6 pb-20 md:pb-6">
        <h1 className="text-display text-foreground mb-6">Analysis</h1>

        {/* Fretboard visualization */}
        <div className="bg-card rounded-lg p-6 mb-4 flex justify-center">
          <Fretboard
            activeNotes={activeChord.notes}
            chordName={activeChord.chord}
            numFrets={5}
          />
        </div>

        {/* Waveform placeholder */}
        <div className="bg-card rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <button className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <Music className="h-4 w-4 text-primary-foreground" />
            </button>
            <div className="flex-1">
              <div className="text-sm text-foreground">my_riff.mp3</div>
              <div className="text-xs font-musical text-muted-foreground">Detected: 4 chords · 9.6s</div>
            </div>
          </div>
          <div className="h-0.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary w-1/3" />
          </div>
        </div>

        {/* Chord timeline */}
        <div className="bg-card rounded-lg p-4">
          <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Chord Timeline</div>
          <div className="grid grid-cols-4 gap-2">
            {MOCK_CHORDS.map((c, i) => (
              <button
                key={i}
                onClick={() => setActiveChordIdx(i)}
                className={`py-3 rounded-lg text-center transition-all ${
                  i === activeChordIdx
                    ? "bg-primary/20 border border-primary scale-105"
                    : "bg-secondary border border-transparent hover:bg-surface-hover"
                }`}
                style={i === activeChordIdx ? { boxShadow: "0 0 20px -5px rgba(225, 29, 72, 0.3)" } : {}}
              >
                <div className="text-chord text-sm">{c.chord}</div>
                <div className="text-[10px] font-musical text-muted-foreground mt-0.5">{c.time.toFixed(1)}s</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto px-4 py-6 pb-20 md:pb-6">
      <h1 className="text-display text-foreground mb-6">Upload & Analyze</h1>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(); }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
        }`}
      >
        <Upload className={`h-10 w-10 mx-auto mb-4 ${dragOver ? "text-primary" : "text-muted-foreground"}`} />
        <div className="text-sm text-foreground mb-1">Drop your audio file here</div>
        <div className="text-xs text-muted-foreground">MP3, WAV · Max 20MB</div>
        <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={handleUpload} />
      </div>

      <div className="mt-8 bg-card rounded-lg p-4">
        <div className="text-xs text-muted-foreground uppercase tracking-wider mb-3">How it works</div>
        <div className="space-y-3">
          {[
            "Upload your riff, cover, or composition",
            "Our algorithm analyzes the audio signal",
            "View detected chords synced with playback",
            "See real-time fretboard visualization",
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-musical text-muted-foreground">{i + 1}</span>
              </div>
              <span className="text-body text-muted-foreground">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
