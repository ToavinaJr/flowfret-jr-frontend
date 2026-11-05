import { Link, NavLink } from "react-router-dom";
import { ChevronLeft, ChevronRight, Guitar, LogOut, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { USER_ROLE } from "@/constants/domain";
import { NAV_SECTIONS } from "@/constants/navigation";
import { useTranslation } from "react-i18next";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";
import { LogoutConfirmationDialog } from "@/components/LogoutConfirmationDialog";

interface AppSidebarProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

const AppSidebar = ({ collapsed, onToggleCollapsed }: AppSidebarProps) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border bg-sidebar transition-[width] duration-200",
        collapsed ? "w-16" : "w-64 lg:w-72",
      )}
    >
      <div className="border-b border-border px-4 py-4 lg:px-6 lg:py-5">
        <Link
          to="/"
          className={cn("flex items-center gap-2", collapsed && "justify-center")}
          aria-label={t("landing.brand")}
        >
          <Guitar className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          {!collapsed ? (
            <span className="truncate text-base font-medium tracking-tight text-foreground lg:text-lg">
              FlowFret
            </span>
          ) : null}
        </Link>
      </div>

      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-label={t(collapsed ? "nav.expandSidebar" : "nav.collapseSidebar")}
        title={t(collapsed ? "nav.expandSidebar" : "nav.collapseSidebar")}
        className={cn(
          "flex min-h-10 items-center gap-2 border-b border-border px-4 text-xs text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground lg:px-6",
          collapsed && "justify-center px-0 lg:px-0",
        )}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        ) : (
          <>
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            <span>{t("nav.collapseSidebar")}</span>
          </>
        )}
      </button>

      <nav
        aria-label={t("nav.mainNavigation")}
        className="flex-1 space-y-1 overflow-y-auto px-2 py-3 lg:px-3 lg:py-4"
      >
        {NAV_SECTIONS.map((section, index) => {
          const headingId = `sidebar-section-${section.id}`;
          return (
            <div
              key={section.id}
              role="group"
              aria-labelledby={section.translationKey ? headingId : undefined}
              className="space-y-1"
            >
              {section.translationKey ? (
                collapsed ? (
                  <div
                    role="separator"
                    className={cn("mx-2 border-t border-border", index > 0 && "!mt-3")}
                  />
                ) : (
                  <p
                    id={headingId}
                    className="px-3 pb-1 pt-4 text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
                  >
                    {t(section.translationKey)}
                  </p>
                )
              ) : null}
              {section.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={collapsed ? t(item.translationKey) : undefined}
                  className={({ isActive }) =>
                    cn(
                      "relative flex min-h-[44px] items-center rounded-md py-2.5 text-sm transition-colors",
                      collapsed ? "justify-center px-2" : "gap-3 px-3",
                      isActive
                        ? "bg-sidebar-accent text-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground",
                    )
                  }
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span className={cn("truncate", collapsed && "sr-only")}>
                    {t(item.translationKey)}
                  </span>
                  {item.path === "/notifications" ? (
                    collapsed ? (
                      <span className="absolute right-1 top-1.5">
                        <NotificationBadge />
                      </span>
                    ) : (
                      <NotificationBadge />
                    )
                  ) : null}
                </NavLink>
              ))}
            </div>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-border p-3">
        {user?.role === USER_ROLE.ADMIN ? (
          <NavLink
            to="/admin"
            title={collapsed ? t("admin.title") : undefined}
            className={({ isActive }) =>
              cn(
                "flex min-h-[44px] items-center rounded-md bg-secondary text-sm hover:text-primary",
                isActive && "text-primary",
                collapsed ? "justify-center px-2" : "gap-2 px-3",
              )
            }
          >
            <ShieldCheck className="h-4 w-4 shrink-0" />
            {!collapsed ? <span className="truncate">{t("admin.title")}</span> : null}
          </NavLink>
        ) : null}
        {user ? (
          <LogoutConfirmationDialog
            trigger={
              <button
                type="button"
                title={collapsed ? `${t("settings.logout")} (${user.username})` : undefined}
                className={cn(
                  "flex min-h-[44px] w-full min-w-0 items-center rounded-md bg-secondary text-sm text-muted-foreground transition-colors hover:text-foreground",
                  collapsed ? "justify-center px-2" : "gap-2 px-2",
                )}
              >
                <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                {!collapsed ? (
                  <span className="truncate">
                    {t("settings.logout")} ({user.username})
                  </span>
                ) : null}
              </button>
            }
          />
        ) : null}
      </div>
    </aside>
  );
};

export default AppSidebar;
