import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MusicTrack } from "@/types/music";

interface AudiusMediaPlayerProps {
  track: MusicTrack;
}

const PLAY_EVENT = "fretflow:audius-play";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0")}`;
}

export function AudiusMediaPlayer({ track }: AudiusMediaPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRetryRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(track.durationMs / 1000);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [streamUrl, setStreamUrl] = useState(track.streamUrl);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  useEffect(() => {
    streamRetryRef.current = 0;
    setStreamUrl(track.streamUrl);
    setCurrentTime(0);
    setPlaying(false);
    setPlaybackError(null);
  }, [track.audiusId, track.streamUrl]);

  useEffect(() => {
    const stopOther = (event: Event) => {
      if ((event as CustomEvent<string>).detail === track.audiusId) return;
      audioRef.current?.pause();
      setPlaying(false);
    };
    window.addEventListener(PLAY_EVENT, stopOther);
    return () => window.removeEventListener(PLAY_EVENT, stopOther);
  }, [track.audiusId]);

  async function toggle(): Promise<void> {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      window.dispatchEvent(
        new CustomEvent(PLAY_EVENT, { detail: track.audiusId }),
      );
      await audio.play();
      setPlaying(true);
      setPlaybackError(null);
    } catch (error) {
      console.error("[FretFlow:player] playback_start_failed", {
        trackId: track.audiusId,
        error,
      });
      setPlaying(false);
      setPlaybackError("La lecture est temporairement indisponible.");
    }
  }

  function handleAudioError(): void {
    const mediaError = audioRef.current?.error;
    console.error("[FretFlow:player] audio_error", {
      trackId: track.audiusId,
      retry: streamRetryRef.current,
      mediaErrorCode: mediaError?.code,
      mediaErrorMessage: mediaError?.message,
      networkState: audioRef.current?.networkState,
      readyState: audioRef.current?.readyState,
      streamHost: new URL(streamUrl).hostname,
    });
    if (streamRetryRef.current < 2) {
      streamRetryRef.current += 1;
      const separator = track.streamUrl.includes("?") ? "&" : "?";
      setStreamUrl(`${track.streamUrl}${separator}retry=${Date.now()}`);
      return;
    }
    setPlaying(false);
    setPlaybackError("Ce morceau ne peut pas être chargé pour le moment.");
  }

  function seek(seconds: number): void {
    if (!audioRef.current) return;
    audioRef.current.currentTime = seconds;
    setCurrentTime(seconds);
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-secondary/40 p-3">
      <audio
        ref={audioRef}
        src={streamUrl}
        preload="metadata"
        muted={muted}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => {
          streamRetryRef.current = 0;
          setDuration(event.currentTarget.duration || duration);
        }}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={handleAudioError}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
          onClick={() => void toggle()}
          aria-label={playing ? "Pause" : "Lecture"}
        >
          {playing ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="ml-0.5 h-4 w-4" />
          )}
        </Button>

        <span className="w-9 text-right text-xs text-muted-foreground">
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={Math.min(currentTime, duration || 1)}
          onChange={(event) => seek(Number(event.target.value))}
          className="min-w-28 flex-1 accent-primary"
          aria-label="Position de lecture"
        />
        <span className="w-9 text-xs text-muted-foreground">
          {formatTime(duration)}
        </span>

        <Button
          type="button"
          size="icon"
          className="h-10 w-10 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => setMuted((value) => !value)}
          aria-label={muted ? "Activer le son" : "Couper le son"}
        >
          {muted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (audioRef.current) audioRef.current.volume = next;
            setVolume(next);
          }}
          className="min-w-24 flex-1 accent-primary sm:max-w-28"
          aria-label="Volume"
        />
        <select
          value={rate}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (audioRef.current) audioRef.current.playbackRate = next;
            setRate(next);
          }}
          className="h-10 shrink-0 rounded-md border border-input bg-background px-2 text-xs text-foreground"
          aria-label="Vitesse de lecture"
        >
          <option value={0.75}>0.75×</option>
          <option value={1}>1×</option>
          <option value={1.25}>1.25×</option>
          <option value={1.5}>1.5×</option>
        </select>
      </div>

      {playbackError ? (
        <p className="text-sm text-destructive">{playbackError}</p>
      ) : null}
    </div>
  );
}
