import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS, ADMIN_NAV_SECTIONS } from "./adminNavigation";

interface AdminNavProps {
  onNavigate?: () => void;
}

export function AdminNav({ onNavigate }: AdminNavProps) {
  const { t } = useTranslation();
  return (
    <nav aria-label={t("admin.navigationLabel")} className="space-y-1">
      {ADMIN_NAV_SECTIONS.map((section) => {
        const headingId = `admin-nav-${section.id}`;
        const items = ADMIN_NAV_ITEMS.filter((item) =>
          section.paths.includes(item.path),
        );
        return (
          <div
            key={section.id}
            role="group"
            aria-labelledby={section.translationKey ? headingId : undefined}
            className="space-y-1"
          >
            {section.translationKey ? (
              <p
                id={headingId}
                className="px-3 pb-1 pt-4 text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
              >
                {t(section.translationKey)}
              </p>
            ) : null}
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors",
                    isActive
                      ? "bg-secondary font-medium text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )
                }
              >
                <item.icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                <span className="truncate">{t(item.translationKey)}</span>
              </NavLink>
            ))}
          </div>
        );
      })}
    </nav>
  );
}
