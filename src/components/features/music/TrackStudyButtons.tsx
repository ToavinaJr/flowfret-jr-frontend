import { Guitar, Video } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePlayback } from "@/contexts/usePlayback";
import type { PlaybackItem } from "@/contexts/PlaybackContext";
import { MUSIC_PROVIDER } from "@/constants/domain";
import type { MusicTrack } from "@/types/music";
import { toMusicPlaybackItem } from "./music-playback";
import { requestMediaPanel } from "./media-panel-events";

export function TrackStudyButtons({
  track,
  playbackQueue,
  queueIndex,
}: {
  track: MusicTrack;
  playbackQueue: PlaybackItem[];
  queueIndex: number;
}) {
  const { t } = useTranslation();
  const { select, setQueue } = usePlayback();
  const playbackItem = toMusicPlaybackItem(track);

  function openPanel(panel: "chords" | "youtube-video") {
    if (playbackQueue.length > 1) setQueue(playbackQueue, queueIndex);
    select(playbackItem);
    requestMediaPanel(panel);
  }

  const buttonClassName =
    "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-secondary text-foreground transition-colors hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <>
      <button
        type="button"
        onClick={() => openPanel("chords")}
        className={buttonClassName}
        aria-label={t("chordPlayer.openTrack", { title: track.title })}
        title={t("chordPlayer.open")}
      >
        <Guitar className="h-4 w-4" aria-hidden="true" />
      </button>
      {track.provider === MUSIC_PROVIDER.YOUTUBE ? (
        <button
          type="button"
          onClick={() => openPanel("youtube-video")}
          className={buttonClassName}
          aria-label={t("mediaPlayer.showYoutubeVideoFor", { title: track.title })}
          title={t("mediaPlayer.youtubeVideo")}
        >
          <Video className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}
    </>
  );
}
