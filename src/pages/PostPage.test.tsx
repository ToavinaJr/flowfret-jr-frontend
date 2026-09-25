import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import PostPage from "./PostPage";

const mocks = vi.hoisted(() => ({
  fetchFeedPost: vi.fn(),
}));

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ user: { id: "viewer-id" } }),
}));

vi.mock("@/services/api", () => ({
  fetchFeedPost: mocks.fetchFeedPost,
  createFeedComment: vi.fn(),
  createFeedLike: vi.fn(),
  deleteFeedLike: vi.fn(),
}));

vi.mock("@/components/feed/FeedCard", () => ({
  FeedCard: ({ post }: { post: { content: string } }) => (
    <article>{post.content}</article>
  ),
}));

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const testI18n = i18n.cloneInstance({ lng: "fr" });

  return render(
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={testI18n}>
        <MemoryRouter initialEntries={["/post/post-id"]}>
          <Routes>
            <Route path="/post/:postId" element={<PostPage />} />
          </Routes>
        </MemoryRouter>
      </I18nextProvider>
    </QueryClientProvider>,
  );
}

describe("PostPage", () => {
  beforeEach(() => {
    mocks.fetchFeedPost.mockReset();
  });

  it("affiche la publication chargée depuis son URL", async () => {
    mocks.fetchFeedPost.mockResolvedValue({
      id: "post-id",
      content: "Contenu de la publication",
    });

    renderPage();

    expect(
      await screen.findByText("Contenu de la publication"),
    ).toBeInTheDocument();
    expect(mocks.fetchFeedPost).toHaveBeenCalledWith("post-id");
  });

  it("affiche une erreur actionnable lorsque le chargement échoue", async () => {
    mocks.fetchFeedPost.mockRejectedValue(new Error("Network error"));

    renderPage();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Impossible de charger cette publication",
    );
    expect(screen.getByRole("button", { name: "Réessayer" })).toBeEnabled();
  });
});
