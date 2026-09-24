import {
  FRET_COUNT,
  FRET_MARKERS,
  NOTE_DISPLAY,
  STRING_NAMES,
  STRING_OPEN_NOTES,
} from "@/constants/scalesConstants";
import { useTranslation } from "react-i18next";
import { playStringNote } from "@/utils/stringSound";

interface ScaleFretboardProps {
  rootIndex: number;
  scaleIntervals: number[];
}

const FRET_W = 44;
const STRING_H = 28;
const LEFT_PAD = 28;
const TOP_PAD = 22;
const BOT_PAD = 20;
const DOT_R = 10;
const SVG_W = LEFT_PAD + FRET_COUNT * FRET_W + 8;
const SVG_H = TOP_PAD + 5 * STRING_H + BOT_PAD;

export function ScaleFretboard({ rootIndex, scaleIntervals }: ScaleFretboardProps) {
  const { t } = useTranslation();
  const scaleSet = new Set(scaleIntervals.map((i) => (rootIndex + i) % 12));

  async function handleNote(
    stringIdxHighToLow: number,
    fret: number,
    noteIdx: number,
  ) {
    if (!scaleSet.has(noteIdx)) return;
    // stringSound uses low-E = 0; scale board uses high-e = 0
    const stringIdx = 5 - stringIdxHighToLow;
    await playStringNote(stringIdx, fret);
  }

  return (
    <div className="overflow-x-auto">
      <svg
        width={SVG_W}
        height={SVG_H}
        className="mx-auto"
        aria-label={t("scaleFretboard.label")}
      >
        {FRET_MARKERS.map((fret) => {
          const cx = LEFT_PAD + fret * FRET_W - FRET_W / 2;
          if (fret === 12) {
            return (
              <g key={`m${fret}`}>
                <circle cx={cx - 6} cy={TOP_PAD - 7} r={3} className="fill-border" />
                <circle cx={cx + 6} cy={TOP_PAD - 7} r={3} className="fill-border" />
              </g>
            );
          }
          return (
            <circle
              key={`m${fret}`}
              cx={cx}
              cy={TOP_PAD - 7}
              r={3}
              className="fill-border"
            />
          );
        })}

        {STRING_NAMES.map((_, si) => {
          const y = TOP_PAD + si * STRING_H;
          return (
            <line
              key={`s${si}`}
              x1={LEFT_PAD}
              y1={y}
              x2={SVG_W - 4}
              y2={y}
              className="stroke-border"
              strokeWidth={1 + si * 0.3}
            />
          );
        })}

        {Array.from({ length: FRET_COUNT }, (_, fi) => {
          const x = LEFT_PAD + fi * FRET_W;
          const isNut = fi === 0;
          return (
            <rect
              key={`f${fi}`}
              x={x - (isNut ? 3 : 0.5)}
              y={TOP_PAD}
              width={isNut ? 5 : 1}
              height={(STRING_NAMES.length - 1) * STRING_H}
              className={isNut ? "fill-muted-foreground" : "fill-border"}
            />
          );
        })}

        {STRING_NAMES.map((name, si) => (
          <text
            key={`sn${si}`}
            x={LEFT_PAD - 6}
            y={TOP_PAD + si * STRING_H + 4}
            fontSize={10}
            textAnchor="end"
            className="fill-muted-foreground font-semibold"
          >
            {name}
          </text>
        ))}

        {STRING_NAMES.map((_, si) =>
          Array.from({ length: FRET_COUNT }, (_, fret) => {
            const noteIdx = (STRING_OPEN_NOTES[si] + fret) % 12;
            if (!scaleSet.has(noteIdx)) return null;
            const isRoot = noteIdx === rootIndex;
            const cx = LEFT_PAD + fret * FRET_W + (fret === 0 ? 0 : -FRET_W / 2);
            const cy = TOP_PAD + si * STRING_H;
            const hitSize = 44;
            return (
              <g key={`n${si}-${fret}`}>
                <circle
                  cx={cx}
                  cy={cy}
                  r={DOT_R}
                  className={isRoot ? "fill-primary" : "fill-slate-500 dark:fill-slate-400"}
                />
                <text
                  x={cx}
                  y={cy + 3.5}
                  fontSize={9}
                  textAnchor="middle"
                  className={
                    isRoot
                      ? "fill-primary-foreground"
                      : "fill-white dark:fill-slate-950"
                  }
                >
                  {NOTE_DISPLAY[noteIdx]}
                </text>
                <rect
                  x={cx - hitSize / 2}
                  y={cy - hitSize / 2}
                  width={hitSize}
                  height={hitSize}
                  className="fill-transparent cursor-pointer focus:outline-none focus:stroke-primary focus:stroke-2"
                  role="button"
                  tabIndex={0}
                  aria-label={t("scaleFretboard.playNote", {
                    note: NOTE_DISPLAY[noteIdx],
                    fret,
                  })}
                  onClick={() => {
                    void handleNote(si, fret, noteIdx);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      void handleNote(si, fret, noteIdx);
                    }
                  }}
                />
              </g>
            );
          }),
        )}
      </svg>
      <div className="h-0 w-0 overflow-hidden" aria-hidden>
        {BOT_PAD}
      </div>
    </div>
  );
}
