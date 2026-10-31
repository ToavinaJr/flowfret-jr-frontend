import { NOTIFICATION_KIND } from "@/constants/domain";
import type { AppNotification } from "@/services/notificationsApi";

export function getNotificationDestination(row: AppNotification): string {
  if (row.type === NOTIFICATION_KIND.FRIEND_REQUEST) {
    const params = new URLSearchParams();
    if (row.payload.friendshipId) params.set("request", row.payload.friendshipId);
    else if (row.payload.actorId) params.set("requester", row.payload.actorId);
    return `/friends${params.size ? `?${params.toString()}` : ""}#pending-requests`;
  }
  if (row.type === NOTIFICATION_KIND.CHAT_MESSAGE)
    return `/messages/${row.payload.conversationId || ""}`;
  if (row.type.startsWith("TEACHING_")) return "/teaching";
  if (row.payload.postId) return `/post/${row.payload.postId}`;
  return `/profile/${row.payload.actorId || ""}`;
}
