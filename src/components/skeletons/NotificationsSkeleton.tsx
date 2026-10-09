import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { PersonListSkeleton } from "./PersonListSkeleton";

export function NotificationsSkeleton() {
  const { t } = useTranslation();
  return (
    <div role="status" aria-label={t("skeletons.notificationsLoading")}>
      <section className="mb-7 rounded-xl border bg-card p-4">
        <Skeleton className="mb-5 h-5 w-52" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="mb-4 flex justify-between">
            <Skeleton className="h-4 w-64" />
            <Skeleton className="h-6 w-11 rounded-full" />
          </div>
        ))}
      </section>
      <Skeleton className="mb-3 h-5 w-32" />
      <PersonListSkeleton count={4} />
    </div>
  );
}
