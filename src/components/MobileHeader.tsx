import { Link } from "react-router-dom";
import { Bell, Guitar, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";

const ICON_LINK_CLASS =
  "relative inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const MobileHeader = () => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-background px-4 py-2 md:hidden">
      <Link to="/" className="flex min-w-0 items-center gap-2" aria-label={t("landing.brand")}>
        <Guitar className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
        <span className="truncate text-base font-medium tracking-tight text-foreground">
          FlowFret
        </span>
      </Link>

      <div className="flex shrink-0 items-center gap-1">
        <Link to="/notifications" className={ICON_LINK_CLASS} aria-label={t("nav.notifications")}>
          <Bell className="h-5 w-5" aria-hidden="true" />
          <span className="absolute right-0 top-1">
            <NotificationBadge />
          </span>
        </Link>
        <Link to="/profile" className={ICON_LINK_CLASS} aria-label={t("nav.profile")}>
          <User className="h-5 w-5" aria-hidden="true" />
        </Link>
      </div>
    </header>
  );
};

export default MobileHeader;
