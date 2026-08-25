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

export function AudiusMediaPlayer({ track }: { track: MusicTrack }) {
  const { item, playState, currentTime, toggle, seek } = usePlayback();
  const { transcription, error, prepare, retry } =
    useTranscriptionEvents(track);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const isActive = item?.id === `audius:${track.audiusId}`;
  const isPlaying = isActive && playState === "playing";
  const activeIndex = useMemo(
    () =>
      findActiveSegment(
        transcription?.segments ?? [],
        isActive ? currentTime : 0,
      ),
    [currentTime, isActive, transcription?.segments],
  );
  const playbackItem: PlaybackItem = {
    id: `audius:${track.audiusId}`,
    src: track.streamUrl,
    engine: "audio",
    title: track.title,
    subtitle: track.artists.map((artist) => artist.name).join(", "),
    imageUrl: track.imageUrl,
    duration: track.durationMs / 1000,
    destination: "/music",
  };

  async function startPlayback() {
    void toggle(playbackItem);
    setLyricsOpen(true);
    if (transcription || preparing) return;
    setPreparing(true);
    setActionError(null);
    try {
      await prepare();
    } catch (cause) {
      setActionError(
        cause instanceof Error
          ? cause.message
          : "Impossible de préparer les paroles.",
      );
    } finally {
      setPreparing(false);
    }
  }

  async function retryLyrics() {
    setPreparing(true);
    setActionError(null);
    try {
      await retry();
    } catch (cause) {
      setActionError(
        cause instanceof Error
          ? cause.message
          : "Impossible de relancer la transcription.",
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
          className="group flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-95"
          aria-label={
            isPlaying ? `Pause ${track.title}` : `Lire ${track.title}`
          }
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
          aria-label={
            lyricsOpen ? "Masquer les paroles" : "Afficher les paroles"
          }
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
          className="basis-full pt-3"
          aria-label={`Transcription de ${track.title}`}
        >
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
            <span>
              {transcription?.status === "COMPLETED"
                ? "Paroles synchronisées"
                : transcription
                  ? `Transcription ${Math.round(transcription.progress)} %`
                  : "Préparation des paroles…"}
            </span>
            <div className="flex gap-2">
              {transcription?.status === "FAILED" ? (
                <button
                  type="button"
                  disabled={preparing}
                  onClick={() => void retryLyrics()}
                  className="inline-flex min-h-9 items-center gap-1 rounded-md bg-secondary px-3 disabled:opacity-50"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Réessayer
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
                          : "Téléchargement impossible.",
                      ),
                    )
                  }
                  className="inline-flex min-h-9 items-center gap-1 rounded-md bg-secondary px-3"
                >
                  <Download className="h-3.5 w-3.5" />
                  LRC
                </button>
              ) : null}
            </div>
          </div>
          {error || actionError || transcription?.error ? (
            <p
              role="alert"
              className="mb-2 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {actionError ?? error ?? transcription?.error?.message}
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
