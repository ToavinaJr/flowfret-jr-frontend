import { useTranslation } from "react-i18next";
import type { MusicSearchResult } from "@/types/music";
import { MusicSearchEmptyState } from "./MusicSearchEmptyState";
import { MusicSearchError } from "./MusicSearchError";
import { MusicSearchSkeleton } from "./MusicSearchSkeleton";
import { MusicTrackCard } from "./MusicTrackCard";

interface MusicSearchResultsProps {
  loading: boolean;
  error: string | null;
  hasSearched: boolean;
  results: MusicSearchResult | null;
}

export function MusicSearchResults({
  loading,
  error,
  hasSearched,
  results,
}: MusicSearchResultsProps) {
  const { t } = useTranslation();
  const tracks = results?.tracks ?? [];

  if (loading) {
    return <MusicSearchSkeleton />;
  }

  if (error) {
    return <MusicSearchError message={error} />;
  }

  if (!hasSearched || tracks.length === 0) {
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
        {t("music.resultsCount", { count: results?.total ?? tracks.length })}
      </p>
      <ul className="space-y-3">
        {tracks.map((track) => (
          <li key={track.youtubeId}>
            <MusicTrackCard track={track} />
          </li>
        ))}
      </ul>
    </div>
  );
}
