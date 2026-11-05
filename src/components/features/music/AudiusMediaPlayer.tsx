import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Download,
  Flag,
  Loader2,
  Mic2,
  Pause,
  Play,
  RefreshCw,
} from "lucide-react";
import { usePlayback } from "@/contexts/usePlayback";
import type { PlaybackItem } from "@/contexts/playback-context";
import { useAuth } from "@/hooks/useAuth";
import { useTranscriptionEvents } from "@/hooks/useTranscriptionEvents";
import { useLyrics } from "@/hooks/useLyrics";
import { downloadTranscriptionLrc } from "@/services/transcriptionsApi";
import type { MusicTrack } from "@/types/music";
import type { LyricsTrack } from "@/types/lyrics";
import { findActiveSegment } from "@/utils/transcription";
import { SynchronizedLyrics } from "./SynchronizedLyrics";
import { LyricsPanel } from "./LyricsPanel";
import { ReportLyricsDialog } from "./ReportLyricsDialog";
import { InlineLyricsEditor } from "./InlineLyricsEditor";
import { useTranslation } from "react-i18next";
import {
  TRANSCRIPTION_PHASE,
  TRANSCRIPTION_STATUS,
  USER_ROLE,
} from "@/constants/domain";
import { toMusicPlaybackItem } from "./music-playback";

export function TranscriptionMediaPlayer({
  track,
  playbackQueue = [],
  queueIndex = 0,
}: {
  track: MusicTrack;
  playbackQueue?: PlaybackItem[];
  queueIndex?: number;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isAdmin = user?.role === USER_ROLE.ADMIN;
  const {
    item,
    playState,
    currentTime,
    toggle,
    seek,
    setQueue,
    lastEndedItemId,
    playbackEndSequence,
  } = usePlayback();
  const { transcription, error, prepare, retry } =
    useTranscriptionEvents(track);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [awaitingLyricsDecision, setAwaitingLyricsDecision] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const playbackItem = toMusicPlaybackItem(track);
  const isActive = item?.id === playbackItem.id;
  const isPlaying = isActive && playState === "playing";
  useEffect(() => {
    if (lastEndedItemId === playbackItem.id) setLyricsOpen(false);
  }, [lastEndedItemId, playbackEndSequence, playbackItem.id]);
  // A pre-synced lyrics database (LRCLIB) is tried before the heavier
  // YouTube-extraction + Whisper pipeline: most known tracks resolve
  // instantly from it, with no audio download or transcription needed at
  // all. Built the same way PersistentLyrics.tsx gates its own lookup -
  // artist must be present, or the underlying query never starts.
  const lyricsTrack: LyricsTrack | null = track.artists[0]?.name
    ? {
        id: track.providerTrackId,
        provider: track.provider,
        title: track.title,
        artist: track.artists[0].name,
        album: track.album ?? undefined,
        duration: track.durationMs ? track.durationMs / 1000 : undefined,
      }
    : null;
  const { lyrics, status: lyricsStatus } = useLyrics(lyricsTrack, lyricsOpen);
  // Any resolved lyrics result (LRCLIB synced, or unsynced plain text from
  // Genius/Tononkira/the LLM web-search fallback) is preferred over the
  // heavier YouTube-extraction + Whisper transcription pipeline below —
  // LyricsPanel already renders both synced and unsynced lyrics correctly.
  const hasLyrics = Boolean(lyrics);
  const activeIndex = useMemo(
    () =>
      findActiveSegment(
        transcription?.segments ?? [],
        isActive ? currentTime : 0,
      ),
    [currentTime, isActive, transcription?.segments],
  );
  async function startPlayback() {
    if (playbackQueue.length > 1) setQueue(playbackQueue, queueIndex);
    void toggle(playbackItem);
    setLyricsOpen(true);
    if (transcription || preparing) return;
    setPreparing(true);
    setActionError(null);
    try {
      await prepare();
    } catch (cause) {
      setActionError(
        cause instanceof Error ? cause.message : t("lyrics.prepareFailed"),
      );
    } finally {
      setPreparing(false);
    }
  }

  // Opening lyrics first waits for the transcription instead of starting
  // playback right away, so the song and its synchronized lyrics begin
  // together rather than playback racing ahead of a not-yet-ready transcript.
  const showLyricsThenPlay = useCallback(async () => {
    setLyricsOpen(true);
    if (transcription || preparing) return;
    setPreparing(true);
    setActionError(null);
    try {
      await prepare();
    } catch (cause) {
      setPreparing(false);
      setActionError(
        cause instanceof Error ? cause.message : t("lyrics.prepareFailed"),
      );
    }
  }, [transcription, preparing, prepare, t]);

  useEffect(() => {
    if (!preparing || !transcription) return;
    if (transcription.status === TRANSCRIPTION_STATUS.COMPLETED) {
      setPreparing(false);
      if (playbackQueue.length > 1) setQueue(playbackQueue, queueIndex);
      void toggle(playbackItem);
    } else if (transcription.status === TRANSCRIPTION_STATUS.FAILED) {
      setPreparing(false);
    }
  }, [preparing, transcription, playbackItem, playbackQueue, queueIndex, setQueue, toggle]);

  // Resolves the lyrics-first-click decision once the /api/lyrics lookup
  // settles: any match (synced or not) plays immediately, no YouTube
  // extraction or Whisper involved at all; only a genuine miss falls back
  // to the existing wait-for-Whisper-transcription flow.
  useEffect(() => {
    if (!awaitingLyricsDecision || lyricsStatus === "loading") return;
    setAwaitingLyricsDecision(false);
    if (hasLyrics) {
      if (playbackQueue.length > 1) setQueue(playbackQueue, queueIndex);
      void toggle(playbackItem);
      return;
    }
    void showLyricsThenPlay();
  }, [awaitingLyricsDecision, lyricsStatus, hasLyrics, playbackItem, playbackQueue, queueIndex, setQueue, toggle, showLyricsThenPlay]);

  async function retryTranscription() {
    setPreparing(true);
    setActionError(null);
    try {
      await retry();
    } catch (cause) {
      setActionError(
        cause instanceof Error ? cause.message : t("lyrics.retryFailed"),
      );
    } finally {
      setPreparing(false);
    }
  }

  return (
    <>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={() => void startPlayback()}
          className="group flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-[transform,background-color] hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-95"
          aria-label={t(isPlaying ? "lyrics.pauseTrack" : "lyrics.playTrack", {
            title: track.title,
          })}
        >
          {isPlaying ? (
            <Pause className="h-[18px] w-[18px]" />
          ) : (
            <Play className="ml-0.5 h-[18px] w-[18px] fill-current" />
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            if (lyricsOpen) {
              setLyricsOpen(false);
              return;
            }
            setLyricsOpen(true);
            if (hasLyrics || transcription || preparing) return;
            setAwaitingLyricsDecision(true);
          }}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-secondary text-foreground"
          aria-label={t(
            lyricsOpen
              ? "lyrics.hideTranscription"
              : "lyrics.showTranscription",
          )}
          aria-expanded={lyricsOpen}
        >
          {preparing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Mic2 className="h-4 w-4" />
          )}
        </button>
      </div>

      {lyricsOpen && hasLyrics ? (
        <section
          className="order-last w-full basis-full pt-3"
          aria-label={t("lyrics.transcriptionFor", { title: track.title })}
        >
          <div className="mb-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              {t(lyrics?.synced ? "lyrics.synchronized" : "lyrics.title")}
            </span>
            {lyrics && !lyrics.instrumental && lyricsTrack ? (
              <div className="flex items-center gap-1">
                {isAdmin ? (
                  <InlineLyricsEditor
                    track={lyricsTrack}
                    initialLines={lyrics.lines}
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => setReportOpen(true)}
                  aria-label={t("lyrics.reportLyrics")}
                  title={t("lyrics.reportLyrics")}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Flag aria-hidden="true" className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : null}
          </div>
          <LyricsPanel
            lyrics={lyrics}
            status={lyricsStatus}
            currentTime={isActive ? currentTime : 0}
            onSeek={seek}
          />
          {lyricsTrack ? (
            <ReportLyricsDialog
              provider={lyricsTrack.provider}
              trackId={lyricsTrack.id}
              title={lyricsTrack.title}
              artist={lyricsTrack.artist}
              open={reportOpen}
              onOpenChange={setReportOpen}
            />
          ) : null}
        </section>
      ) : null}

      {lyricsOpen && !hasLyrics ? (
        <section
          className="order-last w-full basis-full pt-3"
          aria-label={t("lyrics.transcriptionFor", { title: track.title })}
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              {transcription?.status === TRANSCRIPTION_STATUS.COMPLETED
                ? transcription.segments.length > 0
                  ? t("lyrics.synchronized")
                  : t("lyrics.unavailable")
                : transcription?.processingPhase ===
                    TRANSCRIPTION_PHASE.MODEL_LOADING
                  ? t("lyrics.loadingModel")
                  : transcription?.processingPhase ===
                      TRANSCRIPTION_PHASE.MODEL_READY
                    ? t("lyrics.modelReady")
                    : transcription
                      ? t("lyrics.progress", {
                          progress: Math.round(transcription.progress),
                        })
                      : t("lyrics.preparing")}
            </span>
            <div className="flex gap-2">
              {isAdmin && lyricsTrack ? (
                <InlineLyricsEditor track={lyricsTrack} initialLines={[]} />
              ) : null}
              {transcription?.status === TRANSCRIPTION_STATUS.FAILED ? (
                <button
                  type="button"
                  disabled={preparing}
                  onClick={() => void retryTranscription()}
                  className="inline-flex min-h-9 items-center gap-1 rounded-md bg-secondary px-3 disabled:opacity-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  {t("common.retry")}
                </button>
              ) : null}
              {transcription?.lrcAvailable ? (
                <button
                  type="button"
                  onClick={() =>
                    void downloadTranscriptionLrc(
                      transcription.transcriptionId,
                    ).catch((cause) =>
                      setActionError(
                        cause instanceof Error
                          ? cause.message
                          : t("lyrics.downloadFailed"),
                      ),
                    )
                  }
                  className="inline-flex min-h-9 items-center gap-1 rounded-md bg-secondary px-3"
                >
                  <Download className="h-3.5 w-3.5" />
                  {t("lyrics.downloadLrc")}
                </button>
              ) : null}
            </div>
          </div>
          {error || actionError || transcription?.error ? (
            <p
              role="alert"
              className="mb-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {actionError ??
                error ??
                (transcription?.error?.code === "AUDIO_TOO_LONG"
                  ? t("lyrics.audioTooLong")
                  : transcription?.error?.code === "YOUTUBE_AUDIO_EXTRACTION_FAILED"
                    ? t("lyrics.youtubeExtractionFailed")
                    : transcription?.error?.code === "TRANSCRIPTION_PENDING_TIMEOUT"
                      ? t("lyrics.pendingTimeout")
                    : transcription?.error?.message)}
            </p>
          ) : null}
          <SynchronizedLyrics
            segments={transcription?.segments ?? []}
            activeIndex={activeIndex}
            onSeek={seek}
            currentTime={isActive ? currentTime : undefined}
          />
        </section>
      ) : null}
    </>
  );
}

export function AudiusMediaPlayer({
  track,
  playbackQueue,
  queueIndex,
}: {
  track: MusicTrack;
  playbackQueue?: PlaybackItem[];
  queueIndex?: number;
}) {
  return (
    <TranscriptionMediaPlayer
      track={track}
      playbackQueue={playbackQueue}
      queueIndex={queueIndex}
    />
  );
}
