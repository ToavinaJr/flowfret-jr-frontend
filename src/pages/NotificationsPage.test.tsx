import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import NotificationsPage from "./NotificationsPage";

const mocks = vi.hoisted(() => ({
  fetchNotifications: vi.fn(),
  fetchNotificationPreferences: vi.fn(),
  markNotificationRead: vi.fn(),
  setNotificationPreference: vi.fn(),
}));

vi.mock("@/services/api", () => ({
  fetchNotifications: mocks.fetchNotifications,
  fetchNotificationPreferences: mocks.fetchNotificationPreferences,
  markNotificationRead: mocks.markNotificationRead,
  setNotificationPreference: mocks.setNotificationPreference,
}));

function renderNotificationsPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n.cloneInstance({ lng: "en" })}>
        <MemoryRouter>
          <NotificationsPage />
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  );
}

describe("NotificationsPage preferences dialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.fetchNotifications.mockResolvedValue([]);
    mocks.fetchNotificationPreferences.mockResolvedValue([]);
  });

  it("opens notification preferences in a modal only when settings are requested", async () => {
    renderNotificationsPage();

    expect(await screen.findByText("No notifications yet.")).toBeInTheDocument();
    expect(mocks.fetchNotificationPreferences).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: "Open notification settings" }),
    );

    expect(
      await screen.findByRole("dialog", { name: "What I want to receive" }),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(mocks.fetchNotificationPreferences).toHaveBeenCalledTimes(1),
    );
  });

  it("closes the preferences modal with Escape", async () => {
    renderNotificationsPage();
    await screen.findByText("No notifications yet.");
    fireEvent.click(
      screen.getByRole("button", { name: "Open notification settings" }),
    );
    await screen.findByRole("dialog", { name: "What I want to receive" });

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
