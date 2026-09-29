import { graphqlRequest } from "@/services/graphqlClient";
import { type ActivityAction, type NotificationKind } from "@/constants/domain";

export type { NotificationKind } from "@/constants/domain";
export interface AppNotification {
  id: string;
  type: NotificationKind;
  payload: {
    actorId?: string;
    actorUsername?: string;
    actorAvatarUrl?: string | null;
    postId?: string;
    postAuthorUsername?: string | null;
    action?: ActivityAction;
    courseId?: string;
    enrollmentId?: string;
    instructorUsername?: string;
    studentUsername?: string;
    status?: string;
  };
  readAt: string | null;
  createdAt: string;
}
export interface NotificationPreference {
  id: string;
  type: NotificationKind;
  enabled: boolean;
}

export async function fetchNotifications(
  after?: string,
): Promise<AppNotification[]> {
  const result = await graphqlRequest<{ myNotifications: AppNotification[] }>({
    query: `query Notifications($after: String) { myNotifications(take: 25, after: $after) { id type payload readAt createdAt } }`,
    variables: after ? { after } : {},
  });
  return result.myNotifications;
}
export async function fetchUnreadNotificationCount(): Promise<number> {
  const result = await graphqlRequest<{ unreadNotificationCount: number }>({
    query: `query UnreadNotificationCount { unreadNotificationCount }`,
  });
  return result.unreadNotificationCount;
}
export async function fetchNotificationPreferences(): Promise<
  NotificationPreference[]
> {
  const result = await graphqlRequest<{
    myNotificationPreferences: NotificationPreference[];
  }>({
    query: `query NotificationPreferences { myNotificationPreferences { id type enabled } }`,
  });
  return result.myNotificationPreferences;
}
export async function markNotificationRead(id: string): Promise<void> {
  await graphqlRequest({
    query: `mutation ReadNotification($id: String!) { markNotificationRead(id: $id) { id readAt } }`,
    variables: { id },
  });
}
export async function setNotificationPreference(
  type: NotificationKind,
  enabled: boolean,
): Promise<void> {
  await graphqlRequest({
    query: `mutation NotificationPreference($type: NotificationType!, $enabled: Boolean!) { setNotificationPreference(type: $type, enabled: $enabled) { id type enabled } }`,
    variables: { type, enabled },
  });
}
