import { Search, X } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { PAGE_TITLE } from "@/constants/navigation";
import { useTranslation } from "react-i18next";
import { useFeed } from "@/hooks/useFeed";
import { PostComposer } from "@/components/feed/PostComposer";
import { FeedCard } from "@/components/feed/FeedCard";
import { FeedSkeleton } from "@/components/skeletons/FeedSkeleton";
import type { FeedPost } from "@/types/feed";
import { TrendingMusicRail } from "@/components/feed/TrendingMusicRail";
import { DiscoverMembersPanel } from "@/components/feed/DiscoverMembersPanel";

export { FeedCard } from "@/components/feed/FeedCard";
export type { FeedCardProps } from "@/components/feed/FeedCard";

const FeedPage = () => {
  const { t } = useTranslation();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchDraft, setSearchDraft] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { user, postsQuery, createPost, comment, toggleLike, refresh } = useFeed(submittedSearch);
  const posts = postsQuery.data?.pages.flat() ?? [];

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittedSearch(searchDraft.trim());
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchDraft("");
    setSubmittedSearch("");
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 py-4 pb-24 sm:px-6 sm:py-6 md:pb-8 xl:grid-cols-[minmax(0,48rem)_18rem] xl:justify-center">
      <section className="min-w-0" aria-label={t("feed.title")}>
        <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6 flex-wrap">
          <h1 className={`${PAGE_TITLE} mb-0 min-w-0 flex-1`}>{t("feed.title")}</h1>
          <button
            type="button"
            onClick={() => searchOpen ? closeSearch() : setSearchOpen(true)}
            aria-expanded={searchOpen}
            aria-label={t(searchOpen ? "feed.closeSearch" : "feed.openSearch")}
            className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-2 rounded-md border border-border bg-card px-0 text-sm text-muted-foreground hover:text-foreground sm:px-3"
          >
            {searchOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
            <span className="hidden sm:inline">{t(searchOpen ? "feed.closeSearch" : "feed.searchPosts")}</span>
          </button>
        </div>
        {searchOpen && (
          <form onSubmit={submitSearch} role="search" className="mb-4 flex min-w-0 gap-2 rounded-lg border border-border bg-card p-2">
            <label htmlFor="feed-post-search" className="sr-only">{t("feed.searchInputLabel")}</label>
            <input
              ref={searchInputRef}
              id="feed-post-search"
              name="feedPostSearch"
              type="search"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
              maxLength={100}
              placeholder={t("feed.searchPlaceholder")}
              className="min-h-10 min-w-0 flex-1 bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
            <button type="submit" className="min-h-10 shrink-0 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground">{t("feed.searchAction")}</button>
            {submittedSearch && <button type="button" onClick={closeSearch} className="min-h-10 shrink-0 rounded-md border border-border px-3 text-sm text-foreground">{t("feed.clearSearch")}</button>}
          </form>
        )}
        <TrendingMusicRail />
        {user && (
          <PostComposer
            pending={createPost.isPending}
            onSubmit={async (content, images) => {
              await createPost.mutateAsync({ content, images });
            }}
          />
        )}
        {postsQuery.isLoading && <FeedSkeleton />}
        {postsQuery.error && (
          <div className="mb-4 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            {t("feed.loadError")}
          </div>
        )}
        <div className="space-y-3 sm:space-y-4">
          {posts.map((post: FeedPost) => (
            <FeedCard
              key={post.id}
              post={post}
              onComment={comment}
              currentUserId={user?.id ?? ""}
              onToggleLike={toggleLike}
              onChanged={refresh}
            />
          ))}
        </div>
        {postsQuery.hasNextPage && (
          <button
            type="button"
            disabled={postsQuery.isFetchingNextPage}
            onClick={() => void postsQuery.fetchNextPage()}
            className="mt-5 min-h-11 w-full rounded-md border border-border bg-card text-sm text-foreground disabled:opacity-50"
          >
            {t(postsQuery.isFetchingNextPage ? "feed.loadingMore" : "feed.loadMore")}
          </button>
        )}
        {postsQuery.isSuccess && !posts.length && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t(submittedSearch ? "feed.searchEmpty" : "feed.empty")}
          </p>
        )}
      </section>
      <aside className="min-w-0 xl:col-start-2 xl:row-start-1 xl:pt-20">
        <DiscoverMembersPanel />
      </aside>
    </div>
  );
};

export default FeedPage;
