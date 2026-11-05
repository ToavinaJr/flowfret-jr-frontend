import { NavLink, Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { TOOL_NAV_ITEMS } from "@/constants/navigation";

/** Shared secondary navigation for the practice tools (chords, scales, tuner, metronome). */
const ToolsLayout = () => {
  const { t } = useTranslation();

  return (
    <>
      <nav
        aria-label={t("nav.toolsNavigation")}
        className="mx-auto w-full max-w-xl px-4 pt-4 sm:px-6 lg:max-w-3xl lg:px-8"
      >
        <ul className="flex gap-2 overflow-x-auto border-b border-border pb-2">
          {TOOL_NAV_ITEMS.map((item) => (
            <li key={item.path} className="shrink-0">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex min-h-11 items-center gap-2 rounded-md px-4 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                {t(item.translationKey)}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <Outlet />
    </>
  );
};

export default ToolsLayout;
