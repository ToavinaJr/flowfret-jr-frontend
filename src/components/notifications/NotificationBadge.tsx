import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { fetchUnreadNotificationCount } from "@/services/notificationsApi";

const NOTIFICATION_REFRESH_INTERVAL_MS = 15_000;

export function NotificationBadge() {
  const { t } = useTranslation();
  const unread = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: fetchUnreadNotificationCount,
    refetchInterval: NOTIFICATION_REFRESH_INTERVAL_MS,
    refetchOnWindowFocus: true,
  });

  const count = unread.data ?? 0;
  if (count < 1) return null;

  return (
    <span
      className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground"
      aria-label={t("notifications.unreadCount", { count })}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}
