import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

export function CommentsSkeleton() {
  const { t } = useTranslation();
  return (
    <div
      className="space-y-3 py-2"
      role="status"
      aria-label={t("skeletons.commentsLoading")}
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex gap-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
