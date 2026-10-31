import type { ChordPosition } from "@/types/chord";
import { getChordPositions } from "@/utils/chords";
import { normaliseKey } from "@/utils/songCues";
import { transposeChordLabel } from "@/utils/chordTransposition";

export interface DisplayChordShape {
  label: string;
  position?: ChordPosition;
  positions?: ChordPosition[];
}

const SUFFIX_BY_LABEL: Record<string, string> = {
  "": "major",
  m: "minor",
  M7: "maj7",
  maj7: "maj7",
  m7: "m7",
  sus2: "sus2",
  sus4: "sus4",
  dim: "dim",
  aug: "aug",
  "7": "7",
};

export function getDisplayChordShape(label?: string, capo = 0): DisplayChordShape {
  const displayedLabel = transposeChordLabel(label ?? "", capo);
  const match = /^([A-G](?:#|b)?)(M7|maj7|m7|sus2|sus4|dim|aug|7|m)?$/.exec(
    displayedLabel,
  );
  if (!match) return { label: displayedLabel || "—", position: undefined };

  const key = normaliseKey(match[1]);
  const suffix = match[2] ?? "";
  const positions = getChordPositions(key, SUFFIX_BY_LABEL[suffix]).slice(0, 4);
  const displaySuffix = suffix === "M7" ? "maj7" : suffix;
  return {
    label: `${key}${displaySuffix}`,
    position: positions[0],
    positions,
  };
}
