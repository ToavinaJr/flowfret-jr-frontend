import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  MessageCircle,
  Search,
  Send,
  Users,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { FRIENDSHIP_STATUS } from "@/constants/domain";
import { fetchFriendships } from "@/services/friendsApi";
import type { Friendship } from "@/services/friendsApi";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { PrivateChatImage } from "@/components/chat/PrivateChatImage";
import {
  addChatGroupMembers,
  connectChat,
  createDirectChat,
  createGroupChat,
  fetchConversations,
  fetchMessages,
  markChatRead,
  removeChatGroupMember,
  renameChatGroup,
  sendMessage,
  setChatGroupRole,
  setChatNickname,
  uploadChatImages,
  type ChatConversation,
  type ChatMessage,
} from "@/services/chatApi";

export default function ChatPage() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const client = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | undefined>(
    conversationId,
  );
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [groupName, setGroupName] = useState("");
  const [groupMembers, setGroupMembers] = useState<string[]>([]);
  const [editGroupName, setEditGroupName] = useState("");
  const [addMemberId, setAddMemberId] = useState("");
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [nickname, setNickname] = useState("");
  const [conversationFilter, setConversationFilter] = useState("");
  const messagesEnd = useRef<HTMLDivElement>(null);
  const conversations = useQuery({
    queryKey: ["chat-conversations"],
    queryFn: fetchConversations,
  });
  const friends = useQuery<Friendship[]>({
    queryKey: ["friendships"],
    queryFn: fetchFriendships,
  });
  const selected = conversations.data?.find((item) => item.id === selectedId);
  const titleFor = useCallback(
    (conversation: ChatConversation) =>
      conversation.type === "GROUP"
        ? (conversation.name ?? t("chat.group"))
        : conversation.participants.find((p) => p.userId !== user?.id)
            ?.nickname ||
          conversation.participants.find((p) => p.userId !== user?.id)
            ?.username ||
          t("chat.conversation"),
    [t, user?.id],
  );
  const messages = useQuery({
    queryKey: ["chat-messages", selectedId],
    queryFn: () => fetchMessages(selectedId!),
    enabled: Boolean(selectedId),
  });
  const friendRows = useMemo(
    () =>
      (friends.data ?? []).filter(
        (row) => row.status === FRIENDSHIP_STATUS.ACCEPTED,
      ),
    [friends.data],
  );
  const visibleConversations = useMemo(() => {
    const query = conversationFilter.trim().toLocaleLowerCase();
    return (conversations.data ?? []).filter((conversation) =>
      `${titleFor(conversation)} ${conversation.lastMessage?.body ?? ""}`
        .toLocaleLowerCase()
        .includes(query),
    );
  }, [conversationFilter, conversations.data, titleFor]);
  const send = useMutation({
    mutationFn: async () => {
      if (!selectedId) throw new Error("Select a conversation first.");
      const uploads = files.length ? await uploadChatImages(files) : [];
      return sendMessage(
        selectedId,
        body,
        uploads.map((upload) => upload.id),
      );
    },
    onSuccess: async () => {
      setBody("");
      setFiles([]);
      await Promise.all([
        client.invalidateQueries({ queryKey: ["chat-messages", selectedId] }),
        client.invalidateQueries({ queryKey: ["chat-conversations"] }),
      ]);
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const startDirect = useMutation({
    mutationFn: createDirectChat,
    onSuccess: async (conversation) => {
      setSelectedId(conversation.id);
      await client.invalidateQueries({ queryKey: ["chat-conversations"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const createGroup = useMutation({
    mutationFn: () => createGroupChat(groupName, groupMembers),
    onSuccess: async (conversation) => {
      setGroupName("");
      setGroupMembers([]);
      setSelectedId(conversation.id);
      await client.invalidateQueries({ queryKey: ["chat-conversations"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const saveNickname = useMutation({
    mutationFn: () => setChatNickname(selectedId!, nickname),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["chat-conversations"] });
      toast.success(t("chat.nicknameSaved"));
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const refreshChats = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: ["chat-conversations"] }),
      client.invalidateQueries({ queryKey: ["chat-messages", selectedId] }),
    ]);
  const rename = useMutation({
    mutationFn: () => renameChatGroup(selectedId!, editGroupName),
    onSuccess: refreshChats,
    onError: (error: Error) => toast.error(error.message),
  });
  const addMembers = useMutation({
    mutationFn: () => addChatGroupMembers(selectedId!, [addMemberId]),
    onSuccess: async () => {
      setAddMemberId("");
      await refreshChats();
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const changeRole = useMutation({
    mutationFn: ({
      memberId,
      role,
    }: {
      memberId: string;
      role: "ADMIN" | "MEMBER";
    }) => setChatGroupRole(selectedId!, memberId, role),
    onSuccess: refreshChats,
    onError: (error: Error) => toast.error(error.message),
  });
  const removeMember = useMutation({
    mutationFn: (memberId: string) =>
      removeChatGroupMember(selectedId!, memberId),
    onSuccess: async (_, memberId) => {
      if (memberId === user?.id) setSelectedId(undefined);
      await refreshChats();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  useEffect(() => {
    const socket = connectChat();
    if (!socket) return;
    const refresh = () => {
      void client.invalidateQueries({ queryKey: ["chat-conversations"] });
      if (selectedId)
        void client.invalidateQueries({
          queryKey: ["chat-messages", selectedId],
        });
    };
    socket.on("connect", () => {
      if (selectedId) socket.emit("chat:join", { conversationId: selectedId });
    });
    socket.on("chat:message", refresh);
    socket.on("chat:inbox-updated", refresh);
    return () => {
      socket.disconnect();
    };
  }, [client, selectedId]);

  useEffect(() => {
    if (!selectedId || !messages.data?.length) return;
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
    void markChatRead(selectedId).then(() =>
      client.invalidateQueries({ queryKey: ["chat-conversations"] }),
    );
  }, [client, messages.data, selectedId]);

  useEffect(() => {
    setNickname(
      selected?.participants.find((p) => p.userId === user?.id)?.nickname ?? "",
    );
    setEditGroupName(selected?.name ?? "");
  }, [selected, user?.id]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!body.trim() && !files.length) return;
    send.mutate();
  };

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
      <div className="grid h-[min(78vh,52rem)] min-h-[34rem] grid-cols-1 overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-black/5 md:grid-cols-[20rem_minmax(0,1fr)]">
        <aside
          className={`${selectedId ? "hidden md:flex" : "flex"} min-h-0 flex-col border-b border-border bg-background/70 md:border-b-0 md:border-r`}
          aria-label={t("chat.conversations")}
        >
          <div className="space-y-3 border-b border-border p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-semibold">{t("chat.conversations")}</h2>
              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {visibleConversations.length}
              </span>
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
            <details className="group rounded-xl border border-border/80 bg-card px-3 py-2">
              <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium marker:hidden">
                <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                {t("chat.newConversation")}
              </summary>
              <div className="mt-3 space-y-3 border-t border-border pt-3">
                <label className="block text-xs text-muted-foreground" htmlFor="chat-friend">
                  {t("chat.startDirect")}
                </label>
                <select
                  id="chat-friend"
                  className="w-full rounded-lg border border-input bg-background p-2.5 text-sm"
                  defaultValue=""
                  onChange={(event) => {
                    if (event.target.value) startDirect.mutate(event.target.value);
                    event.target.value = "";
                  }}
                >
                  <option value="">{t("chat.chooseFriend")}</option>
                  {friendRows.map((row) => {
                    const friend = row.requesterId === user?.id ? row.receiver : row.requester;
                    return <option key={row.id} value={friend.id}>{friend.username}</option>;
                  })}
                </select>
              </div>
            </details>
            <details className="group rounded-xl border border-border/80 bg-card px-3 py-2">
              <summary className="cursor-pointer list-none text-sm font-medium marker:hidden">
                {t("chat.createGroup")}
              </summary>
              <div className="mt-3 border-t border-border pt-3">
            <form
              className="space-y-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (groupName.trim() && groupMembers.length >= 2)
                  createGroup.mutate();
              }}
            >
              <label htmlFor="chat-group-name" className="sr-only">
                {t("chat.groupName")}
              </label>
              <input
                id="chat-group-name"
                className="w-full rounded-md border border-input bg-background p-2 text-sm"
                value={groupName}
                onChange={(event) => setGroupName(event.target.value)}
                placeholder={t("chat.groupName")}
                maxLength={80}
              />
              <select
                aria-label={t("chat.addGroupMember")}
                className="w-full rounded-md border border-input bg-background p-2 text-sm"
                value=""
                onChange={(event) => {
                  if (
                    event.target.value &&
                    !groupMembers.includes(event.target.value)
                  )
                    setGroupMembers((prev) => [...prev, event.target.value]);
                }}
              >
                <option value="">{t("chat.addGroupMember")}</option>
                {friendRows.map((row) => {
                  const friend =
                    row.requesterId === user?.id ? row.receiver : row.requester;
                  return (
                    <option key={row.id} value={friend.id}>
                      {friend.username}
                    </option>
                  );
                })}
              </select>
              {groupMembers.length ? (
                <ul className="flex flex-wrap gap-1">
                  {groupMembers.map((memberId) => {
                    const friendRow = friendRows.find(
                      (row) =>
                        (row.requesterId === user?.id
                          ? row.receiverId
                          : row.requesterId) === memberId,
                    );
                    const friend = friendRow
                      ? friendRow.requesterId === user?.id
                        ? friendRow.receiver
                        : friendRow.requester
                      : null;
                    return (
                      <li
                        key={memberId}
                        className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs"
                      >
                        {friend?.username ?? memberId}
                        <button
                          type="button"
                          aria-label={t("chat.removeSelected", {
                            name: friend?.username ?? memberId,
                          })}
                          onClick={() =>
                            setGroupMembers((current) =>
                              current.filter((id) => id !== memberId),
                            )
                          }
                        >
                          <X className="h-3 w-3" />
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
                className="w-full rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
              >
                <Users className="mr-2 inline h-4 w-4" />
                {t("chat.createGroup")}
              </button>
            </form>
              </div>
            </details>
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
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-base font-semibold text-primary" aria-hidden="true">
                  {titleFor(conversation).slice(0, 1).toLocaleUpperCase()}
                </span>
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
                <details className="relative">
                  <summary className="cursor-pointer list-none rounded-full border border-border px-3 py-2 text-xs font-medium hover:bg-muted">
                    {t("chat.profileOptions")}
                  </summary>
                  <form
                    className="absolute right-0 top-12 z-10 flex w-72 gap-2 rounded-xl border border-border bg-card p-3 shadow-xl"
                    onSubmit={(event) => {
                      event.preventDefault();
                      saveNickname.mutate();
                    }}
                  >
                    <label htmlFor="chat-nickname" className="sr-only">
                      {t("chat.nickname")}
                    </label>
                    <input
                      id="chat-nickname"
                      value={nickname}
                      onChange={(event) => setNickname(event.target.value)}
                      maxLength={50}
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
                    <div className="flex gap-2">
                      <label className="sr-only" htmlFor="chat-add-member">
                        {t("chat.addGroupMember")}
                      </label>
                      <select
                        id="chat-add-member"
                        value={addMemberId}
                        onChange={(event) => setAddMemberId(event.target.value)}
                        className="min-w-0 flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm"
                      >
                        <option value="">{t("chat.addGroupMember")}</option>
                        {friendRows
                          .filter(
                            (row) =>
                              !selected.participants.some(
                                (participant) =>
                                  participant.userId ===
                                  (row.requesterId === user?.id
                                    ? row.receiverId
                                    : row.requesterId),
                              ),
                          )
                          .map((row) => {
                            const friendId =
                              row.requesterId === user?.id
                                ? row.receiverId
                                : row.requesterId;
                            const friend =
                              row.requesterId === user?.id
                                ? row.receiver
                                : row.requester;
                            return (
                              <option key={row.id} value={friendId}>
                                {friend.username}
                              </option>
                            );
                          })}
                      </select>
                      <button
                        type="button"
                        disabled={!addMemberId || addMembers.isPending}
                        onClick={() => addMembers.mutate()}
                        className="rounded-md border px-2 text-sm"
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
                        className="flex items-center gap-1 rounded-full bg-muted px-2 py-1 text-xs"
                      >
                        <span>
                          {participant.nickname || participant.username}
                          {participant.role === "ADMIN"
                            ? ` · ${t("chat.admin")}`
                            : ""}
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
                              if (
                                window.confirm(
                                  t(
                                    participant.userId === user?.id
                                      ? "chat.confirmLeave"
                                      : "chat.confirmRemove",
                                    { name: participant.username },
                                  ),
                                )
                              )
                                removeMember.mutate(participant.userId);
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
                    onClick={() => {
                      const first = messages.data?.[0];
                      if (!first || !selectedId) return;
                      setLoadingOlder(true);
                      void fetchMessages(selectedId, first.id)
                        .then((older) =>
                          client.setQueryData<ChatMessage[]>(
                            ["chat-messages", selectedId],
                            (current) => [...older, ...(current ?? [])],
                          ),
                        )
                        .catch((error: Error) => toast.error(error.message))
                        .finally(() => setLoadingOlder(false));
                    }}
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
                <div
                  className="flex flex-wrap gap-1"
                  aria-label={t("chat.addEmoji")}
                >
                  {["😀", "😂", "😍", "🎸", "❤️", "🔥"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="rounded p-1 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={t("chat.insertEmoji", { emoji })}
                      onClick={() => setBody((current) => `${current}${emoji}`)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
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
                  <label htmlFor="chat-message" className="sr-only">
                    {t("chat.writeMessage")}
                  </label>
                  <textarea
                    id="chat-message"
                    value={body}
                    onChange={(event) => setBody(event.target.value)}
                    maxLength={5000}
                    rows={2}
                    placeholder={t("chat.writeMessage")}
                    className="max-h-32 min-h-11 flex-1 resize-y bg-transparent p-2 text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <button
                    type="submit"
                    disabled={send.isPending || (!body.trim() && !files.length)}
                    className="rounded-lg bg-primary p-3 text-primary-foreground disabled:opacity-50"
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
