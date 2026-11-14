import {
  Guitar,
  Heart,
  ListPlus,
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
import { useQuery } from "@tanstack/react-query";
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
import { OPEN_MEDIA_PANEL_EVENT, type MediaPanelRequest } from "@/components/features/music/media-panel-events";
import { ScrollingTrackText } from "@/components/common/ScrollingTrackText";
import { fetchRuntimeFeatures } from "@/services/runtimeFeaturesApi";
import { RepeatControl } from "@/components/features/music/RepeatControl";
import { SleepTimerControl } from "@/components/features/music/SleepTimerControl";
import { FavoriteTrackButton } from "@/components/features/music/FavoriteTrackButton";
import type { MusicTrack } from "@/types/music";
import type { PlaylistTrack } from "@/types/playlist";
import { AddToPlaylistButton } from "@/components/features/playlists/AddToPlaylistButton";
import { QueueDialog } from "@/components/features/music/QueueDialog";

type PanelName = "chords" | "lyrics" | "youtube-video";

const ICON_BUTTON =
  "flex size-9 shrink-0 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-30";
const TRACK_CLASS = "flex min-w-0 flex-1 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

function toneClass(active: boolean): string {
  return active
    ? "bg-primary/15 text-primary"
    : "text-muted-foreground hover:bg-secondary hover:text-foreground";
}

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
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
  const { data: runtimeFeatures } = useQuery({
    queryKey: ["runtime-features"],
    queryFn: fetchRuntimeFeatures,
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  });
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
    play,
    pause,
    seek,
    setVolume,
    queue,
    currentIndex,
    shuffle,
    setShuffle,
    next,
    previous,
    retry,
    practiceLoop,
    removeQueueItem,
    moveQueueItem,
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
  useEffect(() => {
    const handleOpenPanel = (event: Event) => {
      const panel = (event as CustomEvent<MediaPanelRequest>).detail;
      setOpenPanels((current) => ({ ...current, [panel]: true }));
      setMinimizedPanels((current) => ({ ...current, [panel]: false }));
      setWindowOrder((current) => ({ ...current, [panel]: current.next, next: current.next + 1 }));
    };
    window.addEventListener(OPEN_MEDIA_PANEL_EVENT, handleOpenPanel);
    return () => window.removeEventListener(OPEN_MEDIA_PANEL_EVENT, handleOpenPanel);
  }, [item?.provider]);
  if (!item) return null;
  const isSpotify = item.engine === "spotify";
  const hasProviderTrack = Boolean(item.provider && item.providerTrackId);
  const trackExternalUrl = hasProviderTrack
    ? item.externalUrl ?? (item.provider === MUSIC_PROVIDER.YOUTUBE
      ? `https://www.youtube.com/watch?v=${encodeURIComponent(item.providerTrackId ?? "")}`
      : item.provider === MUSIC_PROVIDER.SPOTIFY
        ? `https://open.spotify.com/track/${encodeURIComponent(item.providerTrackId ?? "")}`
        : undefined)
    : undefined;
  const httpsExternalUrl = trackExternalUrl?.startsWith("https://") ? trackExternalUrl : undefined;
  // YouTube replays by id and Spotify embeds use streamUrl === externalUrl, so the page URL is a valid stream reference for them.
  const httpsStreamUrl = item.streamUrl?.startsWith("https://")
    ? item.streamUrl
    : item.provider === MUSIC_PROVIDER.YOUTUBE || item.provider === MUSIC_PROVIDER.SPOTIFY
      ? httpsExternalUrl
      : undefined;
  const trackArtists = item.artists?.length ? item.artists : [{ id: "unknown", name: item.artist || item.subtitle }];
  const favoriteTrack: MusicTrack | null = item.provider && item.providerTrackId && httpsExternalUrl && httpsStreamUrl
    ? {
        provider: item.provider,
        id: item.providerTrackId,
        providerTrackId: item.providerTrackId,
        audiusId: item.providerTrackId,
        title: item.title,
        artists: trackArtists,
        imageUrl: item.imageUrl ?? null,
        audiusUrl: httpsExternalUrl,
        externalUrl: httpsExternalUrl,
        album: item.album ?? null,
        isrc: item.isrc ?? null,
        streamUrl: httpsStreamUrl,
        genre: item.genre ?? null,
        geniusUrl: null,
        geniusMatchScore: null,
        durationMs: Math.max(0, Math.round((item.duration ?? 0) * 1000)),
      }
    : null;
  const playlistTrack: PlaylistTrack | null = item.provider && item.providerTrackId
    ? {
        id: `${item.provider}:${item.providerTrackId}`,
        provider: item.provider,
        providerTrackId: item.providerTrackId,
        title: item.title,
        artists: trackArtists,
        album: item.album ?? null,
        genre: item.genre ?? null,
        imageUrl: item.imageUrl ?? null,
        externalUrl: trackExternalUrl ?? item.src,
        durationMs: Math.max(0, Math.round((item.duration ?? 0) * 1000)),
        isrc: item.isrc ?? null,
      }
    : null;
  const hasLyrics = Boolean(item.provider && item.artist?.trim());
  const hasYouTubeVideo = item.provider === MUSIC_PROVIDER.YOUTUBE && Boolean(item.providerTrackId?.trim());
  const isAdmin = location.pathname.startsWith("/admin");
  // Standalone pages (shared playlist) render outside AppLayout: no sidebar, no bottom navigation.
  const isStandalone = location.pathname.startsWith("/shared-playlist/");

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
        key={item.id}
        src={item.imageUrl || "/favicon.svg"}
        onError={(event) => {
          const image = event.currentTarget;
          if (image.dataset.fallback !== "true") {
            image.dataset.fallback = "true";
            image.src = "/favicon.svg";
          }
        }}
        alt=""
        className="block size-10 shrink-0 aspect-square rounded-md bg-secondary object-cover shadow-sm sm:size-11 xl:size-14"
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

  const hasStudyTools = Boolean(
    runtimeFeatures?.chordTranscription ||
      hasLyrics ||
      hasYouTubeVideo ||
      runtimeFeatures?.equalizerTranscription,
  );
  const unavailable = t("mediaPlayer.trackActionUnavailable");
  const favoriteControl = favoriteTrack
    ? <FavoriteTrackButton track={favoriteTrack} className="!h-9 !w-9" />
    : <button type="button" disabled className={`${ICON_BUTTON} ${toneClass(false)}`} aria-label={`${t("favorites.add")} (${unavailable})`} title={`${t("favorites.add")} (${unavailable})`}><Heart className="size-4" aria-hidden="true" /></button>;
  const playlistControl = playlistTrack
    ? <AddToPlaylistButton track={playlistTrack} compact />
    : <button type="button" disabled className={`${ICON_BUTTON} ${toneClass(false)}`} aria-label={`${t("playlists.addToPlaylist")} (${unavailable})`} title={`${t("playlists.addToPlaylist")} (${unavailable})`}><ListPlus className="size-4" aria-hidden="true" /></button>;

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
        className={`fixed z-40 border-t border-border bg-card/95 shadow-[0_-4px_16px_-8px_hsl(var(--foreground)/0.15)] backdrop-blur supports-[backdrop-filter]:bg-card/85 ${isStandalone ? "bottom-0 left-0 right-0" : isAdmin ? "bottom-0 left-0 right-0 md:left-64" : "bottom-[var(--mobile-nav-offset)] left-0 right-0 md:bottom-0 md:left-[var(--app-sidebar-width-md)] lg:left-[var(--app-sidebar-width-lg)]"}`}
      >
        {/*
          Every control is visible at every width; only the arrangement changes.
          - mobile:  track / progress / transport / [tools · output]
          - tablet:  [track · transport] / progress / [tools · output]
          - desktop: [track | transport · progress | tools · output]
        */}
        <div className="mx-auto grid w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 px-3 py-2 [grid-template-areas:'track_track'_'transport_transport'_'progress_progress'_'tools_output'] sm:px-5 sm:[grid-template-areas:'track_transport'_'progress_progress'_'tools_output'] xl:h-24 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1.35fr)_minmax(14rem,1fr)] xl:grid-rows-2 xl:gap-x-6 xl:gap-y-0 xl:[grid-template-areas:'track_transport_tools'_'track_progress_output']">
          <div className="flex min-w-0 items-center gap-1 [grid-area:track] xl:gap-2">
            {item.destination ? (
              <Link to={item.destination} className={TRACK_CLASS}>
                {content}
              </Link>
            ) : (
              <div className={TRACK_CLASS}>{content}</div>
            )}
            <div role="group" aria-label={t("mediaPlayer.groupTrack")} className="flex shrink-0 items-center gap-0.5">
              {favoriteControl}
              {playlistControl}
            </div>
          </div>

          <div
            role="group"
            aria-label={t("mediaPlayer.groupTransport")}
            className="flex items-center justify-center gap-3 [grid-area:transport] sm:justify-end sm:gap-1 xl:justify-center xl:gap-2"
          >
            <button type="button" disabled={queue.length < 2} onClick={() => setShuffle(!shuffle)} className={`${ICON_BUTTON} ${toneClass(shuffle)}`} aria-label={t("mediaPlayer.shuffle")} title={t("mediaPlayer.shuffle")} aria-pressed={shuffle}><Shuffle className="size-4" /></button>
            <button type="button" disabled={queue.length < 2} onClick={() => void previous()} className={`${ICON_BUTTON} ${toneClass(false)}`} aria-label={t("mediaPlayer.previous")} title={t("mediaPlayer.previous")}><SkipBack className="size-4" /></button>
            <button type="button" onClick={() => void toggle()} className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card motion-reduce:hover:scale-100" aria-label={playState === "playing" ? t("player.pause") : t("player.play")} title={playState === "playing" ? t("player.pause") : t("player.play")}>{playState === "playing" ? <Pause className="size-5" /> : <Play className="ml-0.5 size-5" />}</button>
            <button type="button" disabled={queue.length < 2} onClick={() => void next()} className={`${ICON_BUTTON} ${toneClass(false)}`} aria-label={t("mediaPlayer.next")} title={t("mediaPlayer.next")}><SkipForward className="size-4" /></button>
            <RepeatControl />
          </div>

          <div className="flex min-w-0 items-center gap-2 [grid-area:progress]">
            <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground" aria-label={t("mediaPlayer.timeElapsed")}>{formatTime(currentTime)}</span>
            <div className="relative min-w-0 flex-1">
              <input name="playbackPosition" type="range" min={0} max={duration || 1} step={0.1} value={Math.min(currentTime, duration || 1)} onChange={(event) => seek(Number(event.target.value))} className="relative z-10 block w-full accent-primary" aria-label={t("player.seek")} title={t("player.seek")} />
              <LoopTimelineMarkers loop={practiceLoop} duration={duration} />
            </div>
            <span className="flex shrink-0 items-center gap-1.5 text-[11px] tabular-nums text-muted-foreground">
              <span aria-label={t("mediaPlayer.timeRemaining")}>-{formatTime(Math.max(0, duration - currentTime))}</span>
              <span aria-hidden="true" className="text-border">/</span>
              <span aria-label={t("mediaPlayer.totalDuration")}>{formatTime(duration)}</span>
            </span>
            <PracticeLoopControl className="shrink-0" />
          </div>

          <div className="flex min-w-0 items-center gap-0.5 [grid-area:tools] xl:justify-end">
            {hasStudyTools ? (
              <>
                <div role="group" aria-label={t("mediaPlayer.groupStudy")} className="flex shrink-0 items-center gap-0.5">
                  {runtimeFeatures?.chordTranscription ? <button type="button" onClick={() => togglePanel("chords")} className={`${ICON_BUTTON} ${toneClass(openPanels.chords)}`} aria-label={t(openPanels.chords ? "chordPlayer.close" : "chordPlayer.open")} title={t(openPanels.chords ? "chordPlayer.close" : "chordPlayer.open")} aria-expanded={openPanels.chords} aria-controls="floating-media-window-chords"><Guitar className="size-4" /></button> : null}
                  {hasLyrics ? <button type="button" onClick={() => togglePanel("lyrics")} className={`${ICON_BUTTON} ${toneClass(openPanels.lyrics)}`} aria-label={t(openPanels.lyrics ? "lyrics.close" : "lyrics.open")} title={t(openPanels.lyrics ? "lyrics.close" : "lyrics.open")} aria-expanded={openPanels.lyrics} aria-controls="floating-media-window-lyrics"><Mic2 className="size-4" /></button> : null}
                  {hasYouTubeVideo ? <button type="button" onClick={openYouTubeVideo} className={`${ICON_BUTTON} ${toneClass(openPanels["youtube-video"])}`} aria-label={t("mediaPlayer.showYoutubeVideo")} title={t("mediaPlayer.showYoutubeVideo")} aria-expanded={openPanels["youtube-video"]} aria-controls="floating-media-window-youtube-video"><Video className="size-4" /></button> : null}
                  {runtimeFeatures?.equalizerTranscription ? <VocalRemovalControl key={item.id} /> : null}
                </div>
                <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-border" />
              </>
            ) : null}
            <QueueDialog queue={queue} currentIndex={currentIndex} onPlay={(index) => { const selected = queue[index]; if (selected) void play(selected); }} onRemove={removeQueueItem} onMove={moveQueueItem} compact />
          </div>

          <div className="flex min-w-0 items-center justify-end gap-0.5 [grid-area:output]">
            <SleepTimerControl iconOnly />
            {!isSpotify ? (
              <div role="group" aria-label={t("mediaPlayer.volume")} className="flex min-w-0 items-center gap-1">
                <button type="button" onClick={() => setVolume(volume > 0 ? 0 : 1)} className={`${ICON_BUTTON} ${toneClass(false)}`} aria-label={volume > 0 ? t("mediaPlayer.mute") : t("mediaPlayer.unmute")} title={volume > 0 ? t("mediaPlayer.mute") : t("mediaPlayer.unmute")}>{volume > 0 ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}</button>
                <input name="playbackVolume" type="range" min={0} max={1} step={0.05} value={volume} onChange={(event) => setVolume(Number(event.target.value))} className="hidden w-24 min-w-0 accent-primary sm:block xl:w-auto xl:flex-1" aria-label={t("mediaPlayer.volume")} title={t("mediaPlayer.volume")} />
              </div>
            ) : null}
          </div>
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
