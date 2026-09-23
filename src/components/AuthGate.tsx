import type { ReactNode } from "react";
import { AuthFormPanel } from "@/components/auth/AuthFormPanel";
import { AuthHero } from "@/components/auth/AuthHero";
import { AppShellSkeleton } from "@/components/skeletons/AppSkeletons";
import { useAuthGateFlow } from "@/hooks/useAuthGateFlow";

export function AuthGate({ children }: { children: ReactNode }) {
  const flow = useAuthGateFlow();

  if (flow.status === "loading") return <AppShellSkeleton />;
  if (flow.status === "authenticated") return <>{children}</>;

  return (
    <div className="grid min-h-screen w-full overflow-x-hidden bg-background lg:grid-cols-2">
      <AuthFormPanel flow={flow} />
      <AuthHero />
    </div>
  );
}
