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
  FileText,
  type LucideIcon,
} from "lucide-react";

export interface AppNavItem {
  icon: LucideIcon;
  translationKey: string;
  path: string;
}

export const SIDEBAR_NAV_ITEMS: AppNavItem[] = [
  { icon: Home, translationKey: "nav.feed", path: "/" },
  { icon: Search, translationKey: "nav.music", path: "/music" },
  { icon: ListMusic, translationKey: "nav.playlists", path: "/playlists" },
  { icon: FileText, translationKey: "nav.transcriptions", path: "/transcriptions" },
  { icon: Upload, translationKey: "nav.upload", path: "/upload" },
  { icon: Users, translationKey: "nav.friends", path: "/friends" },
  { icon: Bell, translationKey: "nav.notifications", path: "/notifications" },
  { icon: BookOpen, translationKey: "nav.chords", path: "/chords" },
  { icon: Music2, translationKey: "nav.scales", path: "/scales" },
  { icon: Radio, translationKey: "nav.tuner", path: "/tuner" },
  { icon: Timer, translationKey: "nav.metronome", path: "/metronome" },
  { icon: User, translationKey: "nav.profile", path: "/profile" },
  { icon: Menu, translationKey: "nav.more", path: "/menu" },
];

export const MOBILE_TAB_ITEMS: AppNavItem[] = [
  { icon: Home, translationKey: "nav.feed", path: "/" },
  { icon: Search, translationKey: "nav.music", path: "/music" },
  { icon: Upload, translationKey: "nav.upload", path: "/upload" },
  { icon: Users, translationKey: "nav.friends", path: "/friends" },
  { icon: Menu, translationKey: "nav.more", path: "/menu" },
];

export const PAGE_SHELL =
  "w-full max-w-xl mx-auto px-4 py-4 pb-24 sm:px-6 sm:py-6 md:pb-8 lg:max-w-3xl lg:px-8";

export const PAGE_TITLE =
  "text-display text-base sm:text-lg md:text-xl text-foreground mb-4 sm:mb-6";
