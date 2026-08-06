import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ExternalLink, Pause, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { MusicTrack } from "@/types/music";

interface MusicTrackCardProps {
  track: MusicTrack;
}

function formatDuration(durationMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function MusicTrackCard({ track }: MusicTrackCardProps) {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const artistNames = track.artists.map((artist) => artist.name).join(", ");

  async function togglePreview() {
    if (!track.previewUrl || !audioRef.current) {
      return;
    }
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex gap-3 p-3 sm:p-4">
        <img
          src={track.imageUrl ?? "/placeholder.svg"}
          alt={t("music.albumCoverAlt", { title: track.title })}
          width={64}
          height={64}
          className="h-16 w-16 shrink-0 rounded-md object-cover bg-secondary"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <h3 className="truncate text-sm font-semibold text-foreground">
              {track.title}
            </h3>
            <p className="truncate text-sm text-muted-foreground">{artistNames}</p>
            <p className="truncate text-xs text-muted-foreground">
              {track.albumName} · {formatDuration(track.durationMs)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="sm" variant="secondary">
              <a
                href={track.spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-1 h-3.5 w-3.5" />
                {t("music.openSpotify")}
              </a>
            </Button>

            {track.geniusUrl ? (
              <Button asChild size="sm" variant="outline">
                <a
                  href={track.geniusUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-1 h-3.5 w-3.5" />
                  {t("music.openGenius")}
                </a>
              </Button>
            ) : null}

            {track.previewUrl ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={togglePreview}
                >
                  {isPlaying ? (
                    <Pause className="mr-1 h-3.5 w-3.5" />
                  ) : (
                    <Play className="mr-1 h-3.5 w-3.5" />
                  )}
                  {t("music.preview")}
                </Button>
                <audio
                  ref={audioRef}
                  src={track.previewUrl}
                  preload="none"
                  onEnded={() => setIsPlaying(false)}
                />
              </>
            ) : (
              <Badge variant="outline">{t("music.previewUnavailable")}</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
