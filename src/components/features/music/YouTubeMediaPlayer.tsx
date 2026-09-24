import type { MusicTrack } from "@/types/music";
import { RemoteMediaPlayer } from "./RemoteMediaPlayer";
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
    <RemoteMediaPlayer
      track={track}
      playbackQueue={playbackQueue}
      queueIndex={queueIndex}
    />
  );
}
