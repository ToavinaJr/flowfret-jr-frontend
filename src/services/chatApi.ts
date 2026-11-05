import { io, type Socket } from "socket.io-client";
import { graphqlRequest } from "@/services/graphqlClient";
import { getAccessToken } from "@/services/authToken";
import { GRAPHQL_URL } from "@/services/backend";

export interface ChatParticipant {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  nickname: string | null;
  role: "ADMIN" | "MEMBER";
  lastReadAt: string | null;
}
export interface ChatAttachment {
  id: string;
  uploadId: string;
  position: number;
  contentUrl: string;
}
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderUsername: string;
  body: string | null;
  createdAt: string;
  attachments: ChatAttachment[];
}
export interface ChatConversation {
  id: string;
  type: "DIRECT" | "GROUP";
  name: string | null;
  participants: ChatParticipant[];
  lastMessage: ChatMessage | null;
  unreadCount: number;
  updatedAt: string;
}

export const fetchConversations = () =>
  graphqlRequest<{ myConversations: ChatConversation[] }>({
    query: `query MyConversations { myConversations { id type name updatedAt unreadCount participants { id userId username avatarUrl nickname role lastReadAt } lastMessage { id conversationId senderId senderUsername body createdAt attachments { id uploadId position contentUrl } } } }`,
  }).then((data) => data.myConversations);
export const fetchMessages = (conversationId: string, before?: string) =>
  graphqlRequest<{ conversationMessages: ChatMessage[] }>({
    query: `query ConversationMessages($conversationId: String!, $before: String, $take: Int!) { conversationMessages(conversationId: $conversationId, before: $before, take: $take) { id conversationId senderId senderUsername body createdAt attachments { id uploadId position contentUrl } } }`,
    variables: { conversationId, before: before ?? null, take: 40 },
  }).then((data) => data.conversationMessages);
export const createDirectChat = (friendId: string) =>
  graphqlRequest<{ createDirectConversation: ChatConversation }>({
    query: `mutation CreateDirectConversation($friendId: String!) { createDirectConversation(friendId: $friendId) { id type name updatedAt unreadCount participants { id userId username avatarUrl nickname role lastReadAt } lastMessage { id conversationId senderId senderUsername body createdAt attachments { id uploadId position contentUrl } } } }`,
    variables: { friendId },
  }).then((data) => data.createDirectConversation);
export const createGroupChat = (name: string, memberIds: string[]) =>
  graphqlRequest<{ createGroupConversation: ChatConversation }>({
    query: `mutation CreateGroupConversation($name: String!, $memberIds: [String!]!) { createGroupConversation(name: $name, memberIds: $memberIds) { id type name updatedAt unreadCount participants { id userId username avatarUrl nickname role lastReadAt } lastMessage { id conversationId senderId senderUsername body createdAt attachments { id uploadId position contentUrl } } } }`,
    variables: { name, memberIds },
  }).then((data) => data.createGroupConversation);
export const sendMessage = (
  conversationId: string,
  body: string,
  uploadIds: string[],
) =>
  graphqlRequest<{ sendChatMessage: ChatMessage }>({
    query: `mutation SendChatMessage($conversationId: String!, $body: String, $uploadIds: [String!]!) { sendChatMessage(conversationId: $conversationId, body: $body, uploadIds: $uploadIds) { id conversationId senderId senderUsername body createdAt attachments { id uploadId position contentUrl } } }`,
    variables: { conversationId, body: body || null, uploadIds },
  }).then((data) => data.sendChatMessage);
export const markChatRead = (conversationId: string) =>
  graphqlRequest<{ markConversationRead: boolean }>({
    query: `mutation MarkConversationRead($conversationId: String!) { markConversationRead(conversationId: $conversationId) }`,
    variables: { conversationId },
  });
export const setChatNickname = (conversationId: string, nickname: string | null) =>
  graphqlRequest<{ setChatNickname: boolean }>({
    query: `mutation SetChatNickname($conversationId: String!, $nickname: String) { setChatNickname(conversationId: $conversationId, nickname: $nickname) }`,
    variables: { conversationId, nickname },
  });
const conversationSelection = `id type name updatedAt unreadCount participants { id userId username avatarUrl nickname role lastReadAt } lastMessage { id conversationId senderId senderUsername body createdAt attachments { id uploadId position contentUrl } }`;
export const renameChatGroup = (conversationId: string, name: string) =>
  graphqlRequest<{ renameChatGroup: ChatConversation }>({
    query: `mutation RenameChatGroup($conversationId: String!, $name: String!) { renameChatGroup(conversationId: $conversationId, name: $name) { ${conversationSelection} } }`,
    variables: { conversationId, name },
  }).then((data) => data.renameChatGroup);
export const addChatGroupMembers = (
  conversationId: string,
  memberIds: string[],
) =>
  graphqlRequest<{ addChatGroupMembers: ChatConversation }>({
    query: `mutation AddChatGroupMembers($conversationId: String!, $memberIds: [String!]!) { addChatGroupMembers(conversationId: $conversationId, memberIds: $memberIds) { ${conversationSelection} } }`,
    variables: { conversationId, memberIds },
  }).then((data) => data.addChatGroupMembers);
export const removeChatGroupMember = (
  conversationId: string,
  memberId: string,
) =>
  graphqlRequest<{ removeChatGroupMember: boolean }>({
    query: `mutation RemoveChatGroupMember($conversationId: String!, $memberId: String!) { removeChatGroupMember(conversationId: $conversationId, memberId: $memberId) }`,
    variables: { conversationId, memberId },
  });
export const setChatGroupRole = (
  conversationId: string,
  memberId: string,
  role: "ADMIN" | "MEMBER",
) =>
  graphqlRequest<{ setChatGroupRole: boolean }>({
    query: `mutation SetChatGroupRole($conversationId: String!, $memberId: String!, $role: ConversationParticipantRole!) { setChatGroupRole(conversationId: $conversationId, memberId: $memberId, role: $role) }`,
    variables: { conversationId, memberId, role },
  });

export async function uploadChatImages(files: File[]) {
  if (!files.length || files.length > 4)
    throw new Error("Select between 1 and 4 images.");
  if (
    files.some(
      (file) =>
        !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
        file.size > 8 * 1024 * 1024,
    )
  )
    throw new Error("Use JPEG, PNG or WebP images up to 8 MB.");
  const token = getAccessToken();
  if (!token) throw new Error("Authentication required.");
  const form = new FormData();
  files.forEach((file) => form.append("images", file));
  const endpoint = GRAPHQL_URL.replace(
    /\/graphql\/?$/,
    "/uploads/message-images",
  );
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!response.ok) throw new Error("Image upload failed.");
  return (await response.json()) as Array<{ id: string }>;
}

export function connectChat(): Socket | null {
  const token = getAccessToken();
  if (!token) return null;
  return io(`${new URL(GRAPHQL_URL).origin}/chat`, {
    auth: { token },
    transports: ["websocket", "polling"],
    tryAllTransports: true,
    reconnection: true,
  });
}

export async function fetchPrivateImage(url: string, signal: AbortSignal) {
  const token = getAccessToken();
  if (!token) throw new Error("Authentication required.");
  const response = await fetch(new URL(url, new URL(GRAPHQL_URL).origin), {
    headers: { Authorization: `Bearer ${token}` },
    signal,
  });
  if (!response.ok) throw new Error("Image unavailable.");
  return URL.createObjectURL(await response.blob());
}
