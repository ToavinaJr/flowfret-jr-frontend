import { useCallback, useEffect, useRef, useState } from "react";
import { Download, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { MusicTrack } from "@/types/music";
import type { PlayerPreparationState } from "@/types/transcription";
import { downloadTranscriptionLrc } from "@/services/transcriptionsApi";
import { useTranscriptionEvents } from "@/hooks/useTranscriptionEvents";
import { findActiveSegment } from "@/utils/transcription";
import { SynchronizedLyrics } from "./SynchronizedLyrics";

interface AudiusMediaPlayerProps { track: MusicTrack; }
const PLAY_EVENT = "fretflow:audius-play";
const MIN_AHEAD = 20;
const RESUME_AHEAD = 35;
const SYNC_OFFSET_SECONDS = Number(import.meta.env.VITE_LYRICS_SYNC_OFFSET_MS ?? 0) / 1000;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  return `${Math.floor(seconds / 60)}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}

export function AudiusMediaPlayer({ track }: AudiusMediaPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const wantsPlaybackRef = useRef(false);
  const pausedForBufferRef = useRef(false);
  const streamRetryRef = useRef(0);
  const [playerState, setPlayerState] = useState<PlayerPreparationState>("IDLE");
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(track.durationMs / 1000);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [streamUrl, setStreamUrl] = useState(track.streamUrl);
  const { transcription, error, prepare, retry } = useTranscriptionEvents(track);

  useEffect(() => {
    streamRetryRef.current = 0;
    setStreamUrl(track.streamUrl);
  }, [track.audiusId, track.streamUrl]);

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
    setPlayerState("FAILED");
  }

  const playFromStart = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !transcription?.readyToPlay) return;
    audio.currentTime = 0; setCurrentTime(0);
    try {
      window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: track.audiusId }));
      await audio.play(); setPlayerState("PLAYING"); setAutoplayBlocked(false);
    } catch (playError) {
      if (playError instanceof DOMException && playError.name === "NotAllowedError") setAutoplayBlocked(true);
      setPlayerState("READY");
    }
  }, [track.audiusId, transcription?.readyToPlay]);

  async function toggle(): Promise<void> {
    const audio = audioRef.current;
    if (!audio) return;
    if (playerState === "PLAYING") { wantsPlaybackRef.current = false; audio.pause(); setPlayerState("PAUSED"); return; }
    if (!transcription) {
      console.info("[FretFlow:player] preparing", { trackId: track.audiusId, playerState });
      wantsPlaybackRef.current = true;
      try {
        window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: track.audiusId }));
        await audio.play();
        setPlayerState("PLAYING");
        setAutoplayBlocked(false);
      } catch (playError) {
        console.error("[FretFlow:player] playback_start_failed", { trackId: track.audiusId, error: playError });
        setAutoplayBlocked(true);
        setPlayerState("READY");
      }
      void prepare().catch((prepareError) =>
        console.error("[FretFlow:player] preparation_failed", {
          trackId: track.audiusId,
          error: prepareError,
        }),
      );
      return;
    }
    wantsPlaybackRef.current = true;
    try { await audio.play(); setPlayerState("PLAYING"); setAutoplayBlocked(false); } catch { setAutoplayBlocked(true); setPlayerState("READY"); }
  }

  async function handleRetry(): Promise<void> {
    try {
      if (transcription) {
        await retry();
      } else {
        const result = await prepare();
        if (result.readyToPlay) await playFromStart();
      }
    } catch (retryError) {
      console.error("[FretFlow:player] retry_failed", {
        trackId: track.audiusId,
        error: retryError,
      });
    }
  }

  useEffect(() => {
    if (transcription?.readyToPlay && wantsPlaybackRef.current && (playerState === "PREPARING_LYRICS" || playerState === "CHECKING_CACHE")) void playFromStart();
  }, [playFromStart, playerState, transcription?.readyToPlay, transcription?.status]);

  useEffect(() => {
    const tick = () => {
      const audio = audioRef.current;
      if (!audio || audio.paused) return;
      const synchronizedTime = audio.currentTime + SYNC_OFFSET_SECONDS;
      const next = findActiveSegment(transcription?.segments ?? [], synchronizedTime);
      setActiveIndex((current) => current === next ? current : next);
      const complete = transcription?.status === "COMPLETED";
      const ahead = (transcription?.bufferedUntil ?? 0) - audio.currentTime;
      const lyricsBufferActive = Boolean(transcription?.readyToPlay);
      if (lyricsBufferActive && !complete && ahead <= 0.25) {
        pausedForBufferRef.current = true; audio.pause(); setPlayerState("BUFFERING_LYRICS"); return;
      }
      if (lyricsBufferActive && !complete && ahead < MIN_AHEAD) setPlayerState("BUFFERING_LYRICS");
      else setPlayerState("PLAYING");
      animationRef.current = requestAnimationFrame(tick);
    };
    if (playerState === "PLAYING" || (playerState === "BUFFERING_LYRICS" && !pausedForBufferRef.current)) animationRef.current = requestAnimationFrame(tick);
    return () => { if (animationRef.current !== null) cancelAnimationFrame(animationRef.current); };
  }, [playerState, transcription?.bufferedUntil, transcription?.segments, transcription?.status]);

  useEffect(() => {
    if (!pausedForBufferRef.current || !audioRef.current || !transcription) return;
    const ahead = transcription.bufferedUntil - audioRef.current.currentTime;
    if (transcription.status === "COMPLETED" || ahead >= RESUME_AHEAD) {
      pausedForBufferRef.current = false;
      void audioRef.current.play().then(() => setPlayerState("PLAYING")).catch(() => setAutoplayBlocked(true));
    }
  }, [transcription]);

  useEffect(() => {
    const stopOther = (event: Event) => { if ((event as CustomEvent<string>).detail !== track.audiusId) { audioRef.current?.pause(); wantsPlaybackRef.current = false; setPlayerState("PAUSED"); } };
    window.addEventListener(PLAY_EVENT, stopOther);
    return () => window.removeEventListener(PLAY_EVENT, stopOther);
  }, [track.audiusId]);

  function seek(seconds: number) { if (!audioRef.current) return; audioRef.current.currentTime = seconds; setCurrentTime(seconds); setActiveIndex(findActiveSegment(transcription?.segments ?? [], seconds + SYNC_OFFSET_SECONDS)); }
  const preparing = Boolean(transcription && !transcription.readyToPlay && transcription.status !== "FAILED");

  return (
    <div className="space-y-3 rounded-lg border border-border bg-secondary/40 p-3">
      <audio ref={audioRef} src={streamUrl} preload="metadata" muted={muted} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onLoadedMetadata={(event) => { streamRetryRef.current = 0; setDuration(event.currentTarget.duration || duration); }} onEnded={() => setPlayerState("COMPLETED")} onError={handleAudioError} />
      {preparing ? <div className="space-y-2"><p className="text-sm font-medium">Préparation des paroles synchronisées…</p><Progress value={transcription?.progress ?? 0} /><p className="text-xs text-muted-foreground">{(transcription?.bufferedUntil ?? 0).toFixed(1)} secondes préparées</p></div> : null}
      {playerState === "BUFFERING_LYRICS" ? <p className="text-xs text-muted-foreground">Préparation de la suite des paroles…</p> : null}
      {autoplayBlocked ? <p className="text-sm text-primary">Les paroles sont prêtes. Appuyez sur « Démarrer la lecture ».</p> : null}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="icon" className="h-10 w-10 rounded-full" onClick={() => void toggle()} aria-label={playerState === "PLAYING" ? "Pause" : "Lecture"}>{playerState === "PLAYING" ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}</Button>
        <span className="w-9 text-right text-xs text-muted-foreground">{formatTime(currentTime)}</span>
        <input type="range" min={0} max={duration || 1} step={0.1} value={Math.min(currentTime, duration || 1)} onChange={(event) => seek(Number(event.target.value))} className="min-w-32 flex-1 accent-primary" aria-label="Position de lecture" />
        <span className="w-9 text-xs text-muted-foreground">{formatTime(duration)}</span>
        <Button type="button" size="icon" variant="ghost" onClick={() => setMuted((value) => !value)} aria-label={muted ? "Activer le son" : "Couper le son"}>{muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}</Button>
        <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(event) => { const next = Number(event.target.value); if (audioRef.current) audioRef.current.volume = next; setVolume(next); }} className="hidden w-16 accent-primary sm:block" aria-label="Volume" />
        <select value={rate} onChange={(event) => { const next = Number(event.target.value); if (audioRef.current) audioRef.current.playbackRate = next; setRate(next); }} className="h-9 rounded-md border border-input bg-background px-2 text-xs" aria-label="Vitesse de lecture"><option value={0.75}>0.75×</option><option value={1}>1×</option><option value={1.25}>1.25×</option><option value={1.5}>1.5×</option></select>
        {transcription?.lrcAvailable ? <Button type="button" size="sm" variant="outline" onClick={() => void downloadTranscriptionLrc(transcription.transcriptionId)}><Download className="mr-1 h-4 w-4" />LRC</Button> : null}
      </div>
      <SynchronizedLyrics segments={transcription?.segments ?? []} activeIndex={activeIndex} onSeek={seek} />
      {(playerState === "FAILED" || error) ? <div className="flex items-center justify-between gap-2 text-sm text-destructive"><span>{transcription?.error?.message ?? error ?? "La transcription a échoué."}</span><Button type="button" size="sm" variant="outline" onClick={() => void handleRetry()}><RotateCcw className="mr-1 h-4 w-4" />Réessayer</Button></div> : null}
    </div>
  );
}
