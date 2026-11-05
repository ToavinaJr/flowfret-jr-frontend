import { lazy, Suspense, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AppShellSkeleton } from "@/components/skeletons/AppShellSkeleton";
import { useAuthGateFlow } from "@/hooks/useAuthGateFlow";

const AuthFormPanel = lazy(() =>
  import("@/components/auth/AuthFormPanel").then((module) => ({
    default: module.AuthFormPanel,
  })),
);
const AuthHero = lazy(() =>
  import("@/components/auth/AuthHero").then((module) => ({
    default: module.AuthHero,
  })),
);
const LandingPage = lazy(() => import("@/pages/LandingPage"));

export function AuthGate({ children }: { children: ReactNode }) {
  const flow = useAuthGateFlow();
  const location = useLocation();

  if (flow.status === "loading") return <AppShellSkeleton />;
  if (flow.status === "authenticated") {
    if (location.pathname === "/login" || location.pathname === "/register") {
      return <Navigate to={getReturnDestination(location.state)} replace />;
    }
    return <>{children}</>;
  }

  if (location.pathname === "/") {
    return (
      <Suspense fallback={<AppShellSkeleton />}>
        <LandingPage />
      </Suspense>
    );
  }

  if (
    !["/login", "/register", "/verify-email", "/reset-password"].includes(
      location.pathname,
    )
  ) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          returnTo: `${location.pathname}${location.search}${location.hash}`,
        }}
      />
    );
  }

  return (
    <Suspense fallback={<AppShellSkeleton />}>
      <div className="grid min-h-screen w-full overflow-x-hidden bg-background lg:grid-cols-2">
        <AuthFormPanel flow={flow} />
        <AuthHero />
      </div>
    </Suspense>
  );
}

function getReturnDestination(state: unknown): string {
  if (!state || typeof state !== "object" || !("returnTo" in state)) {
    return "/";
  }

  const { returnTo } = state as { returnTo?: unknown };
  if (
    typeof returnTo !== "string" ||
    !returnTo.startsWith("/") ||
    returnTo.startsWith("//")
  ) {
    return "/";
  }

  return returnTo;
}
