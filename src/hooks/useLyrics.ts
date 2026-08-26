import { useQuery } from "@tanstack/react-query";
import { getLyrics } from "@/services/lyricsApi";
import type { Lyrics, LyricsStatus, LyricsTrack } from "@/types/lyrics";

interface UseLyricsResult {
  lyrics: Lyrics | null;
  status: LyricsStatus;
}

export function useLyrics(track: LyricsTrack | null, enabled = true): UseLyricsResult {
  const query = useQuery({
    queryKey: ["lyrics", track?.provider, track?.id, track?.title, track?.artist, track?.duration],
    queryFn: ({ signal }) => getLyrics(track!, signal),
    enabled: enabled && Boolean(track?.title && track.artist),
    staleTime: 60 * 60 * 1000,
    retry: false,
  });

  if (!track || !enabled) return { lyrics: null, status: "idle" };
  if (query.isPending || query.isFetching) return { lyrics: query.data ?? null, status: "loading" };
  if (query.isError) return { lyrics: null, status: "error" };
  if (query.data === null) return { lyrics: null, status: "not-found" };
  return { lyrics: query.data ?? null, status: "success" };
}
