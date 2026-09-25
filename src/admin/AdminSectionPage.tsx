import { Construction } from "lucide-react";
import { useTranslation } from "react-i18next";

interface AdminSectionPageProps {
  section: "users" | "media" | "music" | "audit";
}

export default function AdminSectionPage({ section }: AdminSectionPageProps) {
  const { t } = useTranslation();
  return (
    <section aria-labelledby={`admin-${section}-title`}>
      <h1 id={`admin-${section}-title`} className="text-2xl font-semibold sm:text-3xl">
        {t(`admin.nav.${section}`)}
      </h1>
      <div className="mt-6 flex min-h-52 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-6 text-center">
        <Construction className="h-8 w-8 text-primary" />
        <p className="mt-4 font-medium">{t("admin.sectionReady")}</p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          {t("admin.sectionDescription")}
        </p>
      </div>
    </section>
  );
}
