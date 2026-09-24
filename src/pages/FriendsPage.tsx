import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Check,
  Clock3,
  Loader2,
  Search,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { FRIENDSHIP_STATUS } from "@/constants/domain";
import {
  fetchFriendships,
  respondFriendRequest,
  searchUsers,
  sendFriendRequest,
} from "@/services/friendsApi";
import type { Friendship } from "@/services/friendsApi";
import type { SocialUser } from "@/services/profileApi";
import { useAuth } from "@/hooks/useAuth";
import { PersonListSkeleton } from "@/components/skeletons/AppSkeletons";
import { PersonCard } from "@/components/friends/PersonCard";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function FriendsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const client = useQueryClient();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim();
  const debouncedQuery = useDebouncedValue(normalizedQuery, 300);
  const friendships = useQuery<Friendship[]>({
    queryKey: ["friendships"],
    queryFn: fetchFriendships,
  });
  const results = useQuery<SocialUser[]>({
    queryKey: ["user-search", debouncedQuery],
    queryFn: () => searchUsers(debouncedQuery),
    enabled: Boolean(user),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
  const searchPending =
    normalizedQuery !== debouncedQuery || results.isFetching;
  const refresh = () => client.invalidateQueries({ queryKey: ["friendships"] });
  const add = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      toast.success(t("friends.requestSent"));
      void refresh();
      void results.refetch();
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const respond = useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) =>
      respondFriendRequest(id, accept),
    onSuccess: () => {
      toast.success(t("friends.requestHandled"));
      void refresh();
    },
  });
  if (friendships.isLoading)
    return (
      <div className={PAGE_SHELL}>
        <h1 className={PAGE_TITLE}>{t("friends.title")}</h1>
        <div
          className="mb-3 h-5 w-24 animate-pulse rounded-md bg-muted"
          aria-hidden="true"
        />
        <PersonListSkeleton count={4} />
      </div>
    );
  const rows = friendships.data ?? [];
  const incoming = rows.filter(
    (row) =>
      row.status === FRIENDSHIP_STATUS.PENDING && row.receiverId === user?.id,
  );
  const outgoing = rows.filter(
    (row) =>
      row.status === FRIENDSHIP_STATUS.PENDING && row.requesterId === user?.id,
  );
  const accepted = rows.filter(
    (row) => row.status === FRIENDSHIP_STATUS.ACCEPTED,
  );
  return (
    <div className={PAGE_SHELL}>
      <h1 className={PAGE_TITLE}>{t("friends.title")}</h1>
      <section className="mb-8">
        <h2 className="mb-3 font-semibold">{t("friends.myFriends")}</h2>
        <div className="space-y-3">
          {accepted.map((row) => {
            const person =
              row.requesterId === user?.id ? row.receiver : row.requester;
            return <PersonCard key={row.id} person={person} />;
          })}
        </div>
        {friendships.isSuccess && accepted.length === 0 && (
          <div className="rounded-xl border border-dashed bg-card p-7 text-center">
            <Users className="mx-auto mb-3 h-7 w-7 text-muted-foreground" />
            <p className="font-medium">{t("friends.emptyTitle")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("friends.emptyDescription")}
            </p>
            <a
              href="#discover"
              className="mt-4 inline-flex min-h-10 items-center rounded-md bg-primary px-4 text-sm text-primary-foreground"
            >
              {t("friends.findFriends")}
            </a>
          </div>
        )}
      </section>
      {(incoming.length > 0 || outgoing.length > 0) && (
        <section className="mb-8">
          <h2 className="mb-3 font-semibold">{t("friends.pendingRequests")}</h2>
          <div className="space-y-3">
            {incoming.map((row) => (
              <PersonCard
                key={row.id}
                person={row.requester}
                action={
                  <div className="flex gap-1">
                    <button
                      type="button"
                      aria-label={t("friends.accept")}
                      onClick={() =>
                        respond.mutate({ id: row.id, accept: true })
                      }
                      className="rounded-md bg-primary p-2 text-primary-foreground"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      aria-label={t("friends.decline")}
                      onClick={() =>
                        respond.mutate({ id: row.id, accept: false })
                      }
                      className="rounded-md bg-secondary p-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                }
              />
            ))}
            {outgoing.map((row) => (
              <PersonCard
                key={row.id}
                person={row.receiver}
                note={t("friends.requestSent")}
                action={
                  <Clock3 className="h-5 w-5 shrink-0 text-muted-foreground" />
                }
              />
            ))}
          </div>
        </section>
      )}
      <section id="discover" className="scroll-mt-20">
        <h2 className="mb-3 font-semibold">{t("friends.peopleToAdd")}</h2>
        <label htmlFor="friend-search" className="mb-4 flex items-center gap-2 rounded-lg border bg-card px-3 focus-within:ring-2 focus-within:ring-ring">
          <Search className="h-4 w-4" />
          <span className="sr-only">{t("friends.searchPlaceholder")}</span>
          <input
            id="friend-search"
            name="friendSearch"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={50}
            placeholder={t("friends.searchPlaceholder")}
            className="min-h-11 flex-1 bg-transparent outline-none"
          />
          {searchPending && (
            <Loader2
              className="h-4 w-4 animate-spin text-muted-foreground"
              aria-label={t("friends.searchLoading")}
            />
          )}
        </label>
        <div className="space-y-3" aria-busy={searchPending}>
          {(results.data ?? []).map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              action={
                <button
                  type="button"
                  disabled={add.isPending}
                  onClick={() => add.mutate(person.id)}
                  className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md bg-primary px-3 text-primary-foreground disabled:opacity-50"
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("friends.add")}</span>
                </button>
              }
            />
          ))}
          {results.isPending && <PersonListSkeleton count={3} />}
        </div>
        {results.isError && (
          <div className="rounded-lg border border-destructive/40 bg-card p-5 text-center text-sm">
            <p className="text-destructive">{t("friends.searchError")}</p>
            <button
              type="button"
              onClick={() => void results.refetch()}
              className="mt-3 min-h-10 rounded-md border border-border px-4"
            >
              {t("common.retry")}
            </button>
          </div>
        )}
        {results.isSuccess && !searchPending && results.data.length === 0 && (
          <p className="rounded-lg border border-dashed bg-card p-5 text-center text-sm text-muted-foreground">
            {t("friends.noPeople")}
          </p>
        )}
      </section>
    </div>
  );
}
