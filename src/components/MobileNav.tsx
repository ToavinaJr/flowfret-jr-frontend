import { NavLink, useLocation } from "react-router-dom";
import { Home, Upload, BookOpen, Radio, User } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { icon: Home, label: "Feed", path: "/" },
  { icon: BookOpen, label: "Chords", path: "/chords" },
  { icon: Upload, label: "Upload", path: "/upload" },
  { icon: Radio, label: "Tuner", path: "/tuner" },
  { icon: User, label: "Profile", path: "/profile" },
];

const MobileNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-0.5 p-1.5 text-xs transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
