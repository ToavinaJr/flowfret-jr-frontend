import { Search, UserPlus } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserAvatar } from "@/components/common/UserAvatar";
import type { SocialUser } from "@/services/profileApi";

interface ChatFriendPickerProps {
  friends: SocialUser[];
  label: string;
  selectedIds?: string[];
  onSelect: (friend: SocialUser) => void;
}

function friendDisplayName(friend: SocialUser): string {
  return friend.profile?.displayName?.trim() || friend.username;
}

function friendAvatar(friend: SocialUser): string | null | undefined {
  return friend.profile?.avatarUrl || friend.avatarUrl;
}

export function ChatFriendPicker({
  friends,
  label,
  selectedIds = [],
  onSelect,
}: ChatFriendPickerProps) {
  const { t } = useTranslation();
  const listId = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return friends.filter((friend) =>
      `${friendDisplayName(friend)} ${friend.username}`
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    );
  }, [friends, query]);

  return (
    <div className="relative">
      <label className="relative block">
        <span className="sr-only">{label}</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false);
          }}
          aria-label={label}
          aria-expanded={open}
          aria-controls={listId}
          placeholder={label}
          className="h-11 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
        />
      </label>
      {open ? (
        <div className="absolute inset-x-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-xl">
          {results.length ? (
            <ul id={listId} className="max-h-56 overflow-y-auto p-1">
              {results.map((friend) => {
                const displayName = friendDisplayName(friend);
                const isSelected = selectedIds.includes(friend.id);
                return (
                  <li key={friend.id}>
                    <button
                      type="button"
                      aria-label={`${displayName}, @${friend.username}`}
                      aria-pressed={isSelected}
                      onClick={() => {
                        onSelect(friend);
                        setQuery("");
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                    >
                      <UserAvatar
                        src={friendAvatar(friend)}
                        name={displayName}
                        size="sm"
                        alt=""
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium text-foreground">
                          {displayName}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          @{friend.username}
                        </span>
                      </span>
                      {isSelected ? (
                        <span className="text-xs font-medium text-primary">
                          {t("chat.selected")}
                        </span>
                      ) : (
                        <UserPlus className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="space-y-3 p-3">
              <p className="text-sm text-muted-foreground">
                {friends.length ? t("chat.noFriendsFound") : t("chat.noFriendsAvailable")}
              </p>
              {friends.length === 0 ? (
                <a
                  href="/friends#discover"
                  className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                  {t("friends.findFriends")}
                </a>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
