import { motion } from "framer-motion";

interface FretboardProps {
  activeNotes?: { string: number; fret: number }[];
  chordName?: string;
  numFrets?: number;
}

const STRING_NAMES = ["E", "B", "G", "D", "A", "E"];
const STRING_WIDTHS = [1, 1, 1.5, 2, 2.5, 3];

const Fretboard = ({ activeNotes = [], chordName, numFrets = 5 }: FretboardProps) => {
  const frets = Array.from({ length: numFrets }, (_, i) => i);
  const strings = Array.from({ length: 6 }, (_, i) => i);

  const isActive = (stringIdx: number, fretIdx: number) =>
    activeNotes.some((n) => n.string === stringIdx && n.fret === fretIdx);

  return (
    <div className="inline-block">
      {chordName && (
        <div className="text-chord text-center text-foreground mb-3">{chordName}</div>
      )}
      <div className="relative bg-card rounded-lg p-4">
        {/* Nut */}
        <div className="flex">
          <div className="w-6" />
          <div className="flex-1 h-1 bg-foreground rounded-full mb-1" />
        </div>

        {/* Frets */}
        {frets.map((fretIdx) => (
          <div key={fretIdx} className="flex items-stretch">
            {/* Fret number */}
            <div className="w-6 flex items-center justify-center text-xs font-musical text-muted-foreground">
              {fretIdx + 1}
            </div>

            {/* Strings at this fret */}
            <div className="flex-1 flex border-b border-secondary">
              {strings.map((stringIdx) => {
                const active = isActive(stringIdx, fretIdx + 1);
                return (
                  <div
                    key={stringIdx}
                    className="relative flex-1 h-10 flex items-center justify-center"
                    style={{
                      borderRight: stringIdx < 5 ? undefined : "none",
                    }}
                  >
                    {/* String line */}
                    <div
                      className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 bg-muted-foreground/40"
                      style={{ width: `${STRING_WIDTHS[stringIdx]}px` }}
                    />

                    {/* Active note */}
                    {active && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative z-10 h-6 w-6 rounded-full bg-primary flex items-center justify-center"
                        style={{ boxShadow: "0 0 10px rgba(225, 29, 72, 0.5)" }}
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* String names */}
        <div className="flex mt-2">
          <div className="w-6" />
          <div className="flex-1 flex">
            {STRING_NAMES.map((name, i) => (
              <div key={i} className="flex-1 text-center text-xs font-musical text-muted-foreground">
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fretboard;
