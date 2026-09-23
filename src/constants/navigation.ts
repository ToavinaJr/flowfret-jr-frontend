import {
  Home,
  Radio,
  User,
  Users,
  Bell,
  Upload,
  BookOpen,
  Music2,
  Timer,
  Menu,
  Search,
  ListMusic,
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
  { icon: ListMusic, label: "Playlists", path: "/playlists" },
  { icon: Upload, label: "Upload", path: "/upload" },
  { icon: Users, label: "Amis", path: "/friends" },
  { icon: Bell, label: "Notifications", path: "/notifications" },
  { icon: BookOpen, label: "Chords", path: "/chords" },
  { icon: Music2, label: "Scales", path: "/scales" },
  { icon: Radio, label: "Tuner", path: "/tuner" },
  { icon: Timer, label: "Metronome", path: "/metronome" },
  { icon: User, label: "Profile", path: "/profile" },
  { icon: Menu, label: "More", path: "/menu" },
];

export const MOBILE_TAB_ITEMS: AppNavItem[] = [
  { icon: Home, label: "Feed", path: "/" },
  { icon: Search, label: "Music", path: "/music" },
  { icon: Upload, label: "Upload", path: "/upload" },
  { icon: Users, label: "Amis", path: "/friends" },
  { icon: Menu, label: "More", path: "/menu" },
];

export const PAGE_SHELL =
  "w-full max-w-xl mx-auto px-4 py-4 pb-24 sm:px-6 sm:py-6 md:pb-8 lg:max-w-3xl lg:px-8";

export const PAGE_TITLE =
  "text-display text-base sm:text-lg md:text-xl text-foreground mb-4 sm:mb-6";
