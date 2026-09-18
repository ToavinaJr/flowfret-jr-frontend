import { graphqlRequest } from "@/services/graphqlClient";

export type NotificationKind = "FRIEND_POST" | "POST_COMMENT" | "FOLLOWED_POST_ACTIVITY" | "FRIEND_ACCEPTED";
export interface AppNotification { id: string; type: NotificationKind; payload: { actorId?: string; actorUsername?: string; actorAvatarUrl?: string | null; postId?: string; postAuthorUsername?: string | null; action?: string }; readAt: string | null; createdAt: string }
export interface NotificationPreference { id: string; type: NotificationKind; enabled: boolean }

export async function fetchNotifications(): Promise<AppNotification[]> { const result = await graphqlRequest<{ myNotifications: AppNotification[] }>({ query: `query Notifications { myNotifications { id type payload readAt createdAt } }` }); return result.myNotifications; }
export async function fetchNotificationPreferences(): Promise<NotificationPreference[]> { const result = await graphqlRequest<{ myNotificationPreferences: NotificationPreference[] }>({ query: `query NotificationPreferences { myNotificationPreferences { id type enabled } }` }); return result.myNotificationPreferences; }
export async function markNotificationRead(id: string): Promise<void> { await graphqlRequest({ query: `mutation ReadNotification($id: String!) { markNotificationRead(id: $id) { id readAt } }`, variables: { id } }); }
export async function setNotificationPreference(type: NotificationKind, enabled: boolean): Promise<void> { await graphqlRequest({ query: `mutation NotificationPreference($type: NotificationType!, $enabled: Boolean!) { setNotificationPreference(type: $type, enabled: $enabled) { id type enabled } }`, variables: { type, enabled } }); }

export async function recordTrackListen(trackId: string): Promise<void> { if (!trackId || trackId.length > 255) return; await graphqlRequest({ query: `mutation TrackListened($action: String!, $entityType: String!, $entityId: String) { recordActivity(action: $action, entityType: $entityType, entityId: $entityId) { id } }`, variables: { action: "TRACK_LISTENED", entityType: "track", entityId: trackId } }); }
