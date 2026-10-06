import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import ProfilePage from "./ProfilePage";

const mocks = vi.hoisted(() => ({
  fetchMyProfile: vi.fn(),
  saveProfile: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { id: "user-id", username: "alice", email: "alice@example.com", role: "USER" },
  }),
}));

vi.mock("@/services/api", () => ({
  createFeedComment: vi.fn(),
  createFeedLike: vi.fn(),
  deleteFeedLike: vi.fn(),
  fetchMyProfile: mocks.fetchMyProfile,
  saveProfile: mocks.saveProfile,
  uploadImages: vi.fn(),
}));

vi.mock("@/pages/FeedPage", () => ({
  FeedCard: () => null,
}));

describe("ProfilePage", () => {
  beforeEach(() => {
    mocks.fetchMyProfile.mockReset();
    mocks.saveProfile.mockReset().mockResolvedValue(undefined);
    mocks.fetchMyProfile.mockResolvedValue({
      id: "profile-id",
      userId: "user-id",
      displayName: "Alice",
      avatarUrl: null,
      bio: "Guitar player",
      visibility: "PUBLIC",
      user: { id: "user-id", username: "alice", authoredPosts: [] },
    });
  });

  it("keeps the edited display name when inserting text in the middle", async () => {
    const testI18n = i18n.cloneInstance({ lng: "fr" });

    render(
      <I18nextProvider i18n={testI18n}>
        <MemoryRouter initialEntries={["/profile"]}>
          <Routes>
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>,
    );

    const input = (await screen.findByRole("textbox", {
      name: "Nom affiché",
    })) as HTMLInputElement;
    input.focus();
    input.setSelectionRange(2, 2);
    fireEvent.change(input, { target: { value: "AlXice" } });

    expect(input).toHaveValue("AlXice");
    expect(document.activeElement).toBe(input);
    expect(screen.getByText("AlXice")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Enregistrer" }));
    await waitFor(() => {
      expect(mocks.saveProfile).toHaveBeenCalledWith(
        { displayName: "AlXice", bio: "Guitar player", visibility: "PUBLIC" },
        "profile-id",
      );
    });
  });
});
