import { useQuery } from "@tanstack/react-query";
import type { PlaybackItem } from "@/contexts/PlaybackContext";
import { TRANSCRIPTION_STATUS } from "@/constants/domain";
import { useLyrics } from "@/hooks/useLyrics";
import { findTranscriptionForTrack } from "@/services/transcriptionsApi";
import type { LyricsStatus } from "@/types/lyrics";
import { transcriptionSegmentsToLyrics } from "@/utils/transcription";
import { LyricsPanel } from "./LyricsPanel";

const IN_PROGRESS_REFRESH_MS = 5_000;

export function PersistentLyrics({
  item,
  currentTime,
  onSeek,
}: {
  item: PlaybackItem;
  currentTime: number;
  onSeek: (time: number) => void;
}) {
  const idParts = item.id.split(":");
  const trackId = item.providerTrackId ?? idParts[idParts.length - 1];
  const track = item.provider && item.artist?.trim() && trackId
    ? {
        id: trackId,
        provider: item.provider,
        title: item.title,
        artist: item.artist,
        album: item.album,
        duration: item.duration,
      }
    : null;
  const { lyrics, status } = useLyrics(track, true);
  // The lyrics lookup and the Whisper transcription are separate sources: when the
  // lookup finds nothing, show the transcription the user already has for this track
  // (the same one the track card displays) instead of "lyrics unavailable".
  const lookupMissed = status === "not-found" || status === "error";
  const transcription = useQuery({
    queryKey: ["transcription-for-track", track?.provider, track?.id],
    queryFn: () => findTranscriptionForTrack(track!.provider, track!.id),
    enabled: Boolean(track) && lookupMissed,
    retry: false,
    refetchInterval: (query) => {
      const current = query.state.data;
      return current &&
        current.status !== TRANSCRIPTION_STATUS.COMPLETED &&
        current.status !== TRANSCRIPTION_STATUS.FAILED
        ? IN_PROGRESS_REFRESH_MS
        : false;
    },
  });
  if (!track) return null;

  const transcribedLyrics = transcription.data
    ? transcriptionSegmentsToLyrics(transcription.data.segments)
    : null;
  const transcriptionInProgress = Boolean(
    transcription.data &&
      transcription.data.status !== TRANSCRIPTION_STATUS.COMPLETED &&
      transcription.data.status !== TRANSCRIPTION_STATUS.FAILED,
  );
  const panelLyrics = lyrics ?? transcribedLyrics;
  const panelStatus: LyricsStatus = !lookupMissed
    ? status
    : transcribedLyrics
      ? "success"
      : transcriptionInProgress || (transcription.isPending && transcription.fetchStatus !== "idle")
        ? "loading"
        : status;

  return <LyricsPanel lyrics={panelLyrics} status={panelStatus} currentTime={currentTime} onSeek={onSeek} />;
}
