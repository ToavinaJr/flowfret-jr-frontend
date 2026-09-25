import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { ArrowLeft, Guitar, LogOut, Menu, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { AdminNav } from "./AdminNav";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function AdminLayout() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const accountActions = (
    <div className="space-y-2">
      <Link
        to="/"
        className="flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        {t("admin.backToApp")}
      </Link>
      <button
        type="button"
        onClick={() => void logout()}
        className="flex min-h-11 w-full min-w-0 items-center gap-2 rounded-lg px-3 text-left text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
      >
        <LogOut aria-hidden="true" className="h-4 w-4 shrink-0" />
        <span className="truncate">
          {t("settings.logout")} ({user?.username})
        </span>
      </button>
    </div>
  );

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-card/60 backdrop-blur-xl lg:flex">
        <div className="flex h-20 items-center gap-3 border-b border-border px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Guitar aria-hidden="true" className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-semibold">FlowFret</div>
            <div className="text-xs text-muted-foreground">
              {t("admin.title")}
            </div>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <AdminNav />
        </div>
        <div className="border-t border-border p-3">{accountActions}</div>
      </aside>

      <div className="min-h-dvh lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <ShieldCheck aria-hidden="true" className="h-5 w-5 text-primary" />
            <span className="truncate text-sm font-medium sm:text-base">
              {t("admin.title")}
            </span>
          </div>
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label={t("admin.openNavigation")}
                className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border border-border bg-card lg:hidden"
              >
                <Menu aria-hidden="true" className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="flex h-dvh w-[min(21rem,90vw)] flex-col p-0"
            >
              <SheetHeader className="border-b border-border px-4 py-5 text-left">
                <SheetTitle>{t("admin.title")}</SheetTitle>
              </SheetHeader>
              <div className="min-h-0 flex-1 overflow-y-auto p-3">
                <AdminNav onNavigate={() => setMenuOpen(false)} />
              </div>
              <div className="border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                {accountActions}
              </div>
            </SheetContent>
          </Sheet>
        </header>
        <main className="mx-auto w-full max-w-[100rem] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
