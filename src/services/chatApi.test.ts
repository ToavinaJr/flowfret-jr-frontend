import { beforeEach, describe, expect, it, vi } from "vitest";
import { connectChat } from "@/services/chatApi";

const { io, getAccessToken } = vi.hoisted(() => ({
  io: vi.fn(),
  getAccessToken: vi.fn(),
}));

vi.mock("socket.io-client", () => ({ io }));
vi.mock("@/services/authToken", () => ({ getAccessToken }));
vi.mock("@/services/graphqlClient", () => ({ graphqlRequest: vi.fn() }));
vi.mock("@/services/backend", () => ({
  GRAPHQL_URL: "http://localhost:3000/graphql",
}));

describe("connectChat", () => {
  beforeEach(() => vi.clearAllMocks());

  it("falls back to polling when the websocket transport is unavailable", () => {
    getAccessToken.mockReturnValue("valid-token");

    connectChat();

    expect(io).toHaveBeenCalledWith("http://localhost:3000/chat", {
      auth: { token: "valid-token" },
      transports: ["websocket", "polling"],
      tryAllTransports: true,
      reconnection: true,
    });
  });

  it("does not create a socket without an access token", () => {
    getAccessToken.mockReturnValue(null);

    expect(connectChat()).toBeNull();
    expect(io).not.toHaveBeenCalled();
  });
});
