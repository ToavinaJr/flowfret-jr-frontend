import { useState } from "react";
import type { ChordPosition } from "@/types/chord";

const STRING_COUNT = 6;
const FRET_COUNT = 4;

interface ChordDiagramProps {
  chord: string;
  position?: ChordPosition;
  scale?: number;
  dimmed?: boolean;
  onStringPress?: (stringIndex: number, diagramFret: number) => void;
}

export function ChordDiagram({
  chord,
  position,
  scale = 1,
  dimmed = false,
  onStringPress,
}: ChordDiagramProps) {
  const [pressedString, setPressedString] = useState<number | null>(null);

  if (!position) return null;

  const { frets, fingers, baseFret, barres } = position;
  const width = 140 * scale;
  const height = 180 * scale;
  const offsetX = 24 * scale;
  const r = 10 * scale;
  const barreH = 12 * scale;
  const barreRx = 6 * scale;
  const nutWidth = 5 * scale;
  const strokeNormal = 2 * scale;
  const fs = Math.round(14 * scale);
  const fsSmall = Math.round(10 * scale);
  const fsBaseFret = Math.round(13 * scale);
  const topY = 20 * scale;
  const stringSpacing = width / (STRING_COUNT - 1);
  const fretSpacing = height / FRET_COUNT;
  const touchW = Math.max(44, stringSpacing);

  function handleStringPress(si: number) {
    const fret = frets[si];
    if (fret === -1) return;
    setPressedString(si);
    window.setTimeout(() => setPressedString(null), 280);
    onStringPress?.(si, fret);
  }

  return (
    <div
      className="flex flex-col items-center select-none"
      style={{ opacity: dimmed ? 0.4 : 1 }}
    >
      <div className="text-chord text-sm text-muted-foreground mb-1">{chord}</div>
      <svg
        width={width + offsetX + 10 * scale}
        height={height + 40 * scale}
        className="text-foreground"
        aria-label={`Diagramme ${chord}`}
      >
        {baseFret > 1 && (
          <text
            x={offsetX - 4 * scale}
            y={topY + fretSpacing * 0.65}
            fontSize={fsBaseFret}
            textAnchor="end"
            className="fill-muted-foreground"
          >
            {baseFret}
          </text>
        )}

        {Array.from({ length: STRING_COUNT }, (_, i) => (
          <line
            key={`string-${i}`}
            x1={offsetX + i * stringSpacing}
            y1={topY}
            x2={offsetX + i * stringSpacing}
            y2={height + topY}
            className={pressedString === i ? "stroke-primary" : "stroke-muted-foreground"}
            strokeWidth={pressedString === i ? strokeNormal * 1.6 : strokeNormal}
          />
        ))}

        {Array.from({ length: FRET_COUNT + 1 }, (_, i) => (
          <line
            key={`fret-${i}`}
            x1={offsetX}
            y1={topY + i * fretSpacing}
            x2={offsetX + width}
            y2={topY + i * fretSpacing}
            className={i === 0 && baseFret === 1 ? "stroke-foreground" : "stroke-border"}
            strokeWidth={i === 0 && baseFret === 1 ? nutWidth : strokeNormal}
          />
        ))}

        {barres.map((barreFret) => {
          const pressed = frets
            .map((f, si) => (f === barreFret ? si : -1))
            .filter((si) => si >= 0);
          if (pressed.length < 2) return null;
          const minSi = Math.min(...pressed);
          const maxSi = Math.max(...pressed);
          const y = topY + (barreFret - 0.5) * fretSpacing - barreH / 2;
          return (
            <rect
              key={`barre-${barreFret}`}
              x={offsetX + minSi * stringSpacing - r}
              y={y}
              width={(maxSi - minSi) * stringSpacing + r * 2}
              height={barreH}
              rx={barreRx}
              className="fill-primary"
            />
          );
        })}

        {frets.map((fret, si) => {
          const x = offsetX + si * stringSpacing;
          if (fret === -1) {
            return (
              <text
                key={`mute-${si}`}
                x={x}
                y={topY - 6 * scale}
                fontSize={fs}
                textAnchor="middle"
                className="fill-muted-foreground"
              >
                ×
              </text>
            );
          }
          if (fret === 0) {
            return (
              <circle
                key={`open-${si}`}
                cx={x}
                cy={topY - 8 * scale}
                r={r * 0.55}
                className="stroke-muted-foreground fill-none"
                strokeWidth={strokeNormal}
              />
            );
          }
          if (barres.includes(fret)) return null;
          const y = topY + (fret - 0.5) * fretSpacing;
          return (
            <g key={`dot-${si}`}>
              <circle cx={x} cy={y} r={r} className="fill-primary" />
              {fingers[si] > 0 && (
                <text
                  x={x}
                  y={y + fsSmall * 0.35}
                  fontSize={fsSmall}
                  textAnchor="middle"
                  className="fill-primary-foreground"
                >
                  {fingers[si]}
                </text>
              )}
            </g>
          );
        })}

        {Array.from({ length: STRING_COUNT }, (_, si) => (
          <rect
            key={`hit-${si}`}
            x={offsetX + si * stringSpacing - touchW / 2}
            y={0}
            width={touchW}
            height={height + topY + 20}
            className="fill-transparent cursor-pointer"
            onClick={() => handleStringPress(si)}
          />
        ))}
      </svg>
    </div>
  );
}
