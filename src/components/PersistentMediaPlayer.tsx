import {
  Guitar,
  Mic2,
  Pause,
  Play,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { usePlayback } from "@/contexts/usePlayback";
import { PersistentLyrics } from "@/components/features/music/PersistentLyrics";
import { PersistentChords } from "@/components/features/music/PersistentChords";
import { FloatingMediaWindow } from "@/components/features/music/FloatingMediaWindow";
import { VocalRemovalControl } from "@/components/features/music/VocalRemovalControl";

type PanelName = "chords" | "lyrics";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
}

export default function PersistentMediaPlayer() {
  const { t } = useTranslation();
  const location = useLocation();
  const [openPanels, setOpenPanels] = useState<Record<PanelName, boolean>>({ chords: false, lyrics: false });
  const [minimizedPanels, setMinimizedPanels] = useState<Record<PanelName, boolean>>({ chords: false, lyrics: false });
  const [windowOrder, setWindowOrder] = useState({ chords: 60, lyrics: 61, next: 62 });
  const {
    item,
    playState,
    playbackError,
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
    retry,
  } = usePlayback();
  if (!item) return null;
  const isSpotify = item.engine === "spotify";
  const hasLyrics = Boolean(item.provider && item.artist?.trim());
  const isAdmin = location.pathname.startsWith("/admin");

  function togglePanel(panel: PanelName) {
    if (openPanels[panel] && minimizedPanels[panel]) {
      setMinimizedPanels((current) => ({ ...current, [panel]: false }));
      focusWindow(panel);
      return;
    }
    setOpenPanels((current) => ({ ...current, [panel]: !current[panel] }));
    setMinimizedPanels((current) => ({ ...current, [panel]: false }));
  }

  function closePanel(panel: PanelName) {
    setOpenPanels((current) => ({ ...current, [panel]: false }));
  }

  function focusWindow(panel: PanelName) {
    setWindowOrder((current) => ({ ...current, [panel]: current.next, next: current.next + 1 }));
  }

  const content = (
    <>
      <img
        src={item.imageUrl || "/favicon.svg"}
        alt=""
        className="h-10 w-10 shrink-0 rounded-md bg-secondary object-cover sm:h-11 sm:w-11"
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
    <>
      {openPanels.chords ? (
        <FloatingMediaWindow
          windowId="chords"
          isAdmin={isAdmin}
          title={`${t("chordPlayer.title")} · ${item.title}`}
          zIndex={windowOrder.chords}
          minimized={minimizedPanels.chords}
          onClose={() => closePanel("chords")}
          onFocus={() => focusWindow("chords")}
          onMinimize={() => setMinimizedPanels((current) => ({ ...current, chords: !current.chords }))}
        >
          <PersistentChords item={item} currentTime={currentTime} onSeek={seek} />
        </FloatingMediaWindow>
      ) : null}
      {openPanels.lyrics && hasLyrics ? (
        <FloatingMediaWindow
          windowId="lyrics"
          isAdmin={isAdmin}
          title={`${t("lyrics.title")} · ${item.title}`}
          zIndex={windowOrder.lyrics}
          minimized={minimizedPanels.lyrics}
          onClose={() => closePanel("lyrics")}
          onFocus={() => focusWindow("lyrics")}
          onMinimize={() => setMinimizedPanels((current) => ({ ...current, lyrics: !current.lyrics }))}
        >
          <PersistentLyrics item={item} currentTime={currentTime} onSeek={seek} />
        </FloatingMediaWindow>
      ) : null}
      <section
      aria-label={t("mediaPlayer.audioPlayer")}
      className={`fixed z-40 border-t border-border bg-card ${isAdmin ? "bottom-0 left-0 right-0 md:left-64" : "bottom-[var(--mobile-nav-offset)] left-0 right-0 md:bottom-0 md:left-[var(--app-sidebar-width-md)] lg:left-[var(--app-sidebar-width-lg)]"}`}
    >
      <div className="mx-auto flex h-[68px] max-w-5xl items-center gap-1.5 px-2 sm:h-[76px] sm:gap-3 sm:px-5">
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
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary disabled:opacity-30 sm:h-10 sm:w-10"
          aria-label={t("mediaPlayer.previous")}
        >
          <SkipBack className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => void toggle()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground sm:h-11 sm:w-11"
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
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary disabled:opacity-30 sm:h-10 sm:w-10"
          aria-label={t("mediaPlayer.next")}
        >
          <SkipForward className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={queue.length < 2}
          onClick={() => setShuffle(!shuffle)}
          className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-md disabled:opacity-30 sm:flex sm:h-10 sm:w-10 ${shuffle ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
          aria-label={t("mediaPlayer.shuffle")}
          aria-pressed={shuffle}
        >
          <Shuffle className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => togglePanel("chords")}
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${openPanels.chords ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
          aria-label={t(openPanels.chords ? "chordPlayer.close" : "chordPlayer.open")}
          aria-expanded={openPanels.chords}
          aria-controls="floating-media-window-chords"
        >
          <Guitar className="h-5 w-5" />
        </button>
        {hasLyrics ? (
          <button
            type="button"
            onClick={() => togglePanel("lyrics")}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${openPanels.lyrics ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
            aria-label={t(openPanels.lyrics ? "lyrics.close" : "lyrics.open")}
            aria-expanded={openPanels.lyrics}
            aria-controls="floating-media-window-lyrics"
          >
            <Mic2 className="h-4 w-4" />
          </button>
        ) : null}
        <VocalRemovalControl key={item.id} />
        <span className="hidden w-10 text-right text-xs text-muted-foreground sm:block">
          {formatTime(currentTime)}
        </span>
        <input
          name="playbackPositionDesktop"
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
              name="playbackVolumeDesktop"
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
      <div className="flex h-10 items-center gap-1.5 border-t border-border/70 px-2 sm:hidden">
        <button
          type="button"
          disabled={queue.length < 2}
          onClick={() => setShuffle(!shuffle)}
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md disabled:opacity-30 ${shuffle ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
          aria-label={t("mediaPlayer.shuffle")}
          aria-pressed={shuffle}
        >
          <Shuffle className="h-4 w-4" />
        </button>
        <input
          name="playbackPositionMobile"
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={Math.min(currentTime, duration || 1)}
          onChange={(event) => seek(Number(event.target.value))}
          className="min-w-0 flex-1 accent-primary"
          aria-label={t("player.seek")}
        />
        {!isSpotify ? (
          <>
            <button
              type="button"
              onClick={() => setVolume(volume > 0 ? 0 : 1)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground"
              aria-label={
                volume > 0 ? t("mediaPlayer.mute") : t("mediaPlayer.unmute")
              }
            >
              {volume > 0 ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </button>
            <input
              name="playbackVolumeMobile"
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(event) => setVolume(Number(event.target.value))}
              className="w-16 shrink-0 accent-primary min-[390px]:w-20"
              aria-label={t("mediaPlayer.volume")}
            />
          </>
        ) : null}
      </div>
      {playState === "error" ? (
        <div
          className="flex items-center justify-between gap-3 border-t border-destructive/20 bg-destructive/10 px-3 py-2 text-xs text-destructive sm:px-5"
          role="alert"
        >
          <span>
            {playbackError === "AUDIO_UNAVAILABLE"
              ? t("player.audioError")
              : playbackError === "PLAYBACK_BLOCKED"
                ? t("player.playbackBlocked")
                : t("player.providerError")}
          </span>
          <button
            type="button"
            onClick={() => void retry()}
            className="shrink-0 rounded-md bg-destructive/15 px-2.5 py-1 font-medium hover:bg-destructive/25"
          >
            {t("player.retryPlayback")}
          </button>
        </div>
      ) : null}
      </section>
    </>
  );
}
