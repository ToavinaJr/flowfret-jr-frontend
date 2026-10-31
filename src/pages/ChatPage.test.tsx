import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import ChatPage from "./ChatPage";

const mocks = vi.hoisted(() => ({
  conversations: vi.fn(),
  friendships: vi.fn(),
  direct: vi.fn(),
  messages: vi.fn(),
  read: vi.fn(),
  group: vi.fn(),
  nickname: vi.fn(),
  send: vi.fn(),
  socket: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "me", username: "me" } }),
}));
vi.mock("@/services/friendsApi", () => ({
  fetchFriendships: mocks.friendships,
}));
vi.mock("@/services/chatApi", () => ({
  fetchConversations: mocks.conversations,
  fetchMessages: mocks.messages,
  createDirectChat: mocks.direct,
  createGroupChat: mocks.group,
  markChatRead: mocks.read,
  setChatNickname: mocks.nickname,
  sendMessage: mocks.send,
  uploadChatImages: vi.fn(),
  connectChat: mocks.socket,
}));

describe("ChatPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.conversations.mockResolvedValue([]);
    mocks.friendships.mockResolvedValue([
      {
        id: "friendship",
        status: "ACCEPTED",
        requesterId: "me",
        receiverId: "friend",
        requester: { id: "me", username: "me" },
        receiver: { id: "friend", username: "Alice" },
      },
    ]);
    mocks.direct.mockResolvedValue({
      id: "chat-1",
      type: "DIRECT",
      name: null,
      participants: [],
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
      lastMessage: null,
    });
    mocks.messages.mockResolvedValue([]);
    mocks.read.mockResolvedValue(undefined);
    mocks.socket.mockReturnValue({
      on: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn(),
    });
  });

  it("shows the empty state and offers accepted friends for a private chat", async () => {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={client}>
        <I18nextProvider i18n={i18n.cloneInstance({ lng: "fr" })}>
          <ChatPage />
        </I18nextProvider>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByText("Aucune conversation pour le moment."),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Nouvelle conversation privée"), {
      target: { value: "friend" },
    });

    await waitFor(() => expect(mocks.direct.mock.calls[0]?.[0]).toBe("friend"));
  });
});
