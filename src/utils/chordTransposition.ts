const CHROMATIC_NOTES = ["C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];
const NOTE_INDEX: Record<string, number> = {
  C: 0, "B#": 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3,
  E: 4, Fb: 4, "E#": 5, F: 5, "F#": 6, Gb: 6, G: 7,
  "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11, Cb: 11,
};

function transposeNote(note: string, semitones: number): string | undefined {
  const index = NOTE_INDEX[note];
  if (index === undefined) return undefined;
  return CHROMATIC_NOTES[((index + semitones) % 12 + 12) % 12];
}

/** Returns the chord shape that sounds as `label` with a capo at `capo`. */
export function transposeChordLabel(label: string, capo: number): string {
  if (!Number.isInteger(capo) || capo < 0 || capo > 12) return label;
  if (capo === 0) return label;
  const match = /^([A-G](?:#|b)?)(.*?)(?:\/([A-G](?:#|b)?))?$/.exec(label);
  if (!match) return label;
  const root = transposeNote(match[1], -capo);
  if (!root) return label;
  const bass = match[3] ? transposeNote(match[3], -capo) : undefined;
  if (match[3] && !bass) return label;
  return `${root}${match[2]}${bass ? `/${bass}` : ""}`;
}

export function getChordRoot(label: string): string | undefined {
  return /^([A-G](?:#|b)?)/.exec(label)?.[1];
}
