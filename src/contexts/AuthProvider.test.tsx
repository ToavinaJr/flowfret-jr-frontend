import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError } from "@/types/api";
import { restoreSession } from "@/services/api";
import { clearPlaybackSession } from "@/services/playbackSession";
import { AuthContext } from "./authContext";
import { AuthProvider } from "./AuthProvider";

vi.mock("@/services/api", () => ({
  loginUser: vi.fn(),
  loginWithGoogleUser: vi.fn(),
  registerWithGoogleUser: vi.fn(),
  logoutUser: vi.fn(),
  registerUser: vi.fn(),
  requestPasswordReset: vi.fn(),
  resetPassword: vi.fn(),
  restoreSession: vi.fn(),
  resendVerificationEmail: vi.fn(),
  verifyEmailUser: vi.fn(),
}));

vi.mock("@/services/playbackSession", () => ({
  clearPlaybackSession: vi.fn(),
}));

function renderAuthStatus() {
  return render(
    <AuthProvider>
      <AuthContext.Consumer>
        {(value) => <span>{value?.status ?? "missing"}</span>}
      </AuthContext.Consumer>
    </AuthProvider>,
  );
}

describe("AuthProvider session restoration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps the session pending and retries after a transient server failure", async () => {
    vi.mocked(restoreSession)
      .mockRejectedValueOnce(new ApiClientError("Unavailable", 503))
      .mockResolvedValueOnce({
        accessToken: "fresh-token",
        user: {
          id: "user-1",
          username: "player",
          email: "player@example.test",
          role: "USER",
        },
      });

    renderAuthStatus();
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText("loading")).toBeInTheDocument();
    expect(clearPlaybackSession).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1_000);
    });

    expect(screen.getByText("authenticated")).toBeInTheDocument();
    expect(restoreSession).toHaveBeenCalledTimes(2);
  });

  it("ends restoration only after an explicit authentication rejection", async () => {
    vi.mocked(restoreSession).mockRejectedValueOnce(
      new ApiClientError("Unauthorized", 401),
    );

    renderAuthStatus();
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(screen.getByText("unauthenticated")).toBeInTheDocument();
    expect(clearPlaybackSession).toHaveBeenCalledOnce();
  });
});
