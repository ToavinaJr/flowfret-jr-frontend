import { Pause, Play } from "lucide-react";
import { usePlayback, type PlaybackItem } from "@/contexts/PlaybackContext";
import type { MusicTrack } from "@/types/music";

export function AudiusMediaPlayer({ track }: { track: MusicTrack }) {
  const { item, playState, toggle } = usePlayback();
  const isActive = item?.id === `audius:${track.audiusId}`;
  const isPlaying = isActive && playState === "playing";
  const playbackItem: PlaybackItem = {
    id: `audius:${track.audiusId}`,
    src: track.streamUrl,
    title: track.title,
    subtitle: track.artists.map((artist) => artist.name).join(", "),
    imageUrl: track.imageUrl,
    duration: track.durationMs / 1000,
    destination: "/music",
  };

  return (
    <button type="button" onClick={() => void toggle(playbackItem)} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90" aria-label={isPlaying ? `Pause ${track.title}` : `Lire ${track.title}`}>
      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      {isPlaying ? "Pause" : isActive ? "Reprendre" : "Écouter"}
    </button>
  );
}
