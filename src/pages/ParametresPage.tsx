import { useTranslation } from "react-i18next";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import ThemeLanguageControls from "@/components/ThemeLanguageControls";
import { NotationSetting } from "@/components/settings/NotationSetting";
import { AccountSecurity } from "@/components/settings/AccountSecurity";
import { SessionManager } from "@/components/settings/SessionManager";

const ParametresPage = () => {
  const { t } = useTranslation();

  return (
    <div className={`${PAGE_SHELL} max-w-lg lg:max-w-lg`}>
      <h1 className={PAGE_TITLE}>{t("settings.title")}</h1>

      <ThemeLanguageControls />

      <div className="mt-4">
        <NotationSetting />
      </div>

      <div className="mt-4 space-y-4">
        <SessionManager />
        <AccountSecurity />
      </div>
    </div>
  );
};

export default ParametresPage;
