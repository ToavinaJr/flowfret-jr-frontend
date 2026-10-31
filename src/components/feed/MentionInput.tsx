import { useId, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { fetchFriendships } from "@/services/friendsApi";
import type { SocialUser } from "@/services/profileApi";
import { activeMentionAt } from "@/utils/mentions";
import { FRIENDSHIP_STATUS } from "@/constants/domain";
import { UserAvatar } from "@/components/common/UserAvatar";

interface MentionInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  ariaLabel?: string;
  maxLength?: number;
  rows?: number;
  autoFocus?: boolean;
}

export function MentionInput({
  id,
  value,
  onChange,
  className,
  placeholder,
  ariaLabel,
  maxLength,
  rows = 3,
  autoFocus,
}: MentionInputProps) {
  const generatedId = useId();
  const inputId = id ?? `mention-input-${generatedId.replace(/:/g, "")}`;
  const { t } = useTranslation();
  const { user } = useAuth();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [cursor, setCursor] = useState(value.length);
  const [highlighted, setHighlighted] = useState(0);
  const active = activeMentionAt(value, cursor);
  const friendships = useQuery({
    queryKey: ["mention-friends"],
    queryFn: fetchFriendships,
    enabled: Boolean(user && active),
    staleTime: 60_000,
  });
  const friends = useMemo(() => {
    if (!user) return [];
    const accepted: SocialUser[] = [];
    for (const friendship of friendships.data ?? []) {
      if (friendship.status !== FRIENDSHIP_STATUS.ACCEPTED) continue;
      accepted.push(
        friendship.requesterId === user.id
          ? friendship.receiver
          : friendship.requester,
      );
    }
    const query = active?.query.toLowerCase() ?? "";
    return accepted
      .filter(
        (friend) =>
          friend.username.toLowerCase().includes(query) ||
          friend.profile?.displayName.toLowerCase().includes(query),
      )
      .slice(0, 8);
  }, [active?.query, friendships.data, user]);
  const menuOpen = Boolean(active && friendships.data);

  const select = (friend: SocialUser) => {
    if (!active) return;
    const replacement = `@${friend.username} `;
    const next = `${value.slice(0, active.start)}${replacement}${value.slice(cursor)}`;
    const nextCursor = active.start + replacement.length;
    onChange(next);
    setCursor(nextCursor);
    setHighlighted(0);
    requestAnimationFrame(() => {
      inputRef.current?.focus();
      inputRef.current?.setSelectionRange(nextCursor, nextCursor);
    });
  };

  return (
    <div className="relative w-full">
      <textarea
        id={inputId}
        name={inputId}
        ref={inputRef}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setCursor(event.target.selectionStart);
          setHighlighted(0);
        }}
        onClick={(event) => setCursor(event.currentTarget.selectionStart)}
        onSelect={(event) => setCursor(event.currentTarget.selectionStart)}
        onKeyDown={(event) => {
          if (
            menuOpen &&
            friends.length &&
            (event.key === "ArrowDown" || event.key === "ArrowUp")
          ) {
            event.preventDefault();
            const direction = event.key === "ArrowDown" ? 1 : -1;
            setHighlighted(
              (current) =>
                (current + direction + friends.length) % friends.length,
            );
          } else if (
            menuOpen &&
            friends.length &&
            (event.key === "Enter" || event.key === "Tab")
          ) {
            event.preventDefault();
            select(friends[highlighted] ?? friends[0]);
          } else if (event.key === "Escape") {
            setCursor(-1);
          } else if (rows === 1 && event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            event.currentTarget.form?.requestSubmit();
          }
        }}
        placeholder={placeholder}
        aria-label={ariaLabel ?? placeholder}
        aria-autocomplete="list"
        aria-expanded={menuOpen}
        maxLength={maxLength}
        rows={rows}
        autoFocus={autoFocus}
        className={className}
      />
      {menuOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-xl">
          {friends.length ? (
            friends.map((friend, index) => (
              <button
                key={friend.id}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => select(friend)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm ${index === highlighted ? "bg-secondary" : "hover:bg-secondary"}`}
              >
                <UserAvatar
                  src={friend.avatarUrl}
                  name={friend.profile?.displayName ?? friend.username}
                  size="xs"
                />
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {friend.profile?.displayName ?? friend.username}
                  </span>
                  <span className="block truncate text-xs text-muted-foreground">
                    @{friend.username}
                  </span>
                </span>
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm text-muted-foreground">
              {t("feed.noMentionFriends")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
