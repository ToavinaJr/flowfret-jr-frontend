import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";
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
  const artistNames = track.artists.map((artist) => artist.name).join(", ");

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex gap-3 p-3 sm:p-4">
        <img
          src={track.imageUrl ?? "/placeholder.svg"}
          alt={t("music.videoThumbnailAlt", { title: track.title })}
          width={64}
          height={64}
          className="h-16 w-16 shrink-0 rounded-md bg-secondary object-cover"
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <h3 className="truncate text-sm font-semibold text-foreground">
              {track.title}
            </h3>
            <p className="truncate text-sm text-muted-foreground">{artistNames}</p>
            <p className="truncate text-xs text-muted-foreground">
              {formatDuration(track.durationMs)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild size="sm" variant="secondary">
              <a href={track.youtubeUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-1 h-3.5 w-3.5" />
                {t("music.openYoutube")}
              </a>
            </Button>

            {track.geniusUrl ? (
              <Button asChild size="sm" variant="outline">
                <a href={track.geniusUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-1 h-3.5 w-3.5" />
                  {t("music.openGenius")}
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
