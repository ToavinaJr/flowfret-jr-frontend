import { useEffect, useState } from "react";
import { Flag, Link2, Mic2, Pause, Play } from "lucide-react";
import { usePlayback } from "@/contexts/usePlayback";
import type { PlaybackItem } from "@/contexts/playback-context";
import { useAuth } from "@/hooks/useAuth";
import { useLyrics } from "@/hooks/useLyrics";
import type { MusicTrack } from "@/types/music";
import type { LyricsTrack } from "@/types/lyrics";
import { LyricsPanel } from "./LyricsPanel";
import { ReportLyricsDialog } from "./ReportLyricsDialog";
import { InlineLyricsEditor } from "./InlineLyricsEditor";
import { useTranslation } from "react-i18next";
import { USER_ROLE } from "@/constants/domain";
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
    play,
    pause,
    toggle,
    seek,
    setQueue,
    lastEndedItemId,
    playbackEndSequence,
  } = usePlayback();
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const playbackItem = toMusicPlaybackItem(track);
  const isActive = item?.id === playbackItem.id;
  const isPlaying = isActive && playState === "playing";
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
  // Resolve lyrics before exposing the lyrics control. A missing result must
  // never fall through to an audio download and Whisper transcription.
  const { lyrics, status: lyricsStatus } = useLyrics(lyricsTrack);
  const hasLyrics = Boolean(lyrics);
  const isSyncing = Boolean(lyrics?.synced && isActive && isPlaying);
  useEffect(() => {
    if (lastEndedItemId === playbackItem.id) setLyricsOpen(false);
  }, [lastEndedItemId, playbackEndSequence, playbackItem.id]);
  function startPlayback() {
    if (playbackQueue.length > 0) setQueue(playbackQueue, queueIndex);
    void toggle(playbackItem);
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
        {lyricsStatus === "success" && hasLyrics ? (
          <button
            type="button"
            onClick={() => setLyricsOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-secondary text-foreground"
            aria-label={t(
              lyricsOpen
                ? "lyrics.hideTranscription"
                : "lyrics.showTranscription",
            )}
            aria-expanded={lyricsOpen}
          >
            <Mic2 className="h-4 w-4" />
          </button>
        ) : null}
        {lyricsStatus === "success" && lyrics?.synced ? (
          <button
            type="button"
            onClick={() => {
              if (isSyncing) {
                pause();
                return;
              }
              setLyricsOpen(true);
              void play(playbackItem);
            }}
            className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
              isSyncing
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-secondary text-foreground"
            }`}
            aria-label={t(
              isSyncing ? "lyrics.stopSync" : "lyrics.startSync",
            )}
            aria-pressed={isSyncing}
            title={t(isSyncing ? "lyrics.stopSync" : "lyrics.startSync")}
          >
            <Link2 className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
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
                    currentTime={currentTime}
                    isPlaying={isPlaying}
                    onTogglePlayback={() => void toggle(playbackItem)}
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
