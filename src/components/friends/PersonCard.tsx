import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { SocialUser } from "@/services/profileApi";
import { UserAvatar } from "@/components/common/UserAvatar";

export function PersonCard({
  person,
  action,
  note,
  id,
  highlighted = false,
}: {
  person: SocialUser;
  action?: ReactNode;
  note?: string;
  id?: string;
  highlighted?: boolean;
}) {
  const { t } = useTranslation();
  const name = person.profile?.displayName || person.username;
  return (
    <article id={id} className={`flex items-center gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors ${highlighted ? "border-primary ring-2 ring-primary/30" : ""}`}>
      <Link
        to={`/profile/${person.id}`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <UserAvatar src={person.avatarUrl} name={name} alt={t("friends.avatarAlt", { name })} />
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
