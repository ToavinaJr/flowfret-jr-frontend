import { useTranslation } from "react-i18next";
import { Skeleton } from "@/components/ui/skeleton";

export function ConversationsSkeleton() {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={t("common.loading")}>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} aria-hidden="true" className="flex items-center gap-3 border-b border-border/70 px-4 py-3.5">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function MessagesSkeleton() {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={t("common.loading")} className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} aria-hidden="true" className={`w-3/4 max-w-sm space-y-2 rounded-2xl border border-border/70 bg-card px-4 py-3 ${index % 2 ? "ml-auto rounded-br-md" : "rounded-bl-md"}`}>
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}
