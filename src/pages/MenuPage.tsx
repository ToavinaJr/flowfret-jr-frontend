import { Link } from "react-router-dom";
import { LogOut, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LogoutConfirmationDialog } from "@/components/LogoutConfirmationDialog";
import { USER_ROLE } from "@/constants/domain";
import {
  MORE_PAGE_SECTIONS,
  PAGE_SHELL,
  PAGE_TITLE,
} from "@/constants/navigation";
import { useAuth } from "@/hooks/useAuth";

const ROW_CLASS =
  "flex min-h-[56px] w-full items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition-colors hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const MenuPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  return (
    <div className={`${PAGE_SHELL} max-w-2xl lg:max-w-2xl`}>
      <h1 className={`${PAGE_TITLE} mb-2`}>{t("morePage.title")}</h1>

      {MORE_PAGE_SECTIONS.map((section) => {
        const headingId = `more-section-${section.id}`;
        return (
          <section
            key={section.id}
            aria-labelledby={section.translationKey ? headingId : undefined}
            className="mb-6"
          >
            {section.translationKey ? (
              <h2
                id={headingId}
                className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
              >
                {t(section.translationKey)}
              </h2>
            ) : null}
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {section.items.map((item) => (
                <li key={item.path}>
                  <Link to={item.path} className={ROW_CLASS}>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary">
                      <item.icon className="h-4 w-4 text-foreground" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 truncate text-sm font-medium text-foreground">
                      {t(item.translationKey)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <div className="space-y-2 border-t border-border pt-4">
        {user?.role === USER_ROLE.ADMIN ? (
          <Link to="/admin" className={ROW_CLASS}>
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="text-sm font-medium">{t("admin.title")}</span>
          </Link>
        ) : null}
        {user ? (
          <LogoutConfirmationDialog
            trigger={
              <button type="button" className={ROW_CLASS}>
                <LogOut className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span className="min-w-0 truncate text-sm font-medium">
                  {t("settings.logout")} ({user.username})
                </span>
              </button>
            }
          />
        ) : null}
      </div>
    </div>
  );
};

export default MenuPage;
