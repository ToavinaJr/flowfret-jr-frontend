import { lazy, Suspense, type ReactNode } from "react";
import { AppShellSkeleton } from "@/components/skeletons/AppSkeletons";
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

export function AuthGate({ children }: { children: ReactNode }) {
  const flow = useAuthGateFlow();

  if (flow.status === "loading") return <AppShellSkeleton />;
  if (flow.status === "authenticated") return <>{children}</>;

  return (
    <Suspense fallback={<AppShellSkeleton />}>
      <div className="grid min-h-screen w-full overflow-x-hidden bg-background lg:grid-cols-2">
        <AuthFormPanel flow={flow} />
        <AuthHero />
      </div>
    </Suspense>
  );
}
