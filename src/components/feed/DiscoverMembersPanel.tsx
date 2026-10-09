import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { searchUsers, sendFriendRequest } from "@/services/friendsApi";
import type { SocialUser } from "@/services/profileApi";
import { PersonListSkeleton } from "@/components/skeletons/PersonListSkeleton";

const DISCOVERY_LIMIT = 4;

export function DiscoverMembersPanel() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const members = useQuery({
    queryKey: ["feed-discover-members"],
    queryFn: () => searchUsers(""),
    enabled: Boolean(user),
    staleTime: 60_000,
  });
  const request = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      toast.success(t("friends.requestSent"));
      void queryClient.invalidateQueries({ queryKey: ["friendships"] });
      void queryClient.invalidateQueries({ queryKey: ["feed-discover-members"] });
    },
    onError: (error: Error) => toast.error(error.message || t("friends.searchError")),
  });

  if (!user) return null;

  return (
    <section className="rounded-xl border border-border bg-card p-4" aria-labelledby="feed-discover-title">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 id="feed-discover-title" className="font-semibold text-foreground">{t("feed.discoverMembers")}</h2>
        <Link to="/friends#discover" className="text-sm text-primary hover:underline">{t("feed.seeAllMembers")}</Link>
      </div>
      {members.isPending ? (
        <PersonListSkeleton count={3} />
      ) : members.isError ? (
        <div className="text-sm text-muted-foreground">
          <p>{t("friends.searchError")}</p>
          <button type="button" onClick={() => void members.refetch()} className="mt-2 min-h-10 text-primary hover:underline">{t("common.retry")}</button>
        </div>
      ) : members.data.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("feed.noMembersToDiscover")}</p>
      ) : (
        <ul className="space-y-3">
          {members.data.slice(0, DISCOVERY_LIMIT).map((person: SocialUser) => {
            const name = person.profile?.displayName || person.username;
            return (
              <li key={person.id} className="flex min-w-0 items-center gap-2">
                <Link to={`/profile/${person.id}`} className="flex min-w-0 flex-1 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-secondary text-xs font-semibold text-foreground">
                    {person.profile?.avatarUrl ? <img src={person.profile.avatarUrl} alt="" loading="lazy" className="h-full w-full object-cover" /> : person.username.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">{name}</span>
                    <span className="block truncate text-xs text-muted-foreground">@{person.username}</span>
                  </span>
                </Link>
                <button
                  type="button"
                  disabled={request.isPending}
                  onClick={() => request.mutate(person.id)}
                  aria-label={t("friends.addMember", { name })}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50"
                >
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
