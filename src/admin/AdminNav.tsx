import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { ADMIN_NAV_ITEMS } from "./adminNavigation";

interface AdminNavProps {
  onNavigate?: () => void;
}

export function AdminNav({ onNavigate }: AdminNavProps) {
  const { t } = useTranslation();
  return (
    <nav aria-label={t("admin.navigationLabel")} className="space-y-1">
      {ADMIN_NAV_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors",
              isActive
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )
          }
        >
          <item.icon aria-hidden="true" className="h-4 w-4 shrink-0" />
          <span className="truncate">{t(item.translationKey)}</span>
        </NavLink>
      ))}
    </nav>
  );
}
