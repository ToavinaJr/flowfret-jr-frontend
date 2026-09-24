import {
  Pause,
  Play,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { usePlayback } from "@/contexts/PlaybackContext";
import { PersistentLyrics } from "@/components/features/music/PersistentLyrics";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
}

export default function PersistentMediaPlayer() {
  const { t } = useTranslation();
  const {
    item,
    playState,
    currentTime,
    duration,
    volume,
    toggle,
    seek,
    setVolume,
    queue,
    shuffle,
    setShuffle,
    next,
    previous,
  } = usePlayback();
  if (!item) return null;
  const isSpotify = item.engine === "spotify" || item.id.startsWith("spotify:");

  const content = (
    <>
      <img
        src={item.imageUrl || "/favicon.svg"}
        alt=""
        className="h-11 w-11 shrink-0 rounded-md bg-secondary object-cover"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">
          {item.title}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {item.subtitle}
        </p>
      </div>
    </>
  );

  return (
    <section
      aria-label={t("mediaPlayer.audioPlayer")}
      className="fixed bottom-[65px] left-0 right-0 z-40 border-t border-border bg-card/95 shadow-[0_-8px_24px_rgba(0,0,0,0.16)] backdrop-blur md:bottom-0 md:left-64 lg:left-72"
    >
      <div className="mx-auto flex h-[76px] max-w-5xl items-center gap-3 px-3 sm:px-5">
        {item.destination ? (
          <Link
            to={item.destination}
            className="flex min-w-0 flex-1 items-center gap-3 md:max-w-xs"
          >
            {content}
          </Link>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-3 md:max-w-xs">
            {content}
          </div>
        )}
        <button
          type="button"
          disabled={queue.length < 2}
          onClick={() => void previous()}
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary disabled:opacity-30 sm:flex"
          aria-label="Morceau précédent"
        >
          <SkipBack className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => void toggle()}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground"
          aria-label={
            playState === "playing" ? t("player.pause") : t("player.play")
          }
        >
          {playState === "playing" ? (
            <Pause className="h-5 w-5" />
          ) : (
            <Play className="ml-0.5 h-5 w-5" />
          )}
        </button>
        <button
          type="button"
          disabled={queue.length < 2}
          onClick={() => void next()}
          className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary disabled:opacity-30 sm:flex"
          aria-label="Morceau suivant"
        >
          <SkipForward className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={queue.length < 2}
          onClick={() => setShuffle(!shuffle)}
          className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-md disabled:opacity-30 md:flex ${shuffle ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
          aria-label="Lecture aléatoire"
          aria-pressed={shuffle}
        >
          <Shuffle className="h-4 w-4" />
        </button>
        <PersistentLyrics item={item} currentTime={currentTime} onSeek={seek} />
        <span className="hidden w-10 text-right text-xs text-muted-foreground sm:block">
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={Math.min(currentTime, duration || 1)}
          onChange={(event) => seek(Number(event.target.value))}
          className="hidden min-w-24 flex-1 accent-primary sm:block"
          aria-label={t("player.seek")}
        />
        <span className="hidden w-10 text-xs text-muted-foreground sm:block">
          {formatTime(duration)}
        </span>
        {!isSpotify ? (
          <>
            <button
              type="button"
              onClick={() => setVolume(volume > 0 ? 0 : 1)}
              className="hidden h-10 w-10 items-center justify-center text-muted-foreground md:flex"
              aria-label={
                volume > 0 ? t("mediaPlayer.mute") : t("mediaPlayer.unmute")
              }
            >
              {volume > 0 ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              className="hidden w-24 accent-primary lg:block"
              aria-label={t("mediaPlayer.volume")}
            />
          </>
        ) : null}
      </div>
      <input
        type="range"
        min={0}
        max={duration || 1}
        step={0.1}
        value={Math.min(currentTime, duration || 1)}
        onChange={(event) => seek(Number(event.target.value))}
        className="absolute bottom-0 left-0 h-1 w-full cursor-pointer accent-primary sm:hidden"
        aria-label={t("player.seek")}
      />
    </section>
  );
}
