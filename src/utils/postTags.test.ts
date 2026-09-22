import { describe, expect, it } from "vitest";
import { extractPostTags } from "./postTags";

describe("extractPostTags", () => {
  it("extracts normalized unique @tags", () => {
    expect(extractPostTags("@Blues et @blues avec @Rock_70")).toEqual([
      "blues",
      "rock_70",
    ]);
  });

  it("ignores email addresses", () => {
    expect(extractPostTags("music@example.com @guitar")).toEqual(["guitar"]);
  });
});
