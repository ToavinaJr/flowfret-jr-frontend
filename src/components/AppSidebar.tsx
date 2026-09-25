import { NavLink, useLocation } from "react-router-dom";
import { Guitar, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { USER_ROLE } from "@/constants/domain";
import { SIDEBAR_NAV_ITEMS } from "@/constants/navigation";
import { useTranslation } from "react-i18next";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";

const AppSidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-border bg-sidebar lg:w-72">
      <div className="border-b border-border px-4 py-4 lg:px-6 lg:py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Guitar className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="truncate text-base font-medium tracking-tight text-foreground lg:text-lg">
            FlowFret
          </span>
        </div>
      </div>

      <nav
        aria-label={t("nav.mainNavigation")}
        className="flex-1 space-y-1 overflow-y-auto px-2 py-3 lg:px-3 lg:py-4"
      >
        {SIDEBAR_NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{t(item.translationKey)}</span>
              {item.path === "/notifications" ? <NotificationBadge /> : null}
            </NavLink>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-border p-3">
        {user?.role === USER_ROLE.ADMIN ? (
          <NavLink
            to="/admin"
            className="flex min-h-[44px] items-center gap-2 rounded-md bg-secondary px-3 text-sm hover:text-primary"
          >
            <ShieldCheck className="h-4 w-4" /> {t("admin.title")}
          </NavLink>
        ) : null}
        {user && (
          <button
            type="button"
            onClick={logout}
            className="w-full min-h-[44px] truncate rounded-md bg-secondary px-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {t("settings.logout")} ({user.username})
          </button>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;
