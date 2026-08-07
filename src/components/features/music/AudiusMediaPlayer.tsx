import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AudiusMediaPlayerProps {
  id: string;
  src: string;
  durationMs: number;
}

const PLAY_EVENT = "fretflow:audius-play";

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${Math.floor(seconds % 60).toString().padStart(2, "0")}`;
}

export function AudiusMediaPlayer({ id, src, durationMs }: AudiusMediaPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationMs / 1000);
  const [volume, setVolume] = useState(1);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const stopOtherPlayer = (event: Event) => {
      const activeId = (event as CustomEvent<string>).detail;
      if (activeId !== id) {
        audioRef.current?.pause();
        setPlaying(false);
      }
    };
    window.addEventListener(PLAY_EVENT, stopOtherPlayer);
    return () => window.removeEventListener(PLAY_EVENT, stopOtherPlayer);
  }, [id]);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    try {
      window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: id }));
      await audio.play();
      setFailed(false);
      setPlaying(true);
    } catch {
      setFailed(true);
      setPlaying(false);
    }
  }

  return (
    <div className="space-y-2 rounded-lg border border-border bg-secondary/40 p-2.5">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || duration)}
        onEnded={() => setPlaying(false)}
        onError={() => { setFailed(true); setPlaying(false); }}
      />
      <div className="flex items-center gap-2">
        <Button type="button" size="icon" className="h-9 w-9 shrink-0 rounded-full" onClick={() => void toggle()} aria-label={playing ? "Pause" : "Play"}>
          {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
        </Button>
        <span className="w-9 text-right font-musical text-[11px] text-muted-foreground">{formatTime(currentTime)}</span>
        <input
          type="range"
          min={0}
          max={duration || 1}
          step={0.1}
          value={Math.min(currentTime, duration || 1)}
          onChange={(event) => {
            const time = Number(event.target.value);
            if (audioRef.current) audioRef.current.currentTime = time;
            setCurrentTime(time);
          }}
          className="min-w-0 flex-1 accent-primary"
          aria-label="Position de lecture"
        />
        <span className="w-9 font-musical text-[11px] text-muted-foreground">{formatTime(duration)}</span>
        <Volume2 className="hidden h-4 w-4 text-muted-foreground sm:block" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(event) => {
            const nextVolume = Number(event.target.value);
            if (audioRef.current) audioRef.current.volume = nextVolume;
            setVolume(nextVolume);
          }}
          className="hidden w-16 accent-primary sm:block"
          aria-label="Volume"
        />
      </div>
      {failed ? <p className="text-xs text-destructive">Impossible de lire ce morceau Audius.</p> : null}
    </div>
  );
}
