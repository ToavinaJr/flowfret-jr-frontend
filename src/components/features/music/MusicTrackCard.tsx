import { useTranslation } from "react-i18next";
import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { MusicTrack } from "@/types/music";
import { AudiusMediaPlayer } from "./AudiusMediaPlayer";

interface MusicTrackCardProps { track: MusicTrack; }

export function MusicTrackCard({ track }: MusicTrackCardProps) {
  const { t } = useTranslation();
  const artistNames = track.artists.map((artist) => artist.name).join(", ");

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-3 p-3 sm:p-4">
        <div className="flex gap-3">
          <img src={track.imageUrl ?? "/placeholder.svg"} alt={t("music.albumCoverAlt", { title: track.title })} width={64} height={64} className="h-16 w-16 shrink-0 rounded-md bg-secondary object-cover" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-sm font-semibold text-foreground">{track.title}</h3>
            <p className="truncate text-sm text-muted-foreground">{artistNames}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {track.genre ? <Badge variant="outline">{track.genre}</Badge> : null}
              {track.geniusUrl ? (
                <Button asChild size="sm" variant="outline">
                  <a href={track.geniusUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="mr-1 h-3.5 w-3.5" />{t("music.openGenius")}</a>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
        <AudiusMediaPlayer track={track} />
      </CardContent>
    </Card>
  );
}
