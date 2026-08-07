import type { MusicTrack } from "@/types/music";
import { AudiusMediaPlayer } from "./AudiusMediaPlayer";
import { EmbeddedMediaPlayer } from "./EmbeddedMediaPlayer";

export function MusicMediaPlayer({ track }: { track: MusicTrack }) {
  if (track.provider === "AUDIUS") {
    return <AudiusMediaPlayer track={track} />;
  }

  return <EmbeddedMediaPlayer track={track} />;
}
