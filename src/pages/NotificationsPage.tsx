import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Bell, MessageCircle, Users } from "lucide-react";
import { toast } from "sonner";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { ACTIVITY_ACTION, NOTIFICATION_KIND } from "@/constants/domain";
import {
  fetchNotificationPreferences,
  fetchNotifications,
  markNotificationRead,
  setNotificationPreference,
  type AppNotification,
  type NotificationKind,
} from "@/services/api";
import { Switch } from "@/components/ui/switch";
import { NotificationsSkeleton } from "@/components/skeletons/NotificationsSkeleton";

type ConfigurableKind = Exclude<
  NotificationKind,
  typeof NOTIFICATION_KIND.FRIEND_ACCEPTED
>;
const preferenceLabels: Record<ConfigurableKind, string> = {
  [NOTIFICATION_KIND.FRIEND_REQUEST]: "notifications.preference.friendRequest",
  [NOTIFICATION_KIND.FRIEND_POST]: "notifications.preference.friendPost",
  [NOTIFICATION_KIND.POST_LIKE]: "notifications.preference.postLike",
  [NOTIFICATION_KIND.POST_COMMENT]: "notifications.preference.postComment",
  [NOTIFICATION_KIND.FOLLOWED_POST_ACTIVITY]:
    "notifications.preference.followedPostActivity",
  [NOTIFICATION_KIND.TEACHING_COURSE_INVITATION]:
    "notifications.preference.courseInvitation",
  [NOTIFICATION_KIND.TEACHING_ENROLLMENT_REQUEST]:
    "notifications.preference.courseRequest",
  [NOTIFICATION_KIND.TEACHING_ENROLLMENT_UPDATED]:
    "notifications.preference.courseUpdate",
  [NOTIFICATION_KIND.TEACHING_LESSON_SCHEDULED]:
    "notifications.preference.lessonUpdates",
  [NOTIFICATION_KIND.TEACHING_LESSON_RESCHEDULED]:
    "notifications.preference.lessonUpdates",
  [NOTIFICATION_KIND.TEACHING_LESSON_CANCELLED]:
    "notifications.preference.lessonUpdates",
  [NOTIFICATION_KIND.TEACHING_LESSON_COMPLETED]:
    "notifications.preference.lessonUpdates",
  [NOTIFICATION_KIND.TEACHING_LESSON_REMINDER]:
    "notifications.preference.lessonReminders",
};

function message(
  row: AppNotification,
  t: (key: string, options?: Record<string, unknown>) => string,
): string {
  const actor = row.payload.actorUsername || t("notifications.friend");
  if (row.type === NOTIFICATION_KIND.FRIEND_REQUEST)
    return t("notifications.message.friendRequest", { actor });
  if (row.type === NOTIFICATION_KIND.FRIEND_ACCEPTED)
    return t("notifications.message.friendAccepted", { actor });
  if (row.type === NOTIFICATION_KIND.FRIEND_POST)
    return t("notifications.message.friendPost", { actor });
  if (row.type === NOTIFICATION_KIND.POST_COMMENT)
    return t("notifications.message.postComment", { actor });
  if (row.type === NOTIFICATION_KIND.POST_LIKE)
    return t("notifications.message.postLike", { actor });
  if (row.type === NOTIFICATION_KIND.TEACHING_COURSE_INVITATION)
    return t("notifications.message.courseInvitation", {
      actor: row.payload.instructorUsername || actor,
    });
  if (row.type === NOTIFICATION_KIND.TEACHING_ENROLLMENT_REQUEST)
    return t("notifications.message.courseRequest", {
      actor: row.payload.studentUsername || actor,
    });
  if (row.type === NOTIFICATION_KIND.TEACHING_ENROLLMENT_UPDATED)
    return t("notifications.message.courseUpdate", {
      status: row.payload.status || "updated",
    });
  if (row.type === NOTIFICATION_KIND.TEACHING_LESSON_SCHEDULED)
    return t("notifications.message.lessonScheduled", {
      course: row.payload.courseTitle || "",
    });
  if (row.type === NOTIFICATION_KIND.TEACHING_LESSON_RESCHEDULED)
    return t("notifications.message.lessonRescheduled", {
      course: row.payload.courseTitle || "",
    });
  if (row.type === NOTIFICATION_KIND.TEACHING_LESSON_CANCELLED)
    return t("notifications.message.lessonCancelled", {
      course: row.payload.courseTitle || "",
    });
  if (row.type === NOTIFICATION_KIND.TEACHING_LESSON_COMPLETED)
    return t("notifications.message.lessonCompleted", {
      course: row.payload.courseTitle || "",
    });
  if (row.type === NOTIFICATION_KIND.TEACHING_LESSON_REMINDER)
    return t("notifications.message.lessonReminder", {
      course: row.payload.courseTitle || "",
      hours: Number(row.payload.minutesBefore) === 1440 ? 24 : 1,
    });
  const owner = row.payload.postAuthorUsername
    ? t("notifications.postOwner", { owner: row.payload.postAuthorUsername })
    : "";
  return row.payload.action === ACTIVITY_ACTION.POST_LIKED
    ? t("notifications.message.postLiked", { actor, owner })
    : t("notifications.message.postCommented", { actor, owner });
}

export default function NotificationsPage() {
  const { t } = useTranslation();
  const client = useQueryClient();
  const notifications = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) =>
      fetchNotifications(typeof pageParam === "string" ? pageParam : undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.length === 25 ? lastPage[lastPage.length - 1]?.id : undefined,
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
      <div className={PAGE_SHELL}>
        <h1 className={PAGE_TITLE}>{t("notifications.title")}</h1>
        <NotificationsSkeleton />
      </div>
    );
  const configured = new Map(
    (preferences.data ?? []).map((row) => [row.type, row.enabled]),
  );
  const types = Object.keys(preferenceLabels) as ConfigurableKind[];
  const rows = notifications.data?.pages.flat() ?? [];
  return (
    <div className={PAGE_SHELL}>
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
              htmlFor={`notification-${type.toLowerCase()}`}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <span>{t(preferenceLabels[type])}</span>
              <Switch
                id={`notification-${type.toLowerCase()}`}
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
          {rows.map((row) => {
            const teachingNotification = row.type.startsWith("TEACHING_");
            const destination = teachingNotification
              ? "/teaching"
              : row.payload.postId
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
                    (row.type === NOTIFICATION_KIND.FRIEND_POST ? (
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
                      : teachingNotification
                        ? t("notifications.viewCourses")
                        : t("notifications.viewProfile")}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        {notifications.hasNextPage ? (
          <button
            type="button"
            disabled={notifications.isFetchingNextPage}
            onClick={() => void notifications.fetchNextPage()}
            className="mt-4 min-h-11 w-full rounded-md border border-border bg-card text-sm disabled:opacity-50"
          >
            {notifications.isFetchingNextPage
              ? t("notifications.loadingMore")
              : t("notifications.loadMore")}
          </button>
        ) : null}
        {notifications.isSuccess && rows.length === 0 && (
          <div className="rounded-lg border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
            <Bell className="mx-auto mb-2 h-5 w-5" />
            {t("notifications.empty")}
          </div>
        )}
      </section>
    </div>
  );
}
