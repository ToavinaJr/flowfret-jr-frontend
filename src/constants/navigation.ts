import {
  Home,
  Radio,
  User,
  Upload,
  BookOpen,
  Music2,
  Timer,
  Menu,
  Play,
  Search,
  type LucideIcon,
} from "lucide-react";

export interface AppNavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

export const SIDEBAR_NAV_ITEMS: AppNavItem[] = [
  { icon: Home, label: "Feed", path: "/" },
  { icon: Search, label: "Music", path: "/music" },
  { icon: Upload, label: "Upload", path: "/upload" },
  { icon: Play, label: "Player", path: "/player" },
  { icon: BookOpen, label: "Chords", path: "/chords" },
  { icon: Music2, label: "Scales", path: "/scales" },
  { icon: Timer, label: "Metronome", path: "/metronome" },
  { icon: Radio, label: "Tuner", path: "/tuner" },
  { icon: Menu, label: "More", path: "/menu" },
  { icon: User, label: "Profile", path: "/profile" },
];

export const MOBILE_TAB_ITEMS: AppNavItem[] = [
  { icon: Home, label: "Feed", path: "/" },
  { icon: Search, label: "Music", path: "/music" },
  { icon: Play, label: "Player", path: "/player" },
  { icon: Upload, label: "Upload", path: "/upload" },
  { icon: Menu, label: "More", path: "/menu" },
];

export const PAGE_SHELL =
  "w-full max-w-xl mx-auto px-4 py-4 pb-24 sm:px-6 sm:py-6 md:pb-8 lg:max-w-3xl lg:px-8";

export const PAGE_TITLE =
  "text-display text-base sm:text-lg md:text-xl text-foreground mb-4 sm:mb-6";
