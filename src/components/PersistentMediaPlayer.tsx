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
  Video,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { usePlayback } from "@/contexts/usePlayback";
import { MUSIC_PROVIDER } from "@/constants/domain";
import { PersistentLyrics } from "@/components/features/music/PersistentLyrics";
import { PersistentChords } from "@/components/features/music/PersistentChords";
import { FloatingPanelWindow } from "@/components/common/FloatingPanelWindow";
import { VocalRemovalControl } from "@/components/features/music/VocalRemovalControl";
import { PracticeLoopControl } from "@/components/features/music/PracticeLoopControl";
import type { PracticeLoop } from "@/services/practiceLoop";

type PanelName = "chords" | "lyrics" | "youtube-video";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
}

function ScrollingTrackText({
  text,
  className,
}: {
  text: string;
  className: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const label = textRef.current;
    if (!container || !label) return;
    const measure = () => setOverflows(label.scrollWidth > container.clientWidth + 1);
    measure();
    const observer = typeof ResizeObserver === "undefined"
      ? null
      : new ResizeObserver(measure);
    observer?.observe(container);
    observer?.observe(label);
    window.addEventListener("resize", measure);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [text]);

  return (
    <div
      ref={containerRef}
      className={`player-track-text min-w-0 overflow-x-auto overflow-y-hidden whitespace-nowrap ${className}`}
      title={text}
    >
      <div
        className={overflows ? "media-player-marquee flex w-max" : "min-w-0"}
        style={overflows ? { animationDuration: `${Math.min(32, Math.max(8, text.length / 5))}s` } : undefined}
      >
        <span
          ref={textRef}
          className={overflows ? "shrink-0 pr-8" : "block truncate"}
        >
          {text}
        </span>
        {overflows ? (
          <span aria-hidden="true" className="shrink-0 pr-8">
            {text}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function LoopTimelineMarkers({
  loop,
  duration,
}: {
  loop: PracticeLoop;
  duration: number;
}) {
  if (!Number.isFinite(duration) || duration <= 0 || loop.start === null) return null;
  const start = Math.min(100, (loop.start / duration) * 100);
  const end = loop.end === null ? null : Math.min(100, (loop.end / duration) * 100);
  return (
    <div data-testid="practice-loop-markers" className="pointer-events-none absolute inset-x-0 top-1/2 z-20 h-3 -translate-y-1/2" aria-hidden="true">
      {end !== null && end > start ? (
        <span
          className={`absolute top-1/2 h-1 -translate-y-1/2 rounded-full ${loop.enabled ? "bg-primary" : "bg-primary/50"}`}
          style={{ left: `${start}%`, width: `${end - start}%` }}
        />
      ) : null}
      <span className="absolute top-0 h-3 w-0.5 rounded-full bg-primary" style={{ left: `${start}%` }} />
      {end !== null ? (
        <span className="absolute top-0 h-3 w-0.5 rounded-full bg-primary" style={{ left: `${end}%` }} />
      ) : null}
    </div>
  );
}

export default function PersistentMediaPlayer() {
  const { t } = useTranslation();
  const location = useLocation();
  const [openPanels, setOpenPanels] = useState<Record<PanelName, boolean>>({ chords: false, lyrics: false, "youtube-video": false });
  const [minimizedPanels, setMinimizedPanels] = useState<Record<PanelName, boolean>>({ chords: false, lyrics: false, "youtube-video": false });
  const [windowOrder, setWindowOrder] = useState({ chords: 60, lyrics: 61, "youtube-video": 62, next: 63 });
  const {
    item,
    lastEndedItemId,
    playbackEndSequence,
    playState,
    playbackError,
    currentTime,
    duration,
    volume,
    toggle,
    pause,
    seek,
    setVolume,
    queue,
    shuffle,
    setShuffle,
    next,
    previous,
    retry,
    practiceLoop,
  } = usePlayback();
  const previousItemId = useRef(item?.id ?? null);
  useEffect(() => {
    const itemChanged = previousItemId.current !== item?.id;
    previousItemId.current = item?.id ?? null;
    if (itemChanged || lastEndedItemId === item?.id) {
      setOpenPanels((current) => ({
        ...current,
        lyrics: false,
        "youtube-video": false,
      }));
    }
  }, [item?.id, lastEndedItemId, playbackEndSequence]);
  if (!item) return null;
  const isSpotify = item.engine === "spotify";
  const hasLyrics = Boolean(item.provider && item.artist?.trim());
  const hasYouTubeVideo = item.provider === MUSIC_PROVIDER.YOUTUBE && Boolean(item.providerTrackId?.trim());
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

  function openYouTubeVideo() {
    pause();
    setOpenPanels((current) => ({ ...current, "youtube-video": true }));
    setMinimizedPanels((current) => ({ ...current, "youtube-video": false }));
    focusWindow("youtube-video");
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
        <ScrollingTrackText
          text={item.title}
          className="text-sm font-semibold text-foreground"
        />
        <ScrollingTrackText
          text={item.subtitle}
          className="text-xs text-muted-foreground"
        />
      </div>
    </>
  );

  return (
    <>
      {openPanels.chords ? (
        <FloatingPanelWindow
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
        </FloatingPanelWindow>
      ) : null}
      {openPanels.lyrics && hasLyrics ? (
        <FloatingPanelWindow
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
        </FloatingPanelWindow>
      ) : null}
      {openPanels["youtube-video"] && hasYouTubeVideo ? (
        <FloatingPanelWindow
          windowId="youtube-video"
          isAdmin={isAdmin}
          title={`${t("mediaPlayer.youtubeVideo")} · ${item.title}`}
          zIndex={windowOrder["youtube-video"]}
          minimized={minimizedPanels["youtube-video"]}
          onClose={() => closePanel("youtube-video")}
          onFocus={() => focusWindow("youtube-video")}
          onMinimize={() => setMinimizedPanels((current) => ({ ...current, "youtube-video": !current["youtube-video"] }))}
        >
          <div className="aspect-video w-full bg-black">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${encodeURIComponent(item.providerTrackId ?? "")}?autoplay=1&controls=1&playsinline=1&rel=0&start=${Math.floor(currentTime)}`}
              title={`${t("mediaPlayer.youtubeVideo")} · ${item.title}`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
        </FloatingPanelWindow>
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
        {hasYouTubeVideo ? (
          <button
            type="button"
            onClick={openYouTubeVideo}
            className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-md sm:flex ${openPanels["youtube-video"] ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
            aria-label={t("mediaPlayer.showYoutubeVideo")}
            aria-expanded={openPanels["youtube-video"]}
            aria-controls="floating-media-window-youtube-video"
          >
            <Video className="h-4 w-4" />
          </button>
        ) : null}
        <PracticeLoopControl className="hidden sm:flex" />
        <VocalRemovalControl key={item.id} />
        <span className="hidden w-10 text-right text-xs text-muted-foreground sm:block">
          {formatTime(currentTime)}
        </span>
        <div className="relative hidden min-w-24 flex-1 sm:block">
          <input
            name="playbackPositionDesktop"
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={Math.min(currentTime, duration || 1)}
            onChange={(event) => seek(Number(event.target.value))}
            className="relative z-10 block w-full accent-primary"
            aria-label={t("player.seek")}
          />
          <LoopTimelineMarkers loop={practiceLoop} duration={duration} />
        </div>
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
        {hasYouTubeVideo ? (
          <button
            type="button"
            onClick={openYouTubeVideo}
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${openPanels["youtube-video"] ? "bg-primary/15 text-primary" : "text-muted-foreground"}`}
            aria-label={t("mediaPlayer.showYoutubeVideo")}
            aria-expanded={openPanels["youtube-video"]}
            aria-controls="floating-media-window-youtube-video"
          >
            <Video className="h-4 w-4" />
          </button>
        ) : null}
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
        <PracticeLoopControl className="sm:hidden" />
        <div className="relative min-w-0 flex-1">
          <input
            name="playbackPositionMobile"
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={Math.min(currentTime, duration || 1)}
            onChange={(event) => seek(Number(event.target.value))}
            className="relative z-10 block w-full accent-primary"
            aria-label={t("player.seek")}
          />
          <LoopTimelineMarkers loop={practiceLoop} duration={duration} />
        </div>
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
