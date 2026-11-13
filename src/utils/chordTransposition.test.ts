import { describe, expect, it } from "vitest";
import { getChordRoot, transposeChordBySemitones, transposeChordLabel } from "@/utils/chordTransposition";

describe("transposeChordLabel", () => {
  it("transposes up and down while keeping quality and slash bass", () => {
    expect(transposeChordBySemitones("Am7", 2)).toBe("Bm7");
    expect(transposeChordBySemitones("C/E", -2)).toBe("Bb/D");
    expect(transposeChordBySemitones("B", 1)).toBe("C");
    expect(transposeChordBySemitones("F#sus4", 12)).toBe("F#sus4");
    expect(transposeChordBySemitones("N", 2)).toBe("N");
    expect(transposeChordBySemitones("C", NaN)).toBe("C");
    expect(transposeChordBySemitones("C", 1.5)).toBe("C");
  });
  it("transposes a chord shape down by the capo semitones", () => {
    expect(transposeChordLabel("C", 2)).toBe("Bb");
    expect(transposeChordLabel("Am7", 2)).toBe("Gm7");
    expect(transposeChordLabel("G", 2)).toBe("F");
  });

  it("transposes the root and bass of slash chords", () => {
    expect(transposeChordLabel("C/E", 2)).toBe("Bb/D");
    expect(transposeChordLabel("Cm/B", 2)).toBe("Bbm/A");
  });

  it("wraps by octaves, supports zero capo, and preserves unknown labels", () => {
    expect(transposeChordLabel("C", 12)).toBe("C");
    expect(transposeChordLabel("D#7", 0)).toBe("D#7");
    expect(transposeChordLabel("N", 4)).toBe("N");
    expect(transposeChordLabel("C", 13)).toBe("C");
  });

  it("extracts a chord root for database lookup", () => {
    expect(getChordRoot("F#m7")).toBe("F#");
    expect(getChordRoot("N")).toBeUndefined();
  });
});
