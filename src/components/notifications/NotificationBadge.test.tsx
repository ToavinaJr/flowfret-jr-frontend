import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import { NotificationBadge } from "./NotificationBadge";

const mocks = vi.hoisted(() => ({
  fetchUnreadNotificationCount: vi.fn(),
  useAuth: vi.fn(),
}));

vi.mock("@/services/notificationsApi", () => ({
  fetchUnreadNotificationCount: mocks.fetchUnreadNotificationCount,
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: mocks.useAuth,
}));

function renderBadge() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <NotificationBadge />
      </I18nextProvider>
    </QueryClientProvider>,
  );
}

describe("NotificationBadge", () => {
  beforeEach(() => {
    mocks.fetchUnreadNotificationCount.mockReset();
    mocks.useAuth.mockReset();
  });

  it("n'interroge pas les notifications avant l'authentification", async () => {
    mocks.useAuth.mockReturnValue({ status: "loading" });

    renderBadge();

    await waitFor(() => {
      expect(mocks.fetchUnreadNotificationCount).not.toHaveBeenCalled();
    });
  });

  it("interroge les notifications uniquement après authentification", async () => {
    mocks.useAuth.mockReturnValue({ status: "authenticated" });
    mocks.fetchUnreadNotificationCount.mockResolvedValue(2);

    renderBadge();

    await waitFor(() => {
      expect(mocks.fetchUnreadNotificationCount).toHaveBeenCalledTimes(1);
    });
  });
});
