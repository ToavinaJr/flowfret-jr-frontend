import type { MusicTrack } from "@/types/music";
import { RemoteMediaPlayer } from "./RemoteMediaPlayer";

export function YouTubeMediaPlayer({ track }: { track: MusicTrack }) {
  return (
    <RemoteMediaPlayer
      track={track}
      engine="youtube"
      source={track.providerTrackId}
    />
  );
}
