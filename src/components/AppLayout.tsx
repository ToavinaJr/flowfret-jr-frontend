import { Outlet } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import MobileHeader from "./MobileHeader";
import MobileNav from "./MobileNav";

const AppLayout = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      <div className="flex min-h-screen w-full flex-col md:pl-64 lg:pl-72">
        <MobileHeader />
        <main className="min-h-0 w-full flex-1 overflow-x-hidden">
          <Outlet />
        </main>
        <MobileNav />
      </div>
    </div>
  );
};

export default AppLayout;
