import { useTranslation } from "react-i18next";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";

const HistoirePage = () => {
  const { t } = useTranslation();
  return (
    <div className={`${PAGE_SHELL} max-w-2xl lg:max-w-2xl`}>
      <h1 className={PAGE_TITLE}>{t("history.title")}</h1>
      <div className="space-y-4 text-body text-muted-foreground">
        <p>{t("history.origins")}</p>
        <p>{t("history.modern")}</p>
        <p>{t("history.flowfret")}</p>
      </div>
    </div>
  );
};
export default HistoirePage;
