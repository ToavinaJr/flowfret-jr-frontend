import { Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import AppSidebar from "./AppSidebar";
import MobileHeader from "./MobileHeader";
import MobileNav from "./MobileNav";
import { RouteContentSkeleton } from "./skeletons/RouteContentSkeleton";

const AppLayout = () => {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useSidebarCollapsed();

  useEffect(() => {
    document.documentElement.dataset.sidebarCollapsed = String(collapsed);
  }, [collapsed]);

  return (
    <div className="min-h-dvh overflow-x-hidden bg-background">
      <a
        href="#app-main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-background focus:px-4 focus:py-2 focus:text-foreground focus-visible:ring-2 focus-visible:ring-primary"
      >
        {t("common.skipToContent")}
      </a>
      <div className="hidden md:block">
        <AppSidebar
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed(!collapsed)}
        />
      </div>

      <div
        className={cn(
          "flex min-h-dvh w-full flex-col transition-[padding-left] duration-200",
          collapsed ? "md:pl-16" : "md:pl-64 lg:pl-72",
        )}
      >
        <MobileHeader />
        <main
          id="app-main-content"
          tabIndex={-1}
          className="min-h-0 w-full flex-1 overflow-x-hidden pb-44 sm:pb-36 md:pb-20"
        >
          <Suspense fallback={<RouteContentSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
        <MobileNav />
      </div>
    </div>
  );
};

export default AppLayout;
