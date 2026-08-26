import { useState } from "react";
import { FileText, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { usePlayback } from "@/contexts/PlaybackContext";
import { useLyrics } from "@/hooks/useLyrics";
import type { MusicTrack } from "@/types/music";
import { LyricsPanel } from "./LyricsPanel";

export function TrackLyrics({ track }: { track: MusicTrack }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { item, currentTime, seek } = usePlayback();
  const artist = track.artists[0]?.name ?? "";
  const isActive = item?.provider === track.provider && item.id.endsWith(`:${track.id}`);
  const { lyrics, status } = useLyrics(
    {
      id: track.id,
      provider: track.provider,
      title: track.title,
      artist,
      album: track.album,
      duration: track.durationMs / 1000,
    },
    open && Boolean(artist),
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-border bg-secondary px-3 text-sm font-medium text-foreground hover:bg-secondary/80"
        aria-expanded={open}
        aria-controls={`lyrics-${track.provider}-${track.id}`}
      >
        {open ? <X className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
        <span className="hidden sm:inline">{open ? t("lyrics.close") : t("lyrics.title")}</span>
      </button>

      {open ? (
        <section
          id={`lyrics-${track.provider}-${track.id}`}
          className="basis-full overflow-hidden rounded-lg border border-border bg-background/60"
          aria-label={`${t("lyrics.title")} — ${track.title}`}
        >
          <LyricsPanel
            lyrics={lyrics}
            status={status}
            currentTime={isActive ? currentTime : 0}
            onSeek={isActive ? seek : undefined}
          />
        </section>
      ) : null}
    </>
  );
}
