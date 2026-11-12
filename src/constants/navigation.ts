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
  GraduationCap,
  MessageCircle,
  Settings,
  CircleHelp,
  History,
  Heart,
  Sparkles,
  BarChart3,
  Mail,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface AppNavItem {
  icon: LucideIcon;
  translationKey: string;
  path: string;
  /** Additional paths that keep this entry highlighted (e.g. a grouped section). */
  matchPaths?: readonly string[];
}

export interface AppNavSection {
  id: string;
  /** Section heading. Omitted for a standalone entry such as the home page. */
  translationKey?: string;
  items: AppNavItem[];
}

const HOME: AppNavItem = { icon: Home, translationKey: "nav.feed", path: "/" };
const MESSAGES: AppNavItem = {
  icon: MessageCircle,
  translationKey: "nav.messages",
  path: "/messages",
};

/** Practice tools share one secondary navigation bar. */
export const TOOL_NAV_ITEMS: AppNavItem[] = [
  { icon: BookOpen, translationKey: "nav.chords", path: "/chords" },
  { icon: Music2, translationKey: "nav.scales", path: "/scales" },
  { icon: Radio, translationKey: "nav.tuner", path: "/tuner" },
  { icon: Timer, translationKey: "nav.metronome", path: "/metronome" },
];

export const NAV_SECTIONS: AppNavSection[] = [
  { id: "home", items: [HOME] },
  {
    id: "music",
    translationKey: "nav.sections.music",
    items: [
      { icon: Search, translationKey: "nav.music", path: "/music" },
      { icon: Heart, translationKey: "nav.favorites", path: "/favorites" },
      { icon: Sparkles, translationKey: "nav.recommendations", path: "/recommendations" },
      { icon: ListMusic, translationKey: "nav.playlists", path: "/playlists" },
      { icon: BarChart3, translationKey: "nav.stats", path: "/stats" },
      { icon: Upload, translationKey: "nav.upload", path: "/upload" },
      { icon: FileText, translationKey: "nav.transcriptions", path: "/transcriptions",},
    ],
  },
  {
    id: "learn",
    translationKey: "nav.sections.learn",
    items: [
      { icon: GraduationCap, translationKey: "nav.courses", path: "/teaching" },
      ...TOOL_NAV_ITEMS,
    ],
  },
  {
    id: "community",
    translationKey: "nav.sections.community",
    items: [
      MESSAGES,
      { icon: Users, translationKey: "nav.friends", path: "/friends" },
      { icon: Bell, translationKey: "nav.notifications", path: "/notifications" },
    ],
  },
  {
    id: "account",
    translationKey: "nav.sections.account",
    items: [
      { icon: User, translationKey: "nav.profile", path: "/profile" },
      { icon: Settings, translationKey: "nav.settings", path: "/parametres" },
      { icon: CircleHelp, translationKey: "nav.help", path: "/help" },
      { icon: History, translationKey: "nav.history", path: "/histoire" },
      { icon: Mail, translationKey: "nav.contact", path: "/contact" },
    ],
  },
];

export const MOBILE_TAB_ITEMS: AppNavItem[] = [
  HOME,
  { icon: Search, translationKey: "nav.music", path: "/music" },
  {
    icon: Wrench,
    translationKey: "nav.tools",
    path: TOOL_NAV_ITEMS[0].path,
    matchPaths: TOOL_NAV_ITEMS.map((item) => item.path),
  },
  MESSAGES,
  { icon: Menu, translationKey: "nav.more", path: "/menu" },
];

function navItemPaths(item: AppNavItem): string[] {
  return [item.path, ...(item.matchPaths ?? [])];
}

function matchesPath(pathname: string, path: string): boolean {
  return path === "/"
    ? pathname === "/"
    : pathname === path || pathname.startsWith(`${path}/`);
}

export function isNavItemActive(item: AppNavItem, pathname: string): boolean {
  return navItemPaths(item).some((path) => matchesPath(pathname, path));
}

const PRIMARY_MOBILE_PATHS = new Set(MOBILE_TAB_ITEMS.flatMap(navItemPaths));

/** Entries reachable from the mobile "More" page: everything not already a bottom tab. */
export const MORE_PAGE_SECTIONS: AppNavSection[] = NAV_SECTIONS.map(
  (section) => ({
    ...section,
    items: section.items.filter((item) => !PRIMARY_MOBILE_PATHS.has(item.path)),
  }),
).filter((section) => section.items.length > 0);

export const PAGE_SHELL =
  "w-full max-w-xl mx-auto px-4 py-4 pb-24 sm:px-6 sm:py-6 md:pb-8 lg:max-w-3xl lg:px-8";

export const PAGE_TITLE =
  "text-display text-base sm:text-lg md:text-xl text-foreground mb-4 sm:mb-6";
