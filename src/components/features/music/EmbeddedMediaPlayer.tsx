import { Play } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { MusicTrack } from "@/types/music";
import { getYouTubeEmbedUrl } from "@/utils/youtubeEmbed";

export function EmbeddedMediaPlayer({ track }: { track: MusicTrack }) {
  const providerName = "YouTube";
  const embedUrl = getYouTubeEmbedUrl(track.audiusId);

  if (!embedUrl)
    return (
      <a
        href={track.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-95"
        aria-label={`Ouvrir ${track.title} sur ${providerName}`}
      >
        <Play className="ml-0.5 h-[18px] w-[18px] fill-current" />
      </a>
    );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card active:scale-95"
          aria-label={`Lire ${track.title} avec ${providerName}`}
        >
          <Play className="ml-0.5 h-[18px] w-[18px] fill-current" />
        </button>
      </DialogTrigger>

      <DialogContent className="w-[calc(100%-2rem)] max-w-2xl overflow-hidden p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>{track.title}</DialogTitle>
          <DialogDescription>
            {track.artists.map((artist) => artist.name).join(", ")} ·{" "}
            {providerName}
          </DialogDescription>
        </DialogHeader>

        <div className="px-4 pb-4 sm:px-6 sm:pb-6">
          <iframe
            key={track.audiusId}
            src={embedUrl}
            title={`${providerName} — ${track.title}`}
            className="aspect-video w-full rounded-xl border-0"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture"
            loading="lazy"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
