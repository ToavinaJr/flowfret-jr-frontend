import type { ChordPosition } from "@/types/chord";
import { getChordPositions } from "@/utils/chords";
import { normaliseKey } from "@/utils/songCues";

export interface DisplayChordShape {
  label: string;
  position?: ChordPosition;
  positions?: ChordPosition[];
}

const SUFFIX_BY_LABEL: Record<string, string> = {
  "": "major",
  m: "minor",
  maj7: "maj7",
  m7: "m7",
  sus2: "sus2",
  sus4: "sus4",
  dim: "dim",
  aug: "aug",
  "7": "7",
};

export function getDisplayChordShape(label?: string): DisplayChordShape {
  const match = /^([A-G](?:#|b)?)(maj7|m7|sus2|sus4|dim|aug|7|m)?$/.exec(
    label ?? "",
  );
  if (!match) return { label: label ?? "—", position: undefined };

  const key = normaliseKey(match[1]);
  const suffix = match[2] ?? "";
  const positions = getChordPositions(key, SUFFIX_BY_LABEL[suffix]).slice(0, 4);
  return {
    label: `${key}${suffix}`,
    position: positions[0],
    positions,
  };
}
