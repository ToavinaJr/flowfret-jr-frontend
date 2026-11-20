import { describe, expect, it } from "vitest";
import { CHORD_INTERVALS, isPositionConsistent, positionPitchClasses } from "@/utils/chordTheory";
import { getChordsByKey, getKeys } from "@/utils/chords";

const OPEN_STRING_MIDI = [40, 45, 50, 55, 59, 64];

describe("bundled chord database", () => {
  const entries = getKeys().flatMap((key, rootPitchClass) =>
    getChordsByKey(key).flatMap((chord) =>
      chord.positions.map((position, index) => ({ key, rootPitchClass, suffix: chord.suffix, index, position })),
    ),
  );

  it("contains positions to check", () => {
    expect(entries.length).toBeGreaterThan(3000);
  });

  it("only lists voicings whose notes belong to the named chord", () => {
    const wrong = entries
      .filter(({ rootPitchClass, suffix, position }) => !isPositionConsistent(rootPitchClass, suffix, position))
      .map(({ key, suffix, index, position }) => `${key} ${suffix} #${index} frets=${position.frets.join(",")} base=${position.baseFret}`);
    expect(wrong).toEqual([]);
  });

  it("keeps the stored MIDI notes consistent with the frets", () => {
    const wrong = entries
      .filter(({ position }) => {
        const expected = position.frets.flatMap((fret, string) =>
          fret < 0 ? [] : [OPEN_STRING_MIDI[string] + (fret === 0 ? 0 : position.baseFret - 1 + fret)],
        );
        return expected.join() !== (position.midi ?? []).join();
      })
      .map(({ key, suffix, index }) => `${key} ${suffix} #${index}`);
    expect(wrong).toEqual([]);
  });

  it("keeps at least one voicing for every chord and a root note in the basic qualities", () => {
    for (const key of getKeys()) {
      for (const chord of getChordsByKey(key)) expect(chord.positions.length).toBeGreaterThan(0);
    }
    const basic = entries.filter(({ suffix }) => ["major", "minor", "dim", "aug", "sus2", "sus4"].includes(suffix));
    const rootless = basic.filter(({ rootPitchClass, position }) => !positionPitchClasses(position).includes(rootPitchClass));
    expect(rootless).toEqual([]);
  });

  it("has a theory entry for every non-slash suffix", () => {
    const suffixes = new Set(entries.map(({ suffix }) => suffix).filter((suffix) => !suffix.includes("/")));
    expect([...suffixes].filter((suffix) => !(suffix in CHORD_INTERVALS))).toEqual([]);
  });
});
