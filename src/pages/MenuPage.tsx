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
  { to: "/music", label: "Music", icon: Search, desc: "Spotify + Genius search" },
  { to: "/scales", label: "Scales", icon: Music2, desc: "Modes on the fretboard" },
  { to: "/metronome", label: "Metronome", icon: Timer, desc: "BPM & tap tempo" },
  { to: "/upload", label: "Import", icon: Upload, desc: "Analyze audio files" },
  { to: "/histoire", label: "History", icon: History, desc: "Story of the guitar" },
  { to: "/parametres", label: "Settings", icon: Settings, desc: "Preferences" },
  { to: "/contact", label: "Contact", icon: Mail, desc: "Get in touch" },
  { to: "/tuner", label: "Tuner", icon: Radio, desc: "Pitch reference" },
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
              <div className="text-sm font-medium text-foreground">{"translated" in item ? t(item.label) : item.label}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{"translated" in item ? t(item.desc) : item.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
