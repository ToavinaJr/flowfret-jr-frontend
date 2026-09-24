import type { MusicTrack } from "@/types/music";
import { MUSIC_PROVIDER } from "@/constants/domain";
import { AudiusMediaPlayer } from "./AudiusMediaPlayer";
import { SpotifyMediaPlayer } from "./SpotifyMediaPlayer";
import { YouTubeMediaPlayer } from "./YouTubeMediaPlayer";
import type { PlaybackItem } from "@/contexts/PlaybackContext";

interface MusicMediaPlayerProps {
  track: MusicTrack;
  playbackQueue: PlaybackItem[];
  queueIndex: number;
}

export function MusicMediaPlayer({
  track,
  playbackQueue,
  queueIndex,
}: MusicMediaPlayerProps) {
  if (track.provider === MUSIC_PROVIDER.AUDIUS) {
    return (
      <AudiusMediaPlayer
        track={track}
        playbackQueue={playbackQueue}
        queueIndex={queueIndex}
      />
    );
  }

  if (track.provider === MUSIC_PROVIDER.SPOTIFY) {
    return (
      <SpotifyMediaPlayer
        track={track}
        playbackQueue={playbackQueue}
        queueIndex={queueIndex}
      />
    );
  }

  return (
    <YouTubeMediaPlayer
      track={track}
      playbackQueue={playbackQueue}
      queueIndex={queueIndex}
    />
  );
}
