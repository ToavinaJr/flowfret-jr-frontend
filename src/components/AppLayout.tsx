import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import MobileHeader from "./MobileHeader";
import MobileNav from "./MobileNav";
import PersistentMediaPlayer from "./PersistentMediaPlayer";
import { RouteContentSkeleton } from "./skeletons/AppSkeletons";

const AppLayout = () => {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-background">
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      <div className="flex min-h-dvh w-full flex-col md:pl-64 lg:pl-72">
        <MobileHeader />
        <main className="min-h-0 w-full flex-1 overflow-x-hidden pb-44 sm:pb-36 md:pb-20">
          <Suspense fallback={<RouteContentSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
        <MobileNav />
        <PersistentMediaPlayer />
      </div>
    </div>
  );
};

export default AppLayout;
