import { describe, expect, it } from "vitest";
import { insertTextAtSelection } from "./insertText";

describe("insertTextAtSelection", () => {
  it("inserts at the caret and returns the position after the insertion", () => {
    expect(
      insertTextAtSelection("Salut toi", "🎸", { start: 5, end: 5 }, 5000),
    ).toEqual({ value: "Salut🎸 toi", caret: 7 });
  });

  it("replaces the selected range", () => {
    expect(
      insertTextAtSelection("Salut toi", "!", { start: 5, end: 9 }, 5000),
    ).toEqual({ value: "Salut!", caret: 6 });
  });

  it("leaves the value unchanged when the result would exceed the maximum length", () => {
    expect(
      insertTextAtSelection("abcd", "🎸🎸", { start: 4, end: 4 }, 5),
    ).toEqual({ value: "abcd", caret: 4 });
  });
});
