import { motion } from "framer-motion";

interface FretNote {
  string: number;
  fret: number;
}

interface FretboardProps {
  activeNotes?: FretNote[];
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
    <div className="w-full max-w-md">
      {chordName && (
        <div className="text-chord mb-3 text-center text-foreground">{chordName}</div>
      )}
      <div className="relative rounded-lg bg-card p-3 sm:p-4">
        <div className="flex">
          <div className="w-5 shrink-0 sm:w-6" />
          <div className="mb-1 h-1 flex-1 rounded-full bg-foreground" />
        </div>

        {frets.map((fretIdx) => (
          <div key={fretIdx} className="flex items-stretch">
            <div className="flex w-5 shrink-0 items-center justify-center font-musical text-xs text-muted-foreground sm:w-6">
              {fretIdx + 1}
            </div>

            <div className="flex flex-1 border-b border-secondary">
              {strings.map((stringIdx) => {
                const active = isActive(stringIdx, fretIdx + 1);
                return (
                  <div
                    key={stringIdx}
                    className="relative flex h-9 flex-1 items-center justify-center sm:h-10"
                  >
                    <div
                      className="absolute bottom-0 left-1/2 top-0 -translate-x-1/2 bg-muted-foreground/40"
                      style={{ width: `${STRING_WIDTHS[stringIdx]}px` }}
                    />

                    {active && (
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary sm:h-6 sm:w-6"
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

        <div className="mt-2 flex">
          <div className="w-5 shrink-0 sm:w-6" />
          <div className="flex flex-1">
            {STRING_NAMES.map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="flex-1 text-center font-musical text-xs text-muted-foreground"
              >
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
