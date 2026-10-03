import { useMemo, useState } from "react";
import {
  Download,
  FileText,
  Loader2,
  Pause,
  Play,
  RefreshCw,
} from "lucide-react";
import { usePlayback, type PlaybackItem } from "@/contexts/PlaybackContext";
import { useTranscriptionEvents } from "@/hooks/useTranscriptionEvents";
import { downloadTranscriptionLrc } from "@/services/transcriptionsApi";
import type { MusicTrack } from "@/types/music";
import { findActiveSegment } from "@/utils/transcription";
import { SynchronizedLyrics } from "./SynchronizedLyrics";
import { useTranslation } from "react-i18next";
import { TRANSCRIPTION_PHASE, TRANSCRIPTION_STATUS } from "@/constants/domain";
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
  const { item, playState, currentTime, toggle, seek, setQueue } = usePlayback();
  const { transcription, error, prepare, retry } =
    useTranscriptionEvents(track);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const playbackItem = toMusicPlaybackItem(track);
  const isActive = item?.id === playbackItem.id;
  const isPlaying = isActive && playState === "playing";
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
            setLyricsOpen((open) => !open);
            if (!transcription && !preparing) void startPlayback();
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
            <FileText className="h-4 w-4" />
          )}
        </button>
      </div>

      {lyricsOpen ? (
        <section
          className="order-last w-full basis-full pt-3"
          aria-label={t("lyrics.transcriptionFor", { title: track.title })}
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              {transcription?.status === TRANSCRIPTION_STATUS.COMPLETED
                ? t("lyrics.synchronized")
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
