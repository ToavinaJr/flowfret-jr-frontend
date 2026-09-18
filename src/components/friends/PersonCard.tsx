import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { SocialUser } from "@/services/api";

export function PersonCard({
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
            <img src={person.profile.avatarUrl} alt={`Avatar de ${name}`} className="h-full w-full object-cover" />
          ) : (
            person.username.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <div className="truncate font-medium hover:underline">{name}</div>
          <div className="truncate text-sm text-muted-foreground">@{person.username}</div>
          {person.profile?.bio && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{person.profile.bio}</p>}
          {note && <p className="mt-1 text-xs text-muted-foreground">{note}</p>}
        </div>
      </Link>
      {action}
    </article>
  );
}