import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";
import { Music2, MessageSquareText, Users } from "lucide-react";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { fetchFeedPosts } from "@/services/feedApi";
import { searchUsers } from "@/services/friendsApi";
import { searchMusic } from "@/services/musicGraphql";
import { useFeed } from "@/hooks/useFeed";
import { FeedCard } from "@/components/feed/FeedCard";
import { MusicTrackCard } from "@/components/features/music/MusicTrackCard";
import { toMusicPlaybackItem } from "@/components/features/music/music-playback";
import type { SocialUser } from "@/services/profileApi";
import { UserAvatar } from "@/components/common/UserAvatar";

const MUSIC_PAGE_SIZE = 10;

export default function GlobalSearchPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const query = params.get("q")?.trim() ?? "";
  const { user, comment, toggleLike, refresh } = useFeed("", { loadPosts: false });
  const posts = useQuery({ queryKey: ["global-search-posts", query], queryFn: () => fetchFeedPosts(undefined, 10, query), enabled: query.length >= 2, staleTime: 30_000 });
  const members = useQuery({ queryKey: ["global-search-members", query], queryFn: () => searchUsers(query), enabled: query.length >= 2, staleTime: 60_000 });
  const music = useInfiniteQuery({ queryKey: ["global-search-music", query], queryFn: ({ pageParam }) => searchMusic(query, MUSIC_PAGE_SIZE, pageParam), initialPageParam: undefined as string | undefined, getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined, enabled: query.length >= 2, staleTime: 60_000 });
  const tracks = music.data?.pages.flatMap((page) => page.tracks) ?? [];
  const musicQueue = tracks.map(toMusicPlaybackItem);

  return (
    <main className={`${PAGE_SHELL} space-y-5`}>
      <h1 className={PAGE_TITLE}>{t("feed.globalSearchResults")}: {query}</h1>
      {query.length < 2 ? <p className="text-muted-foreground">{t("feed.globalSearchTooShort")}</p> : <>
        <SearchSection icon={<MessageSquareText className="h-4 w-4" />} title={t("feed.searchPosts")} loading={posts.isLoading} error={posts.isError} empty={!posts.isLoading && !posts.isError && !posts.data?.length}>
          {posts.data?.map((post) => <FeedCard key={post.id} post={post} onComment={comment} currentUserId={user?.id ?? ""} onToggleLike={toggleLike} onChanged={refresh} />)}
        </SearchSection>
        <SearchSection icon={<Users className="h-4 w-4" />} title={t("feed.searchMembers")} loading={members.isLoading} error={members.isError} empty={!members.isLoading && !members.isError && !members.data?.length}>
          <ul className="grid gap-2 sm:grid-cols-2">{members.data?.map((person: SocialUser) => <li key={person.id}><Link to={`/profile/${person.id}`} className="flex min-h-14 items-center gap-3 rounded-lg border border-border p-3 hover:bg-secondary"><UserAvatar src={person.avatarUrl} name={person.profile?.displayName || person.username} size="xs" /><span className="min-w-0"><span className="block truncate font-medium">{person.profile?.displayName || person.username}</span><span className="block truncate text-sm text-muted-foreground">@{person.username}</span></span></Link></li>)}</ul>
        </SearchSection>
        <SearchSection icon={<Music2 className="h-4 w-4" />} title={t("feed.searchMusic")} loading={music.isLoading} error={music.isError} empty={!music.isLoading && !music.isError && tracks.length === 0}>
          <ul className="space-y-3">{tracks.map((track, index) => <li key={`${track.provider}:${track.providerTrackId}`}><MusicTrackCard track={track} playbackQueue={musicQueue} queueIndex={index} /></li>)}</ul>
          {music.hasNextPage && <button type="button" disabled={music.isFetchingNextPage} onClick={() => void music.fetchNextPage()} className="min-h-11 w-full rounded-md border border-border bg-card text-sm font-medium disabled:opacity-50">{t(music.isFetchingNextPage ? "music.loadingMore" : "music.loadMore")}</button>}
        </SearchSection>
      </>}
    </main>
  );
}

function SearchSection({ icon, title, loading, error, empty, children }: { icon: ReactNode; title: string; loading: boolean; error: boolean; empty: boolean; children: ReactNode }) {
  const { t } = useTranslation();
  return <section className="rounded-lg border border-border bg-card p-3 sm:p-4" aria-label={title}><h2 className="mb-3 flex items-center gap-2 font-semibold">{icon}{title}</h2>{loading ? <p role="status" className="text-sm text-muted-foreground">{t("feed.globalSearchLoading")}</p> : error ? <p role="alert" className="text-sm text-destructive">{t("feed.globalSearchError")}</p> : empty ? <p className="text-sm text-muted-foreground">{t("feed.globalSearchEmpty")}</p> : <div className="space-y-3">{children}</div>}</section>;
}
