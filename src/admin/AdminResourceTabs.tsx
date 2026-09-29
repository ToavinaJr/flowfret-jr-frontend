import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export interface AdminResourceTab {
  value: string;
  labelKey: string;
}

export function AdminResourceTabs({
  basePath,
  active,
  tabs,
}: {
  basePath: string;
  active: string;
  tabs: AdminResourceTab[];
}) {
  const { t } = useTranslation();
  return (
    <nav
      aria-label={t("admin.resourceNavigation")}
      className="flex gap-2 overflow-x-auto border-b border-border pb-2"
    >
      {tabs.map((tab) => (
        <Link
          key={tab.value}
          to={`${basePath}?view=${encodeURIComponent(tab.value)}`}
          aria-current={active === tab.value ? "page" : undefined}
          className={`min-h-11 shrink-0 rounded-lg px-4 py-3 text-sm font-medium ${active === tab.value ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground"}`}
        >
          {t(tab.labelKey)}
        </Link>
      ))}
    </nav>
  );
}
