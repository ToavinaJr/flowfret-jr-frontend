import { useTranslation } from "react-i18next";
import { Clock3, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { MusicTrack } from "@/types/music";
import { MusicMediaPlayer } from "./MusicMediaPlayer";
import { TrackLyrics } from "./TrackLyrics";

interface MusicTrackCardProps {
  track: MusicTrack;
}

function formatDuration(durationMs: number): string {
  const seconds = Math.floor(durationMs / 1000);
  return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
}

export function MusicTrackCard({ track }: MusicTrackCardProps) {
  const { t } = useTranslation();
  const artistNames = track.artists.map((artist) => artist.name).join(", ");

  return (
    <Card className="group overflow-hidden border-border/70 bg-card shadow-none transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20">
      <CardContent className="flex flex-wrap items-center gap-3 p-3 sm:gap-4 sm:p-4">
        <div className="relative shrink-0 overflow-hidden rounded-lg bg-secondary shadow-sm">
          <img
            src={track.imageUrl ?? "/placeholder.svg"}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/placeholder.svg";
            }}
            alt={t("music.albumCoverAlt", { title: track.title })}
            width={80}
            height={80}
            className="h-[72px] w-[72px] object-cover transition-transform duration-300 group-hover:scale-105 sm:h-20 sm:w-20"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        <div className="min-w-0 flex-1 self-stretch py-0.5">
          <div className="flex min-w-0 items-start gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-[15px] font-semibold leading-5 tracking-[-0.01em] text-foreground sm:text-base">
                {track.title}
              </h3>
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {artistNames}
              </p>
            </div>
          </div>

          <div className="mt-3 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
            {track.genre ? (
              <Badge
                variant="secondary"
                className="h-6 max-w-[120px] truncate rounded-full border-0 px-2.5 font-medium"
              >
                {track.genre}
              </Badge>
            ) : null}
            <span className="flex shrink-0 items-center gap-1 font-musical">
              <Clock3 className="h-3.5 w-3.5" />
              {formatDuration(track.durationMs)}
            </span>
            {track.geniusUrl ? (
              <a
                href={track.geniusUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto hidden items-center gap-1 rounded-md px-2 py-1 font-medium transition-colors hover:bg-secondary hover:text-foreground sm:flex"
                aria-label={t("music.openGenius")}
              >
                Paroles <ExternalLink className="h-3 w-3" />
              </a>
            ) : null}
          </div>
        </div>

        <MusicMediaPlayer track={track} />
        {track.provider === "SPOTIFY" ? <TrackLyrics track={track} /> : null}
      </CardContent>
    </Card>
  );
}
