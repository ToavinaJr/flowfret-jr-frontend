import { describe, expect, it } from "vitest";
import { readPasswordResetToken } from "./passwordResetLink";

describe("readPasswordResetToken", () => {
  it("reads new reset tokens from the URL fragment", () => {
    expect(readPasswordResetToken("", "#token=fragment-secret")).toBe(
      "fragment-secret",
    );
  });

  it("keeps existing email links with query tokens working", () => {
    expect(readPasswordResetToken("?token=legacy-secret", "")).toBe(
      "legacy-secret",
    );
  });

  it("prefers a fragment token when both formats are present", () => {
    expect(
      readPasswordResetToken("?token=legacy-secret", "#token=fragment-secret"),
    ).toBe("fragment-secret");
  });
});
