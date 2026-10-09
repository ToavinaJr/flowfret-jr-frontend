import { Link } from "react-router-dom";
import {
  History,
  Mail,
  Music2,
  Radio,
  Search,
  Settings,
  Timer,
  Upload,
  CircleHelp,
} from "lucide-react";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { useTranslation } from "react-i18next";

const links = [
  { to: "/help", label: "help.menuLabel", icon: CircleHelp, desc: "help.menuDescription", translated: true },
  { to: "/music", label: "music", icon: Search, desc: "musicDescription" },
  { to: "/scales", label: "scales", icon: Music2, desc: "scalesDescription" },
  { to: "/metronome", label: "metronome", icon: Timer, desc: "metronomeDescription" },
  { to: "/upload", label: "upload", icon: Upload, desc: "uploadDescription" },
  { to: "/histoire", label: "history", icon: History, desc: "historyDescription" },
  { to: "/parametres", label: "settings", icon: Settings, desc: "settingsDescription" },
  { to: "/contact", label: "contact", icon: Mail, desc: "contactDescription" },
  { to: "/tuner", label: "tuner", icon: Radio, desc: "tunerDescription" },
];

const MenuPage = () => {
  const { t } = useTranslation();
  return (
    <div className={`${PAGE_SHELL} max-w-2xl lg:max-w-2xl`}>
      <h1 className={`${PAGE_TITLE} mb-2`}>{t("morePage.title")}</h1>
      <p className="mb-4 text-sm text-muted-foreground sm:mb-6">
        {t("morePage.subtitle")}
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {links.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex min-h-[72px] items-start gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:bg-surface-elevated sm:p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary">
              <item.icon className="h-4 w-4 text-foreground" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground">{t(`morePage.items.${item.label}`)}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{t(`morePage.items.${item.desc}`)}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
