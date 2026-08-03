import { Link } from "react-router-dom";
import {
  BookOpen,
  History,
  Mail,
  Music2,
  Radio,
  Settings,
  Timer,
  Upload,
} from "lucide-react";

const links = [
  { to: "/scales", label: "Scales", icon: Music2, desc: "Modes on the fretboard" },
  { to: "/metronome", label: "Metronome", icon: Timer, desc: "BPM & tap tempo" },
  { to: "/player", label: "Player", icon: BookOpen, desc: "Song + chord sync" },
  { to: "/upload", label: "Import", icon: Upload, desc: "Analyze audio files" },
  { to: "/histoire", label: "History", icon: History, desc: "Story of the guitar" },
  { to: "/parametres", label: "Settings", icon: Settings, desc: "Preferences" },
  { to: "/contact", label: "Contact", icon: Mail, desc: "Get in touch" },
  { to: "/tuner", label: "Tuner", icon: Radio, desc: "Pitch reference" },
];

const MenuPage = () => {
  return (
    <div className="px-4 py-6 pb-20 md:pb-6 max-w-2xl mx-auto">
      <h1 className="text-display text-foreground mb-2">Menu</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Tools and pages beyond the main navigation.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {links.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-start gap-3 p-4 min-h-[72px] rounded-lg bg-card border border-border hover:bg-surface-elevated transition-colors"
          >
            <div className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center flex-shrink-0">
              <item.icon className="h-4 w-4 text-foreground" />
            </div>
            <div>
              <div className="text-sm text-foreground font-medium">{item.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MenuPage;
