import { Pause, Play } from "lucide-react";
import { usePlayback } from "@/contexts/usePlayback";
import type { PlaybackItem } from "@/contexts/playback-context";
import type { MusicTrack } from "@/types/music";
import { toMusicPlaybackItem } from "./music-playback";
import { useTranslation } from "react-i18next";

interface RemoteMediaPlayerProps {
  track: MusicTrack;
  playbackQueue: PlaybackItem[];
  queueIndex: number;
}

export function RemoteMediaPlayer({
  track,
  playbackQueue,
  queueIndex,
}: RemoteMediaPlayerProps) {
  const { t } = useTranslation();
  const { item, playState, toggle, setQueue } = usePlayback();
  const playbackItem = toMusicPlaybackItem(track);
  const isPlaying = item?.id === playbackItem.id && playState === "playing";

  function toggleFromQueue() {
    if (playbackQueue.length > 0) setQueue(playbackQueue, queueIndex);
    void toggle(playbackItem);
  }

  return (
    <button
      type="button"
      onClick={toggleFromQueue}
      className={`group flex h-11 w-11 shrink-0 items-center justify-center rounded-full shadow-md transition-[transform,background-color,color] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-95 ${isPlaying ? "border border-primary/40 bg-secondary text-primary shadow-none hover:bg-secondary/80" : "bg-primary text-primary-foreground shadow-primary/20 hover:bg-primary/90"}`}
      aria-label={t(isPlaying ? "lyrics.pauseTrack" : "lyrics.playTrack", {
        title: track.title,
      })}
      aria-pressed={isPlaying}
    >
      {isPlaying ? (
        <Pause className="h-[18px] w-[18px]" />
      ) : (
        <Play className="ml-0.5 h-[18px] w-[18px] fill-current" />
      )}
    </button>
  );
}
