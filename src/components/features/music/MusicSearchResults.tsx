import { useTranslation } from "react-i18next";
import type { MusicSearchResult } from "@/types/music";
import { MusicSearchEmptyState } from "./MusicSearchEmptyState";
import { MusicSearchError } from "./MusicSearchError";
import { MusicSearchSkeleton } from "./MusicSearchSkeleton";
import { MusicTrackCard } from "./MusicTrackCard";
import { toMusicPlaybackItem } from "./music-playback";

interface MusicSearchResultsProps {
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  displayingHistory: boolean;
  results: MusicSearchResult | null;
  loadingMore: boolean;
  loadMoreFailed?: boolean;
  hasMore: boolean;
  queueSourceKey?: string;
  onLoadMore: () => void;
}

export function MusicSearchResults({
  loading,
  error,
  hasSearched,
  displayingHistory,
  results,
  loadingMore,
  loadMoreFailed = false,
  hasMore,
  queueSourceKey,
  onLoadMore,
}: MusicSearchResultsProps) {
  const { t } = useTranslation();
  const tracks = results?.tracks ?? [];
  const playbackQueue = tracks.map((track) =>
    toMusicPlaybackItem(track, queueSourceKey),
  );

  if (loading) {
    return <MusicSearchSkeleton />;
  }

  if (error) {
    return <MusicSearchError message={error} />;
  }

  if ((!hasSearched && !displayingHistory) || tracks.length === 0) {
    return (
      <MusicSearchEmptyState
        hasSearched={hasSearched}
        hasResults={tracks.length > 0}
      />
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        {displayingHistory
          ? t("music.listeningHistory")
          : t("music.resultsSummary", {
              shown: tracks.length,
              total: results?.total ?? tracks.length,
            })}
      </p>
      <ul className="space-y-3">
        {tracks.map((track, index) => (
          <li key={`${track.provider}:${track.providerTrackId}`}>
            <MusicTrackCard
              track={track}
              playbackQueue={playbackQueue}
              queueIndex={index}
            />
          </li>
        ))}
      </ul>
      {loadMoreFailed ? (
        <p role="alert" className="text-sm text-destructive">{t("music.loadMoreFailed")}</p>
      ) : null}
      {(hasSearched || displayingHistory) && hasMore ? (
        <button
          type="button"
          disabled={loadingMore}
          onClick={onLoadMore}
          className="min-h-11 w-full rounded-md border border-border bg-card text-sm font-medium disabled:opacity-50"
        >
          {t(loadingMore ? "music.loadingMore" : loadMoreFailed ? "common.retry" : "music.loadMore")}
        </button>
      ) : null}
    </div>
  );
}
