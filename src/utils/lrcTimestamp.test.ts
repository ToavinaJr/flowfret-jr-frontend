import { describe, expect, it } from "vitest";
import { formatLrcTimestamp, parseLrcTimestamp } from "./lrcTimestamp";

describe("formatLrcTimestamp", () => {
  it("formats milliseconds as mm:ss.cc", () => {
    expect(formatLrcTimestamp(0)).toBe("00:00.00");
    expect(formatLrcTimestamp(1234)).toBe("00:01.23");
    expect(formatLrcTimestamp(65_000)).toBe("01:05.00");
  });

  it("returns an empty string for null or invalid values", () => {
    expect(formatLrcTimestamp(null)).toBe("");
    expect(formatLrcTimestamp(-5)).toBe("");
  });
});

describe("parseLrcTimestamp", () => {
  it("parses mm:ss.cc back into milliseconds", () => {
    expect(parseLrcTimestamp("00:00.00")).toBe(0);
    expect(parseLrcTimestamp("00:01.23")).toBe(1230);
    expect(parseLrcTimestamp("01:05.00")).toBe(65_000);
  });

  it("accepts a colon separator before the fraction", () => {
    expect(parseLrcTimestamp("00:01:23")).toBe(1230);
  });

  it("returns null for invalid input", () => {
    expect(parseLrcTimestamp("")).toBeNull();
    expect(parseLrcTimestamp("not a timestamp")).toBeNull();
    expect(parseLrcTimestamp("00:61.00")).toBeNull();
  });

  it("round-trips through formatLrcTimestamp", () => {
    const ms = 123_456;
    expect(parseLrcTimestamp(formatLrcTimestamp(ms))).toBe(
      Math.round(ms / 10) * 10,
    );
  });
});
