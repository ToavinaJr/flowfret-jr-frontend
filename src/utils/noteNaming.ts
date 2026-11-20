/** How note and chord names are displayed. Stored data and engine logic always use letter names. */
export type NotationStyle = "letters" | "solfege";

export const NOTATION_STYLES: readonly NotationStyle[] = ["letters", "solfege"];
export const DEFAULT_NOTATION: NotationStyle = "letters";

const SOLFEGE_BY_LETTER: Record<string, string> = {
  C: "Do",
  D: "Ré",
  E: "Mi",
  F: "Fa",
  G: "Sol",
  A: "La",
  B: "Si",
};

export function isNotationStyle(value: unknown): value is NotationStyle {
  return value === "letters" || value === "solfege";
}

/** Formats a root such as "C#" or "Eb" (letter spelling) for display. */
export function formatNoteName(root: string, style: NotationStyle): string {
  if (style === "letters") return root;
  const solfege = SOLFEGE_BY_LETTER[root.charAt(0)];
  return solfege ? `${solfege}${root.slice(1)}` : root;
}

/** Formats a chord label such as "Cmaj7" or "Am" for display, keeping the quality suffix intact. */
export function formatChordName(label: string, style: NotationStyle): string {
  if (style === "letters") return label;
  const match = /^([A-G](?:#|b)?)(.*)$/.exec(label);
  if (!match) return label;
  const [, root, rest] = match;
  const bass = /^(.*)\/([A-G](?:#|b)?)$/.exec(rest);
  const quality = bass ? bass[1] : rest;
  const name = formatNoteName(root, style);
  const spaced = quality ? `${name} ${quality}` : name;
  return bass ? `${spaced}/${formatNoteName(bass[2], style)}` : spaced;
}
