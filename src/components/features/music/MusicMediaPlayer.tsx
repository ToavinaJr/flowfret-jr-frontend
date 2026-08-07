import type { MusicTrack } from "@/types/music";
import { AudiusMediaPlayer } from "./AudiusMediaPlayer";
import { EmbeddedMediaPlayer } from "./EmbeddedMediaPlayer";
import { SpotifyMediaPlayer } from "./SpotifyMediaPlayer";

export function MusicMediaPlayer({ track }: { track: MusicTrack }) {
  if (track.provider === "AUDIUS") {
    return <AudiusMediaPlayer track={track} />;
  }

  if (track.provider === "SPOTIFY") {
    return <SpotifyMediaPlayer track={track} />;
  }

  return <EmbeddedMediaPlayer track={track} />;
}
