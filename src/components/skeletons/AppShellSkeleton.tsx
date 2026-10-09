import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { FeedSkeleton } from "./FeedSkeleton";

export function AppShellSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className="flex min-h-dvh bg-background"
      role="status"
      aria-busy="true"
      aria-label={t("skeletons.appLoading")}
    >
      <aside className="hidden w-64 shrink-0 border-r border-border p-5 md:block lg:w-72">
        <div className="mb-10 flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-xl" />
          <Skeleton className="h-6 w-28" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg p-3">
              <Skeleton className="h-5 w-5" />
              <Skeleton className={`h-4 ${i % 3 === 0 ? "w-24" : "w-20"}`} />
            </div>
          ))}
        </div>
      </aside>
      <main className="mx-auto w-full max-w-xl p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between">
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-11 w-11 rounded-lg" />
        </div>
        <FeedSkeleton count={3} />
      </main>
    </div>
  );
}
