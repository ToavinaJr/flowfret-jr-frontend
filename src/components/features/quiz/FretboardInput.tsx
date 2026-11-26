import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { QUIZ_BOARD_FRETS as BOARD_FRETS, QUIZ_MUTED as MUTED } from "@/services/quizzesApi";
import { applyBarre, isInBarre, toggleCell, type FretboardState } from "@/utils/fretboardModel";
import { formatNoteName, type NotationStyle } from "@/utils/noteNaming";

const STRING_LETTERS = ["E", "A", "D", "G", "B", "E"] as const;
const FRET_ROWS = Array.from({ length: BOARD_FRETS + 1 }, (_, fret) => fret);

interface FretboardInputProps {
  value: FretboardState;
  notation: NotationStyle;
  disabled?: boolean;
  /** Offers the barre tool: tap the first and last string of a barre on the same fret. */
  allowBarre?: boolean;
  onChange: (next: FretboardState) => void;
}

/** Keyboard-accessible board: every string/fret cell is a toggle button. */
export function FretboardInput({ value, notation, disabled = false, allowBarre = false, onChange }: FretboardInputProps) {
  const { t } = useTranslation();
  const [barreMode, setBarreMode] = useState(false);
  const [pending, setPending] = useState<{ string: number; fret: number } | null>(null);

  function press(string: number, fret: number) {
    // Open strings cannot be part of a barre, so the fret 0 row always behaves as a plain toggle.
    if (!barreMode || fret === 0) {
      onChange(toggleCell(value, string, fret));
      return;
    }
    if (pending && pending.fret === fret) {
      onChange(applyBarre(value, fret, pending.string, string));
      setPending(null);
    } else {
      setPending({ string, fret });
    }
  }

  function toggleBarreMode() {
    setBarreMode((current) => !current);
    setPending(null);
  }

  return (
    <div className="space-y-2">
      {allowBarre && (
        <div className="mx-auto flex w-full max-w-sm flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={disabled}
            aria-pressed={barreMode}
            onClick={toggleBarreMode}
            className={`min-h-11 rounded-md border px-3 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-50 ${
              barreMode ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"
            }`}
          >
            {t("quiz.fretboard.barreTool")}
          </button>
          <p role="status" className="min-w-0 flex-1 text-xs text-muted-foreground">
            {barreMode
              ? pending
                ? t("quiz.fretboard.barrePending", { string: STRING_LETTERS.length - pending.string, fret: pending.fret })
                : t("quiz.fretboard.barreHint")
              : ""}
          </p>
        </div>
      )}
      <div
        role="group"
        aria-label={t("quiz.fretboard.label")}
        className="mx-auto grid w-full max-w-sm grid-cols-[2rem_repeat(6,minmax(0,1fr))] gap-y-1 rounded-lg border border-border bg-card p-2"
      >
        <span aria-hidden="true" />
        {STRING_LETTERS.map((letter, string) => (
          <span key={string} aria-hidden="true" className="text-center text-xs font-medium text-muted-foreground">
            {value.frets[string] === MUTED ? "×" : formatNoteName(letter, notation)}
          </span>
        ))}
        {FRET_ROWS.map((fret) => (
          <FretRow key={fret} fret={fret}>
            {STRING_LETTERS.map((letter, string) => {
              const barred = isInBarre(value.barre, string, fret);
              const selected = value.frets[string] === fret;
              const isPending = pending?.string === string && pending.fret === fret;
              const note = formatNoteName(letter, notation);
              return (
                <button
                  key={string}
                  type="button"
                  disabled={disabled}
                  aria-pressed={selected || barred}
                  aria-label={t(fret === 0 ? "quiz.fretboard.cellOpen" : "quiz.fretboard.cell", {
                    string: STRING_LETTERS.length - string,
                    note,
                    fret,
                  })}
                  onClick={() => press(string, fret)}
                  className="group flex min-h-11 items-center justify-center border-x border-border/60 focus-visible:z-10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary disabled:cursor-not-allowed"
                >
                  {barred && value.barre ? (
                    <span
                      className={`-mx-px h-7 w-[calc(100%+2px)] bg-primary ${string === value.barre.from ? "rounded-l-full" : ""} ${
                        string === value.barre.to ? "rounded-r-full" : ""
                      }`}
                    />
                  ) : (
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-xs transition-colors ${
                        selected
                          ? "bg-primary text-primary-foreground"
                          : `border ${fret === 0 ? "border-muted-foreground/50" : "border-transparent"} group-hover:border-primary/60`
                      } ${isPending ? "ring-2 ring-primary ring-offset-1" : ""}`}
                    />
                  )}
                </button>
              );
            })}
          </FretRow>
        ))}
      </div>
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
