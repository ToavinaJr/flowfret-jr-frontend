import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  pickers: [] as HTMLElement[],
}));

vi.mock("emoji-picker-element", () => ({
  Picker: class {
    constructor() {
      const element = document.createElement("emoji-picker");
      mocks.pickers.push(element);
      return element;
    }
  },
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
    mocks.pickers.length = 0;
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

  it("inserts a picked emoji at the caret and closes the picker on Escape", async () => {
    mocks.conversations.mockResolvedValue([
      {
        id: "chat-1",
        type: "DIRECT",
        name: null,
        participants: [
          { id: "p1", userId: "me", username: "me", nickname: null, role: "ADMIN", lastReadAt: null },
          { id: "p2", userId: "friend", username: "Alice", nickname: null, role: "MEMBER", lastReadAt: null },
        ],
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
        lastMessage: null,
      },
    ]);
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

    fireEvent.click(await screen.findByRole("button", { name: /Alice/ }));
    const composer = await screen.findByLabelText("Écrire un message…");
    fireEvent.change(composer, { target: { value: "Salut toi" } });
    (composer as HTMLTextAreaElement).setSelectionRange(5, 5);

    fireEvent.click(screen.getByRole("button", { name: "Ouvrir le sélecteur d’émojis" }));
    const picker = mocks.pickers[0];
    expect(picker).toBeDefined();
    act(() => {
      picker?.dispatchEvent(
        new CustomEvent("emoji-click", { detail: { unicode: "🎸" } }),
      );
    });

    expect(composer).toHaveValue("Salut🎸 toi");
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: "Sélecteur d’émojis" }),
      ).not.toBeInTheDocument(),
    );
  });
});
