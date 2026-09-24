import type { MusicTrack } from "@/types/music";
import { RemoteMediaPlayer } from "./RemoteMediaPlayer";

export function SpotifyMediaPlayer({ track }: { track: MusicTrack }) {
  return (
    <RemoteMediaPlayer
      track={track}
      engine="spotify"
      source={`spotify:track:${track.providerTrackId}`}
    />
  );
}
