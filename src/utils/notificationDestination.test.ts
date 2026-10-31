import { describe, expect, it } from "vitest";
import { NOTIFICATION_KIND } from "@/constants/domain";
import type { AppNotification } from "@/services/notificationsApi";
import { getNotificationDestination } from "./notificationDestination";

function notification(
  type: AppNotification["type"],
  payload: AppNotification["payload"],
): AppNotification {
  return { id: "notification-id", type, payload, readAt: null, createdAt: "" };
}

describe("getNotificationDestination", () => {
  it("opens the exact incoming friend request", () => {
    expect(
      getNotificationDestination(
        notification(NOTIFICATION_KIND.FRIEND_REQUEST, {
          actorId: "actor-id",
          friendshipId: "friendship-id",
        }),
      ),
    ).toBe("/friends?request=friendship-id#pending-requests");
  });

  it("supports older friend request notifications without a relationship id", () => {
    expect(
      getNotificationDestination(
        notification(NOTIFICATION_KIND.FRIEND_REQUEST, {
          actorId: "actor-id",
        }),
      ),
    ).toBe("/friends?requester=actor-id#pending-requests");
  });

  it("preserves destinations for posts and conversations", () => {
    expect(
      getNotificationDestination(
        notification(NOTIFICATION_KIND.POST_LIKE, { postId: "post-id" }),
      ),
    ).toBe("/post/post-id");
    expect(
      getNotificationDestination(
        notification(NOTIFICATION_KIND.CHAT_MESSAGE, {
          conversationId: "conversation-id",
        }),
      ),
    ).toBe("/messages/conversation-id");
  });
});
