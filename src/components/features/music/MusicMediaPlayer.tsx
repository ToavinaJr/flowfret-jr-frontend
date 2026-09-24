import type { MusicTrack } from "@/types/music";
import { MUSIC_PROVIDER } from "@/constants/domain";
import { AudiusMediaPlayer } from "./AudiusMediaPlayer";
import { SpotifyMediaPlayer } from "./SpotifyMediaPlayer";
import { YouTubeMediaPlayer } from "./YouTubeMediaPlayer";

export function MusicMediaPlayer({ track }: { track: MusicTrack }) {
  if (track.provider === MUSIC_PROVIDER.AUDIUS) {
    return <AudiusMediaPlayer track={track} />;
  }

  if (track.provider === MUSIC_PROVIDER.SPOTIFY) {
    return <SpotifyMediaPlayer track={track} />;
  }

  return <YouTubeMediaPlayer track={track} />;
}
