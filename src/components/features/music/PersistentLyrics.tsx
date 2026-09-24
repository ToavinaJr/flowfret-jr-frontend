import { FileText, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { PlaybackItem } from "@/contexts/PlaybackContext";
import { MUSIC_PROVIDER } from "@/constants/domain";
import { useLyrics } from "@/hooks/useLyrics";
import { LyricsPanel } from "./LyricsPanel";

export function PersistentLyrics({
  item,
  currentTime,
  onSeek,
  open,
  onOpenChange,
}: {
  item: PlaybackItem;
  currentTime: number;
  onSeek: (time: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { t } = useTranslation();
  const track =
    item.provider === MUSIC_PROVIDER.SPOTIFY && item.artist
      ? {
          id: item.id,
          provider: item.provider,
          title: item.title,
          artist: item.artist,
          album: item.album,
          duration: item.duration,
        }
      : null;
  const { lyrics, status } = useLyrics(track, open);
  if (!track) return null;

  return (
    <>
      {open && (
        <div className="absolute bottom-full left-0 right-0 border-t border-border bg-card/98 shadow-2xl backdrop-blur md:left-auto md:w-[min(36rem,100%)]">
          <div className="flex items-center justify-between border-b border-border px-4 py-2">
            <h2 className="text-sm font-semibold">{t("lyrics.title")}</h2>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary"
              aria-label={t("lyrics.close")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <LyricsPanel
            lyrics={lyrics}
            status={status}
            currentTime={currentTime}
            onSeek={onSeek}
          />
        </div>
      )}
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${open ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-secondary"}`}
        aria-label={open ? t("lyrics.close") : t("lyrics.open")}
        aria-expanded={open}
      >
        <FileText className="h-5 w-5" />
      </button>
    </>
  );
}
