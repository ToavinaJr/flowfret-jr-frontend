import { describe, expect, it } from "vitest";
import { formatLrcTimestamp, parseLrcTimestamp } from "./lrcTimestamp";

describe("formatLrcTimestamp", () => {
  it("formats milliseconds as h:mm:ss", () => {
    expect(formatLrcTimestamp(0)).toBe("0:00:00");
    expect(formatLrcTimestamp(1_000)).toBe("0:00:01");
    expect(formatLrcTimestamp(65_000)).toBe("0:01:05");
    expect(formatLrcTimestamp(3_725_000)).toBe("1:02:05");
  });

  it("rounds to the nearest whole second", () => {
    expect(formatLrcTimestamp(1_490)).toBe("0:00:01");
    expect(formatLrcTimestamp(1_500)).toBe("0:00:02");
  });

  it("returns an empty string for null or invalid values", () => {
    expect(formatLrcTimestamp(null)).toBe("");
    expect(formatLrcTimestamp(-5)).toBe("");
  });
});

describe("parseLrcTimestamp", () => {
  it("parses h:mm:ss back into milliseconds", () => {
    expect(parseLrcTimestamp("0:00:00")).toBe(0);
    expect(parseLrcTimestamp("0:00:01")).toBe(1_000);
    expect(parseLrcTimestamp("0:01:05")).toBe(65_000);
    expect(parseLrcTimestamp("1:02:05")).toBe(3_725_000);
  });

  it("accepts single-digit minutes and seconds", () => {
    expect(parseLrcTimestamp("0:1:5")).toBe(65_000);
  });

  it("returns null for invalid input", () => {
    expect(parseLrcTimestamp("")).toBeNull();
    expect(parseLrcTimestamp("not a timestamp")).toBeNull();
    expect(parseLrcTimestamp("0:61:00")).toBeNull();
  });

  it("round-trips through formatLrcTimestamp", () => {
    const ms = 3_725_000;
    expect(parseLrcTimestamp(formatLrcTimestamp(ms))).toBe(ms);
  });
});
