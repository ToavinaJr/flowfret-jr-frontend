import { describe, expect, it } from "vitest";
import { resolveGraphqlUrl } from "./backend";

const localLocation = {
  hostname: "localhost",
  origin: "http://localhost:8080",
  protocol: "http:",
};

describe("backend URL validation", () => {
  it("uses the local API during development", () => {
    expect(resolveGraphqlUrl(undefined, localLocation, false)).toBe(
      "http://localhost:3000/graphql",
    );
  });

  it("requires an explicit endpoint in production", () => {
    expect(() => resolveGraphqlUrl(undefined, localLocation, true)).toThrow(
      "VITE_GRAPHQL_URL is required",
    );
  });

  it("rejects an unencrypted production endpoint", () => {
    expect(() =>
      resolveGraphqlUrl("http://api.fretflow.app/graphql", localLocation, true),
    ).toThrow("must use HTTPS");
  });

  it("accepts a secure production endpoint", () => {
    expect(
      resolveGraphqlUrl(
        "https://api.fretflow.app/graphql",
        localLocation,
        true,
      ),
    ).toBe("https://api.fretflow.app/graphql");
  });
});
