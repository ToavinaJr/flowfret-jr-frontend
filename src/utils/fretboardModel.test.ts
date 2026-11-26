import { describe, expect, it } from "vitest";
import { EMPTY_FRETBOARD, applyBarre, isInBarre, toggleCell } from "@/utils/fretboardModel";

describe("fretboard model", () => {
  it("presses and releases a single string", () => {
    const pressed = toggleCell(EMPTY_FRETBOARD, 1, 3);
    expect(pressed.frets).toEqual([-1, 3, -1, -1, -1, -1]);
    expect(toggleCell(pressed, 1, 3).frets).toEqual(EMPTY_FRETBOARD.frets);
    expect(toggleCell(pressed, 1, 0).frets[1]).toBe(0);
  });

  it("lays a barre across the strings between two taps, in either order", () => {
    const forward = applyBarre(EMPTY_FRETBOARD, 1, 0, 5);
    expect(forward.frets).toEqual([1, 1, 1, 1, 1, 1]);
    expect(forward.barre).toEqual({ fret: 1, from: 0, to: 5 });
    expect(applyBarre(EMPTY_FRETBOARD, 2, 5, 1)).toEqual({
      frets: [-1, 2, 2, 2, 2, 2],
      barre: { fret: 2, from: 1, to: 5 },
    });
  });

  it("keeps fingers already placed higher up under the barre", () => {
    const shape = toggleCell(toggleCell(EMPTY_FRETBOARD, 1, 3), 2, 3);
    const withBarre = applyBarre(shape, 1, 0, 5);
    expect(withBarre.frets).toEqual([1, 3, 3, 1, 1, 1]);
  });

  it("treats a barre on a single string as a plain finger", () => {
    expect(applyBarre(EMPTY_FRETBOARD, 2, 3, 3)).toEqual(toggleCell(EMPTY_FRETBOARD, 3, 2));
  });

  it("drops the barre once an end string is released, but keeps it for inner changes", () => {
    const barred = applyBarre(EMPTY_FRETBOARD, 1, 0, 5);
    expect(toggleCell(barred, 3, 3).barre).toEqual(barred.barre);
    expect(toggleCell(barred, 0, 1).barre).toBeNull();
    expect(toggleCell(barred, 5, 4).barre).toBeNull();
  });

  it("knows which cells the barre covers", () => {
    const { barre } = applyBarre(EMPTY_FRETBOARD, 2, 1, 4);
    expect(isInBarre(barre, 1, 2)).toBe(true);
    expect(isInBarre(barre, 4, 2)).toBe(true);
    expect(isInBarre(barre, 0, 2)).toBe(false);
    expect(isInBarre(barre, 2, 3)).toBe(false);
    expect(isInBarre(null, 2, 2)).toBe(false);
  });
});
