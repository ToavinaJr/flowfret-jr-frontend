import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { MOBILE_TAB_ITEMS } from "@/constants/navigation";
import { useTranslation } from "react-i18next";

const MobileNav = () => {
  const { t } = useTranslation();

  return (
    <nav aria-label={t("nav.mobileNavigation")} className="fixed bottom-0 left-0 right-0 z-50 min-h-[60px] border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-card/90 md:hidden">
      <div className="flex items-stretch justify-around gap-0.5 px-1 py-1.5">
        {MOBILE_TAB_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex min-h-[48px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-1 text-[11px] leading-tight transition-colors sm:text-xs",
                isActive
                  ? "bg-primary/10 font-semibold text-primary"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="max-w-full truncate">{t(item.translationKey)}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;
