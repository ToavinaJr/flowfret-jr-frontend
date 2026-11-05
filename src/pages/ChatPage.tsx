import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  MessageCircle,
  Search,
  Send,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { EmojiPickerButton } from "@/components/chat/EmojiPickerButton";
import { ChatFriendPicker } from "@/components/chat/ChatFriendPicker";
import { PrivateChatImage } from "@/components/chat/PrivateChatImage";
import { FloatingPanelWindow } from "@/components/common/FloatingPanelWindow";
import { UserAvatar } from "@/components/common/UserAvatar";
import {
  CHAT_MESSAGE_MAX_LENGTH,
  CHAT_NICKNAME_MAX_LENGTH,
  useChatWorkspace,
} from "@/hooks/useChatWorkspace";
import type { ChatMessage } from "@/services/chatApi";

export default function ChatPage() {
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeMinimized, setComposeMinimized] = useState(false);
  const nicknameMenuRef = useRef<HTMLDetailsElement>(null);
  const {
    t,
    user,
    selectedId,
    setSelectedId,
    body,
    setBody,
    files,
    setFiles,
    groupName,
    setGroupName,
    groupMembers,
    setGroupMembers,
    editGroupName,
    setEditGroupName,
    addMemberId,
    setAddMemberId,
    loadingOlder,
    nickname,
    setNickname,
    conversationFilter,
    setConversationFilter,
    messagesEnd,
    composerRef,
    conversations,
    selected,
    titleFor,
    avatarFor,
    messages,
    friendRows,
    visibleConversations,
    send,
    startDirect,
    createGroup,
    saveNickname,
    rename,
    addMembers,
    changeRole,
    removeMember,
    submit,
    loadOlderMessages,
    insertEmoji,
  } = useChatWorkspace();
  const friends = friendRows.map((row) =>
    row.requesterId === user?.id ? row.receiver : row.requester,
  );

  return (
    <main className={`${PAGE_SHELL} max-w-7xl`}>
      <h1 className={`${PAGE_TITLE} mb-4`}>{t("chat.title")}</h1>
      {conversations.isError ? (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-destructive/30 p-4"
        >
          {t("common.loadFailed")}{" "}
          <button
            className="ml-2 underline"
            onClick={() => void conversations.refetch()}
          >
            {t("common.retry")}
          </button>
        </div>
      ) : null}
      {composeOpen ? (
        <FloatingPanelWindow
          windowId="chat-compose"
          title={t("chat.newConversation")}
          zIndex={90}
          minimized={composeMinimized}
          onClose={() => {
            setComposeOpen(false);
            setComposeMinimized(false);
          }}
          onFocus={() => undefined}
          onMinimize={() => setComposeMinimized((value) => !value)}
        >
          <div className="space-y-4 p-4">
            <section className="space-y-3 rounded-xl border border-border bg-background/60 p-3 sm:p-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {t("chat.startDirect")}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {t("chat.friendPickerHint")}
                </p>
              </div>
              <ChatFriendPicker
                friends={friends}
                label={t("chat.chooseFriend")}
                onSelect={(friend) => {
                  setComposeOpen(false);
                  startDirect.mutate(friend.id);
                }}
              />
            </section>

            <section className="space-y-3 rounded-xl border border-border bg-background/60 p-3 sm:p-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  {t("chat.createGroup")}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {t("chat.groupPickerHint")}
                </p>
              </div>
              <form
                className="space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  if (groupName.trim() && groupMembers.length >= 2) {
                    createGroup.mutate(undefined, {
                      onSuccess: () => setComposeOpen(false),
                    });
                  }
                }}
              >
                <label htmlFor="chat-group-name" className="sr-only">
                  {t("chat.groupName")}
                </label>
                <input
                  id="chat-group-name"
                  className="h-11 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15"
                  value={groupName}
                  onChange={(event) => setGroupName(event.target.value)}
                  placeholder={t("chat.groupName")}
                  maxLength={80}
                />
                <ChatFriendPicker
                  friends={friends}
                  label={t("chat.addGroupMember")}
                  selectedIds={groupMembers}
                  onSelect={(friend) =>
                    setGroupMembers((current) =>
                      current.includes(friend.id)
                        ? current.filter((id) => id !== friend.id)
                        : [...current, friend.id],
                    )
                  }
                />
                {groupMembers.length ? (
                  <ul className="flex flex-wrap gap-2" aria-label={t("chat.membersSelectedLabel")}>
                    {groupMembers.map((memberId) => {
                      const friend = friends.find((candidate) => candidate.id === memberId);
                      if (!friend) return null;
                      const displayName = friend.profile?.displayName?.trim() || friend.username;
                      return (
                        <li
                          key={friend.id}
                          className="inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-card py-1 pl-1 pr-2"
                        >
                          <UserAvatar
                            src={friend.profile?.avatarUrl || friend.avatarUrl}
                            name={displayName}
                            size="xs"
                            className="h-7 w-7 text-[10px]"
                            alt=""
                          />
                          <span className="min-w-0">
                            <span className="block max-w-28 truncate text-xs font-medium">{displayName}</span>
                            <span className="block max-w-28 truncate text-[10px] text-muted-foreground">@{friend.username}</span>
                          </span>
                          <button
                            type="button"
                            aria-label={t("chat.removeSelected", { name: `@${friend.username}` })}
                            onClick={() => setGroupMembers((current) => current.filter((id) => id !== friend.id))}
                            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                          >
                            <X className="h-3.5 w-3.5" aria-hidden="true" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
                <button
                  type="submit"
                  disabled={
                    createGroup.isPending ||
                    groupMembers.length < 2 ||
                    !groupName.trim()
                  }
                  className="min-h-11 w-full rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Users className="mr-2 inline h-4 w-4" aria-hidden="true" />
                  {t("chat.createGroup")}
                </button>
              </form>
            </section>
          </div>
        </FloatingPanelWindow>
      ) : null}
      <div className="grid h-[min(78vh,52rem)] min-h-[34rem] grid-cols-1 overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/5 md:grid-cols-[20rem_minmax(0,1fr)]">
        <aside
          className={`${selectedId ? "hidden md:flex" : "flex"} min-h-0 flex-col border-b border-border bg-background/70 md:border-b-0 md:border-r`}
          aria-label={t("chat.conversations")}
        >
          <div className="space-y-3 border-b border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">{t("chat.conversations")}</h2>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {visibleConversations.length}
                </span>
                <button
                  type="button"
                  onClick={() => setComposeOpen(true)}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  aria-label={t("chat.newConversation")}
                  aria-expanded={composeOpen}
                  aria-controls="floating-media-window-chat-compose"
                  title={t("chat.newConversation")}
                >
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
            <label className="relative block" htmlFor="chat-conversation-search">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <span className="sr-only">{t("chat.searchConversations")}</span>
              <input
                id="chat-conversation-search"
                value={conversationFilter}
                onChange={(event) => setConversationFilter(event.target.value)}
                placeholder={t("chat.searchConversations")}
                className="h-10 w-full rounded-full border border-transparent bg-muted/70 pl-9 pr-3 text-sm outline-none transition focus:border-primary/40 focus:bg-background focus:ring-2 focus:ring-primary/15"
              />
            </label>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.isLoading ? (
              <p className="p-4 text-sm text-muted-foreground">
                {t("common.loading")}
              </p>
            ) : null}
            {!conversations.isLoading && conversations.data?.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">
                {t("chat.empty")}
              </p>
            ) : null}
            {!conversations.isLoading && visibleConversations.length === 0 && conversations.data?.length ? (
              <p className="p-4 text-sm text-muted-foreground">{t("chat.noSearchResults")}</p>
            ) : null}
            {visibleConversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                onClick={() => setSelectedId(conversation.id)}
                className={`flex w-full items-center gap-3 border-b border-border/70 px-4 py-3.5 text-left transition hover:bg-muted/70 ${selectedId === conversation.id ? "bg-primary/10 md:border-l-2 md:border-l-primary" : ""}`}
              >
                <UserAvatar
                  src={avatarFor(conversation)}
                  name={titleFor(conversation)}
                  size="md"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">
                    {titleFor(conversation)}
                  </span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {conversation.lastMessage?.body ||
                      (conversation.lastMessage?.attachments.length
                        ? t("chat.photo")
                        : t("chat.noMessages"))}
                  </span>
                </span>
                {conversation.unreadCount > 0 ? (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {conversation.unreadCount}
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </aside>
        <section
          className={`${selectedId ? "flex" : "hidden md:flex"} min-h-[70vh] min-w-0 flex-col`}
          aria-label={t("chat.conversation")}
        >
          {selected ? (
            <>
              <header className="flex flex-wrap items-center gap-3 border-b border-border bg-background/90 px-4 py-3 shadow-sm">
                <button
                  type="button"
                  className="rounded p-2 hover:bg-muted md:hidden"
                  onClick={() => setSelectedId(undefined)}
                  aria-label={t("chat.backToConversations")}
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <UserAvatar
                  src={avatarFor(selected)}
                  name={titleFor(selected)}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold">
                    {titleFor(selected)}
                  </h2>
                  <p className="truncate text-xs text-muted-foreground">
                    {selected.participants
                      .map((p) => p.nickname || p.username)
                      .join(", ")}
                  </p>
                </div>
                <details key={selected.id} ref={nicknameMenuRef} className="relative">
                  <summary className="cursor-pointer list-none rounded-full border border-border px-3 py-2 text-xs font-medium hover:bg-muted">
                    {t("chat.profileOptions")}
                  </summary>
                  <form
                    className={`absolute right-0 top-full z-30 ${selected.type === "GROUP" ? "mt-16" : "mt-6"} flex w-[min(20rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] gap-2 rounded-xl border border-border bg-card p-3 shadow-xl}`}
                    onSubmit={(event) => {
                      event.preventDefault();
                      saveNickname.mutate(undefined, {
                        onSuccess: () => {
                          if (nicknameMenuRef.current) nicknameMenuRef.current.open = false;
                        },
                      });
                    }}
                  >
                    <label htmlFor="chat-nickname" className="sr-only">
                      {t("chat.nickname")}
                    </label>
                    <input
                      id="chat-nickname"
                      value={nickname}
                      onChange={(event) => setNickname(event.target.value)}
                      maxLength={CHAT_NICKNAME_MAX_LENGTH}
                      placeholder={t("chat.nickname")}
                      className="min-w-0 flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm"
                    />
                    <button
                      className="rounded-md border px-2 text-sm"
                      disabled={saveNickname.isPending}
                    >
                      {t("common.save")}
                    </button>
                  </form>
                </details>
              </header>
              {selected.type === "GROUP" ? (
                <details className="border-b border-border bg-muted/30 px-4 py-2">
                  <summary className="cursor-pointer text-sm font-medium">{t("chat.groupMembers")}</summary>
                  <div className="space-y-2 py-3">
                  <form
                    className="flex gap-2"
                    onSubmit={(event) => {
                      event.preventDefault();
                      if (editGroupName.trim()) rename.mutate();
                    }}
                  >
                    <label className="sr-only" htmlFor="chat-rename-group">
                      {t("chat.groupName")}
                    </label>
                    <input
                      id="chat-rename-group"
                      value={editGroupName}
                      onChange={(event) => setEditGroupName(event.target.value)}
                      maxLength={80}
                      className="min-w-0 flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm"
                    />
                    <button
                      className="rounded-md border px-2 text-sm"
                      disabled={rename.isPending}
                    >
                      {t("common.save")}
                    </button>
                  </form>
                  {selected.participants.find((p) => p.userId === user?.id)
                    ?.role === "ADMIN" ? (
                    <div className="min-w-0 flex-1 space-y-2">
                      <ChatFriendPicker
                        friends={friends.filter((friend) =>
                          !selected.participants.some((participant) => participant.userId === friend.id),
                        )}
                        label={t("chat.addGroupMember")}
                        selectedIds={addMemberId ? [addMemberId] : []}
                        onSelect={(friend) => setAddMemberId(friend.id)}
                      />
                      <button
                        type="button"
                        disabled={!addMemberId || addMembers.isPending}
                        onClick={() => addMembers.mutate()}
                        className="min-h-10 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {t("chat.add")}
                      </button>
                    </div>
                  ) : null}
                  <ul
                    className="flex flex-wrap gap-2"
                    aria-label={t("chat.groupMembers")}
                  >
                    {selected.participants.map((participant) => (
                      <li
                        key={participant.id}
                        className="flex max-w-full items-center gap-2 rounded-lg border border-border bg-background px-2 py-1.5 text-xs"
                      >
                        <UserAvatar
                          src={participant.avatarUrl}
                          name={participant.nickname || participant.username}
                          size="xs"
                          alt=""
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block max-w-32 truncate font-medium">
                            {participant.nickname || participant.username}
                            {participant.role === "ADMIN" ? ` · ${t("chat.admin")}` : ""}
                          </span>
                          <span className="block max-w-32 truncate text-[10px] text-muted-foreground">
                            @{participant.username}
                          </span>
                        </span>
                        {selected.participants.find(
                          (p) => p.userId === user?.id,
                        )?.role === "ADMIN" &&
                        participant.userId !== user?.id ? (
                          <button
                            type="button"
                            aria-label={t(
                              participant.role === "ADMIN"
                                ? "chat.demote"
                                : "chat.promote",
                              { name: participant.username },
                            )}
                            onClick={() =>
                              changeRole.mutate({
                                memberId: participant.userId,
                                role:
                                  participant.role === "ADMIN"
                                    ? "MEMBER"
                                    : "ADMIN",
                              })
                            }
                          >
                            <Users className="h-3 w-3" />
                          </button>
                        ) : null}
                        {participant.userId === user?.id ||
                        selected.participants.find((p) => p.userId === user?.id)
                          ?.role === "ADMIN" ? (
                          <button
                            type="button"
                            aria-label={
                              participant.userId === user?.id
                                ? t("chat.leaveGroup")
                                : t("chat.removeMember", {
                                    name: participant.username,
                                  })
                            }
                            onClick={() => {
                              const isLeaving = participant.userId === user?.id;
                              toast(
                                t(
                                  isLeaving
                                    ? "chat.confirmLeave"
                                    : "chat.confirmRemove",
                                  { name: participant.username },
                                ),
                                {
                                  action: {
                                    label: t(
                                      isLeaving
                                        ? "chat.confirmLeaveAction"
                                        : "chat.confirmRemoveAction",
                                    ),
                                    onClick: () =>
                                      removeMember.mutate(participant.userId),
                                  },
                                  cancel: {
                                    label: t("common.cancel"),
                                    onClick: () => undefined,
                                  },
                                  duration: 10_000,
                                },
                              );
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                  </div>
                </details>
              ) : null}
              <div
                className="flex-1 space-y-3 overflow-y-auto bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/40 via-background to-background p-4 sm:p-7"
                aria-live="polite"
              >
                {messages.data?.length === 40 ? (
                  <button
                    type="button"
                    disabled={loadingOlder}
                    className="mx-auto block rounded-md border px-3 py-2 text-sm"
                    onClick={() => void loadOlderMessages()}
                  >
                    {loadingOlder ? t("common.loading") : t("chat.loadOlder")}
                  </button>
                ) : null}
                {messages.isLoading ? (
                  <p className="text-sm text-muted-foreground">
                    {t("common.loading")}
                  </p>
                ) : null}
                {messages.isError ? (
                  <button
                    className="text-sm underline"
                    onClick={() => void messages.refetch()}
                  >
                    {t("common.retry")}
                  </button>
                ) : null}
                {messages.data?.map((message: ChatMessage) => (
                  <article
                    key={message.id}
                    className={`max-w-[min(85%,38rem)] rounded-2xl px-4 py-3 shadow-sm ${message.senderId === user?.id ? "ml-auto rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md border border-border/70 bg-card"}`}
                  >
                    {message.senderId !== user?.id ? (
                      <p className="mb-1 text-xs font-semibold">
                        {message.senderUsername}
                      </p>
                    ) : null}
                    {message.body ? (
                      <p className="whitespace-pre-wrap break-words">
                        {message.body}
                      </p>
                    ) : null}
                    {message.attachments.map((attachment) => (
                      <PrivateChatImage
                        key={attachment.id}
                        url={attachment.contentUrl}
                        alt={t("chat.photo")}
                      />
                    ))}
                    <time className="mt-1 block text-right text-[10px] opacity-70">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </article>
                ))}
                <div ref={messagesEnd} />
              </div>
              <form
                onSubmit={submit}
                className="space-y-2 border-t border-border bg-background/95 p-3 sm:px-5"
              >
                {files.length ? (
                  <div className="flex items-center justify-between text-xs">
                    <span>{files.map((file) => file.name).join(", ")}</span>
                    <button
                      type="button"
                      className="underline"
                      onClick={() => setFiles([])}
                    >
                      {t("common.cancel")}
                    </button>
                  </div>
                ) : null}
                <div className="flex items-end gap-2 rounded-2xl border border-border bg-muted/50 p-2 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
                  <label
                    className="cursor-pointer rounded-lg p-2 hover:bg-muted"
                    title={t("chat.addPhoto")}
                  >
                    <ImagePlus className="h-5 w-5" />
                    <span className="sr-only">{t("chat.addPhoto")}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      className="sr-only"
                      onChange={(event) =>
                        setFiles(
                          Array.from(event.target.files ?? []).slice(0, 4),
                        )
                      }
                    />
                  </label>
                  <EmojiPickerButton onSelect={insertEmoji} />
                  <label htmlFor="chat-message" className="sr-only">
                    {t("chat.writeMessage")}
                  </label>
                  <textarea
                    id="chat-message"
                    ref={composerRef}
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    maxLength={CHAT_MESSAGE_MAX_LENGTH}
                    rows={2}
                    placeholder={t("chat.writeMessage")}
                    className="max-h-32 min-h-11 flex-1 resize-y bg-transparent p-2 text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    type="submit"
                    disabled={send.isPending || (!body.trim() && !files.length)}
                    className="rounded-xl bg-primary p-3 text-primary-foreground shadow-md shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-50"
                    aria-label={t("chat.send")}
                  >
                    {send.isPending ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="m-auto p-6 text-center text-muted-foreground">
              <MessageCircle className="mx-auto mb-3 h-10 w-10" />
              <p>{t("chat.selectConversation")}</p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
