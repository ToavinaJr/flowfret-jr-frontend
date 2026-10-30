import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PAGE_TITLE } from "@/constants/navigation";
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
  const navigate = useNavigate();
  const [searchDraft, setSearchDraft] = useState("");
  const { user, postsQuery, createPost, comment, toggleLike, refresh } = useFeed();
  const posts = postsQuery.data?.pages.flat() ?? [];

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchDraft.trim();
    if (query.length >= 2) navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 px-4 py-4 pb-24 sm:px-6 sm:py-6 md:pb-8 xl:grid-cols-[minmax(0,48rem)_18rem] xl:justify-center">
      <section className="min-w-0" aria-label={t("feed.title")}>
        <div className="mb-4 sm:mb-6">
          <h1 className={`${PAGE_TITLE} mb-4`}>{t("feed.title")}</h1>
          <form onSubmit={submitSearch} role="search" className="flex min-w-0 gap-2 rounded-lg border border-border bg-card p-2">
            <label htmlFor="feed-global-search" className="sr-only">{t("feed.searchInputLabel")}</label>
            <input id="feed-global-search" name="globalSearch" type="search" value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} maxLength={100} placeholder={t("feed.globalSearchPlaceholder")} className="min-h-10 min-w-0 flex-1 bg-transparent px-2 text-sm text-foreground outline-none placeholder:text-muted-foreground" />
            <button type="submit" disabled={searchDraft.trim().length < 2} className="min-h-10 shrink-0 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground disabled:opacity-50">{t("feed.searchAction")}</button>
          </form>
        </div>
        <TrendingMusicRail />
        {user && <PostComposer pending={createPost.isPending} onSubmit={async (content, images) => { await createPost.mutateAsync({ content, images }); }} />}
        {postsQuery.isLoading && <FeedSkeleton />}
        {postsQuery.error && <div className="mb-4 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">{t("feed.loadError")}</div>}
        <div className="space-y-3 sm:space-y-4">{posts.map((post: FeedPost) => <FeedCard key={post.id} post={post} onComment={comment} currentUserId={user?.id ?? ""} onToggleLike={toggleLike} onChanged={refresh} />)}</div>
        {postsQuery.hasNextPage && <button type="button" disabled={postsQuery.isFetchingNextPage} onClick={() => void postsQuery.fetchNextPage()} className="mt-5 min-h-11 w-full rounded-md border border-border bg-card text-sm text-foreground disabled:opacity-50">{t(postsQuery.isFetchingNextPage ? "feed.loadingMore" : "feed.loadMore")}</button>}
        {postsQuery.isSuccess && !posts.length && <p className="py-10 text-center text-sm text-muted-foreground">{t("feed.empty")}</p>}
      </section>
      <aside className="min-w-0 xl:sticky xl:top-6 xl:col-start-2 xl:row-start-1 xl:self-start xl:pt-[3.5rem]"><DiscoverMembersPanel /></aside>
    </div>
  );
};

export default FeedPage;
