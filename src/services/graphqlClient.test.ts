import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearAuthSession,
  getAccessToken,
  setAccessToken,
} from "@/services/authToken";
import { ApiClientError } from "@/types/api";
import { graphqlRequest, refreshAccessToken } from "./graphqlClient";

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
    expect(fetchMock.mock.calls[0]?.[1]?.headers).toMatchObject({
      "Apollo-Require-Preflight": "true",
    });
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

  it.each([429, 503])(
    "preserves the session when refresh fails with HTTP %s",
    async (status) => {
      setAccessToken("expired-token");
      vi.spyOn(globalThis, "fetch")
        .mockResolvedValueOnce(
          graphqlResponse({ errors: [{ message: "Unauthorized" }] }),
        )
        .mockResolvedValueOnce(
          graphqlResponse({ errors: [{ message: "Refresh unavailable" }] }, status),
        );

      await expect(graphqlRequest(request)).rejects.toBeInstanceOf(ApiClientError);

      expect(getAccessToken()).toBe("expired-token");
    },
  );

  it("preserves the session when the refresh request fails on the network", async () => {
    setAccessToken("expired-token");
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        graphqlResponse({ errors: [{ message: "Unauthorized" }] }),
      )
      .mockRejectedValueOnce(new TypeError("network unavailable"));

    await expect(graphqlRequest(request)).rejects.toBeInstanceOf(ApiClientError);

    expect(getAccessToken()).toBe("expired-token");
  });

  it("clears the session after an explicit refresh HTTP 401", async () => {
    setAccessToken("expired-token");
    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        graphqlResponse({ errors: [{ message: "Unauthorized" }] }),
      )
      .mockResolvedValueOnce(
        graphqlResponse({ errors: [{ message: "Unauthorized" }] }, 401),
      );

    await expect(graphqlRequest(request)).rejects.toBeInstanceOf(ApiClientError);

    expect(getAccessToken()).toBeNull();
  });

  it("runs refresh through the cross-tab Web Lock when available", async () => {
    const lockRequest = vi.fn(
      async (_name: string, callback: () => Promise<boolean>) => callback(),
    );
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: { request: lockRequest },
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      graphqlResponse({
        data: { refreshSession: { accessToken: "fresh-token" } },
      }),
    );

    await expect(refreshAccessToken()).resolves.toBe(true);

    expect(lockRequest).toHaveBeenCalledWith(
      "flowfret:auth-refresh",
      expect.any(Function),
    );
    expect(getAccessToken()).toBe("fresh-token");
  });

  it("serializes refresh requests from separate tab clients", async () => {
    let lockQueue = Promise.resolve();
    const lockRequest = vi.fn(
      <T>(_name: string, callback: () => Promise<T>) => {
        const current = lockQueue.then(callback);
        lockQueue = current.then(
          () => undefined,
          () => undefined,
        );
        return current;
      },
    );
    const previousLocks = Object.getOwnPropertyDescriptor(navigator, "locks");
    Object.defineProperty(navigator, "locks", {
      configurable: true,
      value: { request: lockRequest },
    });

    let activeRequests = 0;
    let maximumConcurrentRequests = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      activeRequests += 1;
      maximumConcurrentRequests = Math.max(
        maximumConcurrentRequests,
        activeRequests,
      );
      await new Promise((resolve) => window.setTimeout(resolve, 10));
      activeRequests -= 1;
      return graphqlResponse({
        data: { refreshSession: { accessToken: "fresh-token" } },
      });
    });

    vi.resetModules();
    const firstTab = await import("./graphqlClient");
    vi.resetModules();
    const secondTab = await import("./graphqlClient");

    try {
      await expect(
        Promise.all([
          firstTab.refreshAccessToken(),
          secondTab.refreshAccessToken(),
        ]),
      ).resolves.toEqual([true, true]);
      expect(lockRequest).toHaveBeenCalledTimes(2);
      expect(maximumConcurrentRequests).toBe(1);
    } finally {
      if (previousLocks)
        Object.defineProperty(navigator, "locks", previousLocks);
      else Reflect.deleteProperty(navigator, "locks");
    }
  });
});
