import type { MusicTrack } from "@/types/music";
import { TranscriptionMediaPlayer } from "./AudiusMediaPlayer";
import type { PlaybackItem } from "@/contexts/PlaybackContext";

export function YouTubeMediaPlayer({
  track,
  playbackQueue,
  queueIndex,
}: {
  track: MusicTrack;
  playbackQueue: PlaybackItem[];
  queueIndex: number;
}) {
  return (
    <TranscriptionMediaPlayer
      track={track}
      playbackQueue={playbackQueue}
      queueIndex={queueIndex}
    />
  );
}
