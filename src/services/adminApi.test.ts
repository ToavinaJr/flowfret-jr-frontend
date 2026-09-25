import { beforeEach, describe, expect, it, vi } from "vitest";
import { graphqlRequest } from "@/services/graphqlClient";
import {
  fetchAdminBackendStatus,
  fetchAdminDashboardStatistics,
  fetchAdminUsers,
} from "./adminApi";

vi.mock("@/services/graphqlClient", () => ({
  graphqlRequest: vi.fn(),
}));

const graphqlRequestMock = vi.mocked(graphqlRequest);

describe("admin API", () => {
  beforeEach(() => graphqlRequestMock.mockReset());

  it("loads backend health", async () => {
    const status = {
      databaseReachable: true,
      serverTime: "2026-09-25T12:00:00.000Z",
    };
    graphqlRequestMock.mockResolvedValue({ adminBackendStatus: status });

    await expect(fetchAdminBackendStatus()).resolves.toEqual(status);
  });

  it("loads dashboard statistics for the selected period", async () => {
    const statistics = { days: 30, totals: { users: 4 } };
    graphqlRequestMock.mockResolvedValue({
      adminDashboardStatistics: statistics,
    });

    await expect(fetchAdminDashboardStatistics(30)).resolves.toEqual(
      statistics,
    );
    const options = graphqlRequestMock.mock.calls[0]?.[0];
    expect(options?.variables).toEqual({ input: { days: 30 } });
    const query = options?.query ?? "";
    expect(query.match(/{/g)?.length).toBe(query.match(/}/g)?.length);
  });

  it("forwards filters and cursor pagination to the members query", async () => {
    const page = {
      nodes: [],
      totalCount: 0,
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: true,
        endCursor: null,
      },
    };
    graphqlRequestMock.mockResolvedValue({ adminUsers: page });

    const input = { first: 25, after: "cursor-1", search: "alice" };
    await expect(fetchAdminUsers(input)).resolves.toEqual(page);

    const options = graphqlRequestMock.mock.calls[0]?.[0];
    expect(options?.variables).toEqual({ input });
    expect(options?.query).toContain("adminUsers(input: $input)");
    expect(options?.query.match(/{/g)?.length).toBe(
      options?.query.match(/}/g)?.length,
    );
  });
});
