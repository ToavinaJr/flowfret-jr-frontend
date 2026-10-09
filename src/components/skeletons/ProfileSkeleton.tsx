import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { FeedSkeleton } from "./FeedSkeleton";

export function ProfileSkeleton() {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={t("skeletons.profileLoading")}>
      <div className="mb-6 flex justify-between">
        <Skeleton className="h-8 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-10 w-10" />
        </div>
      </div>
      <section className="mb-6 rounded-xl border bg-card p-5">
        <div className="mb-5 flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        <div className="space-y-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-32" />
        </div>
      </section>
      <Skeleton className="mb-3 h-6 w-28" />
      <FeedSkeleton count={2} />
    </div>
  );
}
