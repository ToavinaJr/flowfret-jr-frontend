import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Clock3, Search, UserPlus, Users, X } from "lucide-react";
import { toast } from "sonner";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import {
  fetchFriendships,
  respondFriendRequest,
  searchUsers,
  sendFriendRequest,
  type SocialUser,
} from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import { PersonListSkeleton } from "@/components/skeletons/AppSkeletons";

function PersonCard({
  person,
  action,
  note,
}: {
  person: SocialUser;
  action?: ReactNode;
  note?: string;
}) {
  const name = person.profile?.displayName || person.username;
  return (
    <article className="flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm">
      <Link
        to={`/profile/${person.id}`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-sm font-semibold">
          {person.profile?.avatarUrl ? (
            <img
              src={person.profile.avatarUrl}
              alt={`Avatar de ${name}`}
              className="h-full w-full object-cover"
            />
          ) : (
            person.username.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate font-medium hover:underline">{name}</div>
          <div className="truncate text-sm text-muted-foreground">
            @{person.username}
          </div>
          {person.profile?.bio && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {person.profile.bio}
            </p>
          )}
          {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
        </div>
      </Link>
      {action}
    </article>
  );
}

export default function FriendsPage() {
  const { user } = useAuth();
  const client = useQueryClient();
  const [query, setQuery] = useState("");
  const friendships = useQuery({
    queryKey: ["friendships"],
    queryFn: fetchFriendships,
  });
  const results = useQuery({
    queryKey: ["user-search", query],
    queryFn: () => searchUsers(query.trim()),
  });
  const refresh = () => client.invalidateQueries({ queryKey: ["friendships"] });
  const add = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      toast.success("Demande d’amitié envoyée.");
      void refresh();
      void results.refetch();
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const respond = useMutation({
    mutationFn: ({ id, accept }: { id: string; accept: boolean }) =>
      respondFriendRequest(id, accept),
    onSuccess: () => {
      toast.success("Demande traitée.");
      void refresh();
    },
  });
  if (friendships.isLoading || results.isLoading)
    return (
      <main className={PAGE_SHELL}>
        <h1 className={PAGE_TITLE}>Amis</h1>
        <div
          className="mb-3 h-5 w-24 animate-pulse rounded-md bg-muted"
          aria-hidden="true"
        />
        <PersonListSkeleton count={4} />
      </main>
    );
  const rows = friendships.data ?? [];
  const incoming = rows.filter(
    (row) => row.status === "PENDING" && row.receiverId === user?.id,
  );
  const outgoing = rows.filter(
    (row) => row.status === "PENDING" && row.requesterId === user?.id,
  );
  const accepted = rows.filter((row) => row.status === "ACCEPTED");
  return (
    <main className={PAGE_SHELL}>
      <h1 className={PAGE_TITLE}>Amis</h1>
      <section className="mb-8">
        <h2 className="mb-3 font-semibold">Mes amis</h2>
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
            <p className="font-medium">Votre liste d’amis est encore vide</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Découvrez des guitaristes et envoyez votre première demande.
            </p>
            <a
              href="#discover"
              className="mt-4 inline-flex min-h-10 items-center rounded-md bg-primary px-4 text-sm text-primary-foreground"
            >
              Trouver des amis
            </a>
          </div>
        )}
      </section>
      {(incoming.length > 0 || outgoing.length > 0) && (
        <section className="mb-8">
          <h2 className="mb-3 font-semibold">Demandes en attente</h2>
          <div className="space-y-3">
            {incoming.map((row) => (
              <PersonCard
                key={row.id}
                person={row.requester}
                action={
                  <div className="flex gap-1">
                    <button
                      aria-label="Accepter"
                      onClick={() =>
                        respond.mutate({ id: row.id, accept: true })
                      }
                      className="rounded-md bg-primary p-2 text-primary-foreground"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      aria-label="Refuser"
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
                note="Demande envoyée"
                action={
                  <Clock3 className="h-5 w-5 shrink-0 text-muted-foreground" />
                }
              />
            ))}
          </div>
        </section>
      )}
      <section id="discover" className="scroll-mt-20">
        <h2 className="mb-3 font-semibold">
          Personnes que vous pouvez ajouter
        </h2>
        <label className="mb-4 flex items-center gap-2 rounded-lg border bg-card px-3">
          <Search className="h-4 w-4" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            maxLength={50}
            placeholder="Rechercher un pseudo…"
            className="min-h-11 flex-1 bg-transparent outline-none"
          />
        </label>
        <div className="space-y-3">
          {(results.data ?? []).map((person) => (
            <PersonCard
              key={person.id}
              person={person}
              action={
                <button
                  disabled={add.isPending}
                  onClick={() => add.mutate(person.id)}
                  className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md bg-primary px-3 text-primary-foreground disabled:opacity-50"
                >
                  <UserPlus className="h-4 w-4" />
                  <span className="hidden sm:inline">Ajouter</span>
                </button>
              }
            />
          ))}
        </div>
        {results.isSuccess && results.data.length === 0 && (
          <p className="rounded-lg border border-dashed bg-card p-5 text-center text-sm text-muted-foreground">
            Aucune personne à ajouter pour le moment.
          </p>
        )}
      </section>
    </main>
  );
}
