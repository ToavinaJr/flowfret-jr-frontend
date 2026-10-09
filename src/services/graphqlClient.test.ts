import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearAuthSession,
  getAccessToken,
  setAccessToken,
} from "@/services/authToken";
import { ApiClientError } from "@/types/api";
import { graphqlRequest } from "./graphqlClient";

function graphqlResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

const request = { query: "query CurrentUser { currentUser { id } }" };

describe("graphqlClient authentication retry", () => {
  beforeEach(() => {
    clearAuthSession();
    vi.restoreAllMocks();
  });

  it("does not refresh when an unauthenticated request has no access token", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      graphqlResponse({
        errors: [{ message: "Unauthorized" }],
      }),
    );

    await expect(graphqlRequest(request)).rejects.toBeInstanceOf(ApiClientError);

    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("refreshes once and retries with the new access token", async () => {
    setAccessToken("expired-token");
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        graphqlResponse({ errors: [{ message: "Unauthorized" }] }),
      )
      .mockResolvedValueOnce(
        graphqlResponse({
          data: { refreshSession: { accessToken: "fresh-token" } },
        }),
      )
      .mockResolvedValueOnce(graphqlResponse({ data: { currentUser: { id: "1" } } }));

    await expect(graphqlRequest(request)).resolves.toEqual({
      currentUser: { id: "1" },
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({
      Authorization: "Bearer expired-token",
    });
    expect(fetchMock.mock.calls[2]?.[1]?.headers).toMatchObject({
      Authorization: "Bearer fresh-token",
    });
    expect(getAccessToken()).toBe("fresh-token");
  });

  it("does not retry the same operation more than once", async () => {
    setAccessToken("expired-token");
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        graphqlResponse({ errors: [{ message: "Unauthorized" }] }),
      )
      .mockResolvedValueOnce(
        graphqlResponse({
          data: { refreshSession: { accessToken: "fresh-token" } },
        }),
      )
      .mockResolvedValueOnce(
        graphqlResponse({ errors: [{ message: "Unauthorized" }] }),
      );

    await expect(graphqlRequest(request)).rejects.toMatchObject({
      status: 200,
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
