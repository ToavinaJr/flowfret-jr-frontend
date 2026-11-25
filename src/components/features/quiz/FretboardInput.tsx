import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { QUIZ_BOARD_FRETS as BOARD_FRETS, QUIZ_MUTED as MUTED } from "@/services/quizzesApi";
import { formatNoteName, type NotationStyle } from "@/utils/noteNaming";

const STRING_LETTERS = ["E", "A", "D", "G", "B", "E"] as const;
const FRET_ROWS = Array.from({ length: BOARD_FRETS + 1 }, (_, fret) => fret);

interface FretboardInputProps {
  /** One entry per string, low E first: MUTED, 0 (open) or a fret up to BOARD_FRETS. */
  value: readonly number[];
  notation: NotationStyle;
  disabled?: boolean;
  onChange: (next: number[]) => void;
}

/** Keyboard-accessible board: every string/fret cell is a toggle button. */
export function FretboardInput({ value, notation, disabled = false, onChange }: FretboardInputProps) {
  const { t } = useTranslation();

  function toggle(string: number, fret: number) {
    onChange(value.map((current, index) => (index === string ? (current === fret ? MUTED : fret) : current)));
  }

  return (
    <div
      role="group"
      aria-label={t("quiz.fretboard.label")}
      className="mx-auto grid w-full max-w-sm grid-cols-[2rem_repeat(6,minmax(0,1fr))] gap-y-1 rounded-lg border border-border bg-card p-2"
    >
      <span aria-hidden="true" />
      {STRING_LETTERS.map((letter, string) => (
        <span key={string} aria-hidden="true" className="text-center text-xs font-medium text-muted-foreground">
          {value[string] === MUTED ? "×" : formatNoteName(letter, notation)}
        </span>
      ))}
      {FRET_ROWS.map((fret) => (
        <FretRow key={fret} fret={fret}>
          {STRING_LETTERS.map((letter, string) => {
            const selected = value[string] === fret;
            const note = formatNoteName(letter, notation);
            return (
              <button
                key={string}
                type="button"
                disabled={disabled}
                aria-pressed={selected}
                aria-label={t(fret === 0 ? "quiz.fretboard.cellOpen" : "quiz.fretboard.cell", {
                  string: STRING_LETTERS.length - string,
                  note,
                  fret,
                })}
                onClick={() => toggle(string, fret)}
                className="group flex min-h-11 items-center justify-center border-x border-border/60 focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed"
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors ${
                    selected
                      ? "bg-primary text-primary-foreground"
                      : `border ${fret === 0 ? "border-muted-foreground/50" : "border-transparent"} group-hover:border-primary/60`
                  }`}
                />
              </button>
            );
          })}
        </FretRow>
      ))}
    </div>
  );
}

function FretRow({ fret, children }: { fret: number; children: ReactNode }) {
  return (
    <>
      <span aria-hidden="true" className="flex items-center justify-center text-xs text-muted-foreground">
        {fret}
      </span>
      {children}
    </>
  );
}
