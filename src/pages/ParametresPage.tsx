import { useTranslation } from "react-i18next";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import ThemeLanguageControls from "@/components/ThemeLanguageControls";

const ParametresPage = () => {
  const { t } = useTranslation();

  return (
    <div className={`${PAGE_SHELL} max-w-lg lg:max-w-lg`}>
      <h1 className={PAGE_TITLE}>{t("settings.title")}</h1>

      <ThemeLanguageControls />

      <div className="rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground sm:p-4">
        {t("settings.audioNotice")}
      </div>
    </div>
  );
};

export default ParametresPage;
