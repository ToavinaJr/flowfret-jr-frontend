import type { PlaybackItem } from "@/contexts/PlaybackContext";
import { useLyrics } from "@/hooks/useLyrics";
import { LyricsPanel } from "./LyricsPanel";

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
  if (!track) return null;

  return <LyricsPanel lyrics={lyrics} status={status} currentTime={currentTime} onSeek={onSeek} />;
}
