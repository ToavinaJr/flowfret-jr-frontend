import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, MessageCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import {
  fetchNotificationPreferences,
  fetchNotifications,
  markNotificationRead,
  setNotificationPreference,
  type AppNotification,
  type NotificationKind,
} from "@/services/api";
import { Switch } from "@/components/ui/switch";
import { NotificationsSkeleton } from "@/components/skeletons/AppSkeletons";

type ConfigurableKind = Exclude<NotificationKind, "FRIEND_ACCEPTED">;
const preferenceLabels: Record<ConfigurableKind, string> = {
  FRIEND_REQUEST: "notifications.preference.friendRequest",
  FRIEND_POST: "notifications.preference.friendPost",
  POST_LIKE: "notifications.preference.postLike",
  POST_COMMENT: "notifications.preference.postComment",
  FOLLOWED_POST_ACTIVITY: "notifications.preference.followedPostActivity",
};

function message(
  row: AppNotification,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  const actor = row.payload.actorUsername || t("notifications.friend");
  if (row.type === "FRIEND_REQUEST")
    return t("notifications.message.friendRequest", { actor });
  if (row.type === "FRIEND_ACCEPTED")
    return t("notifications.message.friendAccepted", { actor });
  if (row.type === "FRIEND_POST")
    return t("notifications.message.friendPost", { actor });
  if (row.type === "POST_COMMENT")
    return t("notifications.message.postComment", { actor });
  if (row.type === "POST_LIKE")
    return t("notifications.message.postLike", { actor });
  const owner = row.payload.postAuthorUsername
    ? t("notifications.postOwner", { owner: row.payload.postAuthorUsername })
    : "";
  return row.payload.action === "POST_LIKED"
    ? t("notifications.message.postLiked", { actor, owner })
    : t("notifications.message.postCommented", { actor, owner });
}

export default function NotificationsPage() {
  const { t } = useTranslation();
  const client = useQueryClient();
  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });
  const preferences = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: fetchNotificationPreferences,
  });
  const read = useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => client.invalidateQueries({ queryKey: ["notifications"] }),
  });
  const updatePreference = useMutation({
    mutationFn: ({
      type,
      enabled,
    }: {
      type: NotificationKind;
      enabled: boolean;
    }) => setNotificationPreference(type, enabled),
    onSuccess: () => {
      toast.success(t("notifications.preferenceUpdated"));
      void client.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
    onError: () => toast.error(t("notifications.preferenceError")),
  });
  if (notifications.isLoading || preferences.isLoading)
    return (
      <main className={PAGE_SHELL}>
        <h1 className={PAGE_TITLE}>{t("notifications.title")}</h1>
        <NotificationsSkeleton />
      </main>
    );
  const configured = new Map(
    (preferences.data ?? []).map((row) => [row.type, row.enabled]),
  );
  const types = Object.keys(preferenceLabels) as ConfigurableKind[];
  return (
    <main className={PAGE_SHELL}>
      <h1 className={PAGE_TITLE}>{t("notifications.title")}</h1>
      {notifications.isError || preferences.isError ? (
        <p
          role="alert"
          className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {t("notifications.loadError")}
        </p>
      ) : null}
      <section className="mb-7 rounded-xl border bg-card p-4">
        <h2 className="mb-4 font-semibold">
          {t("notifications.preferencesTitle")}
        </h2>
        <div className="space-y-4">
          {types.map((type) => (
            <label
              key={type}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <span>{t(preferenceLabels[type])}</span>
              <Switch
                checked={configured.get(type) ?? true}
                disabled={updatePreference.isPending}
                onCheckedChange={(enabled) =>
                  updatePreference.mutate({ type, enabled })
                }
              />
            </label>
          ))}
        </div>
      </section>
      <section>
        <h2 className="mb-3 font-semibold">
          {t("notifications.recentActivity")}
        </h2>
        <div className="space-y-2">
          {(notifications.data ?? []).map((row) => {
            const destination = row.payload.postId
              ? `/post/${row.payload.postId}`
              : `/profile/${row.payload.actorId}`;
            return (
              <Link
                key={row.id}
                to={destination}
                onClick={() => {
                  if (!row.readAt) read.mutate(row.id);
                }}
                className={`flex gap-3 rounded-lg border p-4 transition-colors hover:border-primary/30 ${row.readAt ? "bg-card" : "border-primary/25 bg-primary/5"}`}
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-xs font-semibold">
                  {row.payload.actorAvatarUrl ? (
                    <img
                      src={row.payload.actorAvatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    row.payload.actorUsername?.slice(0, 2).toUpperCase() ||
                    (row.type === "FRIEND_POST" ? (
                      <Users className="h-5 w-5" />
                    ) : (
                      <MessageCircle className="h-5 w-5" />
                    ))
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{message(row, t)}</p>
                  <span className="mt-2 block text-xs text-primary">
                    {row.payload.postId
                      ? t("notifications.viewPost")
                      : t("notifications.viewProfile")}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        {notifications.isSuccess && notifications.data.length === 0 && (
          <div className="rounded-lg border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
            <Bell className="mx-auto mb-2 h-5 w-5" />
            {t("notifications.empty")}
          </div>
        )}
      </section>
    </main>
  );
}
