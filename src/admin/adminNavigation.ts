import {
  Activity,
  Database,
  FileText,
  LayoutDashboard,
  Library,
  ScrollText,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  path: string;
  translationKey: string;
  icon: LucideIcon;
  end?: boolean;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    path: "/admin",
    translationKey: "admin.nav.overview",
    icon: LayoutDashboard,
    end: true,
  },
  {
    path: "/admin/users",
    translationKey: "admin.nav.users",
    icon: Users,
  },
  {
    path: "/admin/content",
    translationKey: "admin.nav.content",
    icon: FileText,
  },
  {
    path: "/admin/media",
    translationKey: "admin.nav.media",
    icon: Library,
  },
  {
    path: "/admin/music",
    translationKey: "admin.nav.music",
    icon: Activity,
  },
  {
    path: "/admin/audit",
    translationKey: "admin.nav.audit",
    icon: ScrollText,
  },
  { path: "/admin/data", translationKey: "admin.nav.data", icon: Database },
];
