import { describe, expect, it } from "vitest";
import { getDisplayChordShape } from "@/utils/chordShape";

describe("getDisplayChordShape", () => {
  it("returns the guitar fingering for a detected chord", () => {
    const chord = getDisplayChordShape("Am");

    expect(chord.label).toBe("Am");
    expect(chord.position?.frets).toHaveLength(6);
    expect(chord.positions).toHaveLength(4);
    expect(chord.position).toBe(chord.positions?.[0]);
  });

  it("normalizes enharmonic sharp labels used by the detector", () => {
    expect(getDisplayChordShape("D#7").label).toBe("Eb7");
    expect(getDisplayChordShape("D#7").position).toBeDefined();
  });

  it("keeps unsupported labels visible without inventing a fingering", () => {
    expect(getDisplayChordShape("N")).toEqual({
      label: "N",
      position: undefined,
    });
  });
});
