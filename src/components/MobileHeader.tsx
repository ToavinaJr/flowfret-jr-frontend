import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Guitar, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { SIDEBAR_NAV_ITEMS } from "@/constants/navigation";
import ThemeLanguageControls from "./ThemeLanguageControls";
import { NotificationBadge } from "@/components/notifications/NotificationBadge";
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
  const [open, setOpen] = useState(false);

  const fallbackNavLabels: Record<string, string> = {
    "/": "nav.feed",
    "/music": "nav.music",
    "/upload": "nav.upload",
    "/friends": "friends.title",
    "/notifications": "notifications.title",
    "/chords": "nav.chords",
    "/scales": "nav.scales",
    "/metronome": "nav.metronome",
    "/tuner": "nav.tuner",
    "/menu": "nav.more",
    "/profile": "nav.profile",
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary">
          <Guitar className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="truncate text-base font-medium tracking-tight text-foreground">
          FretFlow
        </span>
      </div>

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
        <SheetContent side="left" className="w-full max-w-xs p-0 sm:max-w-sm">
          <SheetHeader className="border-b border-border px-4 py-4 text-left">
            <SheetTitle className="text-base font-medium">
              {t("common.menu")}
            </SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col gap-1 overflow-y-auto p-3">
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
                  <span>
                    {t(item.label, {
                      defaultValue: t(
                        fallbackNavLabels[item.path] ?? item.label,
                      ),
                    })}
                  </span>
                  {item.path === "/notifications" ? (
                    <NotificationBadge />
                  ) : null}
                </NavLink>
              );
            })}
          </nav>
          <div className="border-t border-border p-3">
            <ThemeLanguageControls compact showTheme={false} />
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default MobileHeader;
