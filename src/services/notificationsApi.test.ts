import { beforeEach, describe, expect, it, vi } from "vitest";
import { graphqlRequest } from "@/services/graphqlClient";
import {
  fetchUnreadNotificationCount,
  markNotificationRead,
} from "./notificationsApi";

vi.mock("@/services/graphqlClient", () => ({
  graphqlRequest: vi.fn(),
}));

const graphqlRequestMock = vi.mocked(graphqlRequest);

describe("notifications API", () => {
  beforeEach(() => graphqlRequestMock.mockReset());

  it("returns the unread notification count", async () => {
    graphqlRequestMock.mockResolvedValue({ unreadNotificationCount: 4 });

    await expect(fetchUnreadNotificationCount()).resolves.toBe(4);
    expect(graphqlRequestMock).toHaveBeenCalledWith({
      query: expect.stringContaining("unreadNotificationCount"),
    });
  });

  it("marks the selected notification as read", async () => {
    graphqlRequestMock.mockResolvedValue({
      markNotificationRead: { id: "notification-id", readAt: "now" },
    });

    await markNotificationRead("notification-id");

    expect(graphqlRequestMock).toHaveBeenCalledWith(
      expect.objectContaining({ variables: { id: "notification-id" } }),
    );
  });
});
