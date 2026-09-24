import { Pause, Play } from "lucide-react";
import { usePlayback, type PlaybackItem } from "@/contexts/PlaybackContext";
import type { MusicTrack } from "@/types/music";

interface RemoteMediaPlayerProps {
  track: MusicTrack;
  engine: "spotify" | "youtube";
  source: string;
}

export function RemoteMediaPlayer({
  track,
  engine,
  source,
}: RemoteMediaPlayerProps) {
  const { item, playState, toggle } = usePlayback();
  const id = `${engine}:${track.providerTrackId}`;
  const isPlaying = item?.id === id && playState === "playing";
  const playbackItem: PlaybackItem = {
    id,
    src: source,
    engine,
    title: track.title,
    subtitle: track.artists.map((artist) => artist.name).join(", "),
    imageUrl: track.imageUrl,
    duration: track.durationMs / 1000,
    destination: "/music",
    provider: track.provider,
    artist: track.artists[0]?.name ?? "",
    album: track.album,
  };

  return (
    <button
      type="button"
      onClick={() => void toggle(playbackItem)}
      className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-95"
      aria-label={isPlaying ? `Pause ${track.title}` : `Lire ${track.title}`}
    >
      {isPlaying ? (
        <Pause className="h-[18px] w-[18px]" />
      ) : (
        <Play className="ml-0.5 h-[18px] w-[18px] fill-current" />
      )}
    </button>
  );
}
