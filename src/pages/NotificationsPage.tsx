import { Link } from "react-router-dom";
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
  FRIEND_POST: "Publications de mes amis",
  POST_COMMENT: "Commentaires sur mes publications",
  FOLLOWED_POST_ACTIVITY: "Activité de mes amis sur les publications suivies",
};

function message(row: AppNotification): string {
  const actor = row.payload.actorUsername || "Un ami";
  if (row.type === "FRIEND_ACCEPTED")
    return `${actor} a accepté votre demande d’amitié.`;
  if (row.type === "FRIEND_POST")
    return `${actor} a publié une nouvelle publication.`;
  if (row.type === "POST_COMMENT")
    return `${actor} a commenté votre publication.`;
  const owner = row.payload.postAuthorUsername
    ? ` de ${row.payload.postAuthorUsername}`
    : "";
  return row.payload.action === "POST_LIKED"
    ? `${actor} a réagi à la publication${owner}.`
    : `${actor} a commenté la publication${owner}.`;
}

export default function NotificationsPage() {
  const client = useQueryClient();
  const notifications = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
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
      toast.success("Préférence mise à jour.");
      void client.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
    onError: () => toast.error("Impossible de modifier cette préférence."),
  });
  if (notifications.isLoading || preferences.isLoading)
    return (
      <main className={PAGE_SHELL}>
        <h1 className={PAGE_TITLE}>Notifications</h1>
        <NotificationsSkeleton />
      </main>
    );
  const configured = new Map(
    (preferences.data ?? []).map((row) => [row.type, row.enabled]),
  );
  const types = Object.keys(preferenceLabels) as ConfigurableKind[];
  return (
    <main className={PAGE_SHELL}>
      <h1 className={PAGE_TITLE}>Notifications</h1>
      <section className="mb-7 rounded-xl border bg-card p-4">
        <h2 className="mb-4 font-semibold">Ce que je souhaite recevoir</h2>
        <div className="space-y-4">
          {types.map((type) => (
            <label
              key={type}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <span>{preferenceLabels[type]}</span>
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
        <h2 className="mb-3 font-semibold">Activité récente</h2>
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
                  <p className="text-sm">{message(row)}</p>
                  <span className="mt-2 block text-xs text-primary">
                    {row.payload.postId
                      ? "Voir la publication"
                      : "Voir le profil"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        {notifications.isSuccess && notifications.data.length === 0 && (
          <div className="rounded-lg border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
            <Bell className="mx-auto mb-2 h-5 w-5" />
            Aucune notification pour le moment.
          </div>
        )}
      </section>
    </main>
  );
}
