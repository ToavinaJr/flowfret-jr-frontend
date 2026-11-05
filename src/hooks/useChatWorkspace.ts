import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { FRIENDSHIP_STATUS } from "@/constants/domain";
import { insertTextAtSelection } from "@/components/chat/insertText";
import { useAuth } from "@/hooks/useAuth";
import { fetchFriendships } from "@/services/friendsApi";
import type { Friendship } from "@/services/friendsApi";
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

export const CHAT_MESSAGE_MAX_LENGTH = 5000;
export const CHAT_NICKNAME_MAX_LENGTH = 50;

export function useChatWorkspace() {
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { t } = useTranslation();
  const { user } = useAuth();
  const client = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | undefined>(conversationId);
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
  const composerRef = useRef<HTMLTextAreaElement>(null);

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
  const avatarFor = useCallback(
    (conversation: ChatConversation) =>
      conversation.type === "DIRECT"
        ? conversation.participants.find(
            (participant) => participant.userId !== user?.id,
          )?.avatarUrl
        : null,
    [user?.id],
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
    mutationFn: () => {
      const normalizedNickname = nickname.trim();
      if (normalizedNickname.length > CHAT_NICKNAME_MAX_LENGTH) {
        throw new Error(t("chat.nicknameTooLong", { max: CHAT_NICKNAME_MAX_LENGTH }));
      }
      return setChatNickname(selectedId!, normalizedNickname || null);
    },
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["chat-conversations"] });
      toast.success(t("chat.nicknameSaved"));
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const refreshChats = useCallback(
    () =>
      Promise.all([
        client.invalidateQueries({ queryKey: ["chat-conversations"] }),
        client.invalidateQueries({ queryKey: ["chat-messages", selectedId] }),
      ]),
    [client, selectedId],
  );
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
  const loadOlderMessages = async () => {
    const first = messages.data?.[0];
    if (!first || !selectedId || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const older = await fetchMessages(selectedId, first.id);
      client.setQueryData<ChatMessage[]>(
        ["chat-messages", selectedId],
        (current) => [...older, ...(current ?? [])],
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("common.loadFailed"));
    } finally {
      setLoadingOlder(false);
    }
  };
  const insertEmoji = (emoji: string) => {
    const input = composerRef.current;
    const selection = input
      ? { start: input.selectionStart, end: input.selectionEnd }
      : { start: body.length, end: body.length };
    const result = insertTextAtSelection(
      body,
      emoji,
      selection,
      CHAT_MESSAGE_MAX_LENGTH,
    );
    setBody(result.value);
    window.requestAnimationFrame(() => {
      input?.focus();
      input?.setSelectionRange(result.caret, result.caret);
    });
  };

  return {
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
    setLoadingOlder,
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
  };
}
