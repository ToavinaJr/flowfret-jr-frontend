import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Guitar, LogOut, Menu, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { SIDEBAR_NAV_ITEMS } from "@/constants/navigation";
import ThemeLanguageControls from "./ThemeLanguageControls";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";
import { useAuth } from "@/hooks/useAuth";
import { USER_ROLE } from "@/constants/domain";
import { LogoutConfirmationDialog } from "@/components/LogoutConfirmationDialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const MobileHeader = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <Link to="/" className="flex min-w-0 items-center gap-2" aria-label={t("landing.brand")}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Guitar className="h-4 w-4 text-primary-foreground" aria-hidden="true" />
        </div>
        <span className="truncate text-base font-medium tracking-tight text-foreground">
          FlowFret
        </span>
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            type="button"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md bg-card text-muted-foreground transition-colors hover:text-foreground"
            aria-label={t("profile.openMenu")}
          >
            <Menu className="h-5 w-5" />
          </button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="flex h-dvh max-h-dvh w-full max-w-xs flex-col gap-0 overflow-hidden p-0 sm:max-w-sm"
        >
          <SheetHeader className="border-b border-border px-4 py-4 text-left">
            <SheetTitle className="text-base font-medium">
              {t("common.menu")}
            </SheetTitle>
          </SheetHeader>
          <nav
            aria-label={t("nav.menuNavigation")}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3"
          >
            <div className="flex flex-col gap-1">
              {SIDEBAR_NAV_ITEMS.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex min-h-[44px] items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                      isActive
                        ? "bg-sidebar-accent text-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{t(item.translationKey)}</span>
                    {item.path === "/notifications" ? (
                      <NotificationBadge />
                    ) : null}
                  </NavLink>
                );
              })}
            </div>
          </nav>
          <div className="shrink-0 space-y-2 border-t border-border bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {user?.role === USER_ROLE.ADMIN ? (
              <NavLink
                to="/admin"
                onClick={() => setOpen(false)}
                className="flex min-h-11 items-center gap-2 rounded-md bg-secondary px-3 text-sm hover:text-primary"
              >
                <ShieldCheck className="h-4 w-4" />
                {t("admin.title")}
              </NavLink>
            ) : null}
            <ThemeLanguageControls compact showTheme={false} />
            {user ? (
              <LogoutConfirmationDialog
                onOpen={() => setOpen(false)}
                trigger={
                  <button
                    type="button"
                    className="flex min-h-11 w-full min-w-0 items-center justify-center gap-2 rounded-md bg-secondary px-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="truncate">
                      {t("settings.logout")} ({user.username})
                    </span>
                  </button>
                }
              />
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default MobileHeader;
