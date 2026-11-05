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
  removeMember: vi.fn(),
  toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn() }),
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
  removeChatGroupMember: mocks.removeMember,
  sendMessage: mocks.send,
  uploadChatImages: vi.fn(),
  connectChat: mocks.socket,
}));
vi.mock("sonner", () => ({ toast: mocks.toast }));

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
    mocks.removeMember.mockResolvedValue(undefined);
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
    fireEvent.click(screen.getByRole("button", { name: "Nouvelle conversation" }));
    fireEvent.change(screen.getByRole("searchbox", { name: "Choisir un ami" }), {
      target: { value: "Alice" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Alice, @Alice" }));

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

  it("offers a path to find friends when the friend list is empty", async () => {
    mocks.friendships.mockResolvedValue([]);
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

    fireEvent.click(screen.getByRole("button", { name: "Nouvelle conversation" }));
    fireEvent.focus(screen.getByRole("searchbox", { name: "Choisir un ami" }));

    expect(await screen.findByRole("link", { name: "Trouver des amis" })).toHaveAttribute(
      "href",
      "/friends#discover",
    );
  });

  it.each([
    {
      memberId: "friend",
      message: "Retirer Alice de ce groupe ?",
      actionLabel: "Retirer le membre",
    },
    {
      memberId: "me",
      message: "Quitter ce groupe ?",
      actionLabel: "Quitter le groupe",
    },
  ])("asks before removing member $memberId", async ({ memberId, message, actionLabel }) => {
    mocks.conversations.mockResolvedValue([
      {
        id: "group-1",
        type: "GROUP",
        name: "Jam",
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

    fireEvent.click(await screen.findByRole("button", { name: /Jam/ }));
    fireEvent.click(
      await screen.findByRole("button", {
        name: memberId === "me" ? "Quitter le groupe" : "Retirer Alice du groupe",
      }),
    );

    expect(mocks.removeMember).not.toHaveBeenCalled();
    const lastToastCall = mocks.toast.mock.calls[mocks.toast.mock.calls.length - 1];
    const options = lastToastCall?.[1];
    expect(mocks.toast).toHaveBeenLastCalledWith(
      message,
      expect.objectContaining({
        action: expect.objectContaining({ label: actionLabel }),
      }),
    );
    (options as { action: { onClick: () => void } }).action.onClick();
    await waitFor(() =>
      expect(mocks.removeMember).toHaveBeenCalledWith("group-1", memberId),
    );
  });
});
