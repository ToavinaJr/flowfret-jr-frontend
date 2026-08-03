import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Guitar,
  Radio,
  User,
  Upload,
  BookOpen,
  Music2,
  Timer,
  Menu,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import MiniTuner from "./MiniTuner";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { icon: Home, label: "Feed", path: "/" },
  { icon: Upload, label: "Upload", path: "/upload" },
  { icon: Play, label: "Player", path: "/player" },
  { icon: BookOpen, label: "Chords", path: "/chords" },
  { icon: Music2, label: "Scales", path: "/scales" },
  { icon: Timer, label: "Metronome", path: "/metronome" },
  { icon: Radio, label: "Tuner", path: "/tuner" },
  { icon: Menu, label: "More", path: "/menu" },
  { icon: User, label: "Profile", path: "/profile" },
];

const AppSidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-sidebar border-r border-border flex flex-col z-50">
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Guitar className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-display text-foreground">FretFlow</span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 min-h-[44px] rounded-md text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-3">
        <MiniTuner />
        {user && (
          <button
            type="button"
            onClick={logout}
            className="w-full min-h-[44px] rounded-md bg-secondary text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Log out ({user.username})
          </button>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;
