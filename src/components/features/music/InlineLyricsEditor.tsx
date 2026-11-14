import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, X } from "lucide-react";
import { saveLyricsOverride } from "@/services/lyricsApi";
import type { LyricLine, LyricsTrack } from "@/types/lyrics";
import { LyricsLinesEditor } from "./LyricsLinesEditor";

interface InlineLyricsEditorProps {
  track: LyricsTrack;
  initialLines: LyricLine[];
  currentTime: number;
  isPlaying: boolean;
  onTogglePlayback: () => void;
}

/**
 * Lets an admin fix the lyrics currently shown in the player directly,
 * without going through the admin backoffice or waiting for a user report
 * first. Saves to the same LyricsOverride used by the admin "lyrics
 * reports" editor, so a track found via Tononkira (or any other provider)
 * becomes the admin-corrected source of truth for everyone from then on.
 *
 * Rendered through a portal into document.body: this component lives
 * inside the track player, which re-renders on every playback tick
 * (currentTime). Keeping the modal inline in that subtree caused visible
 * jumps while open and made the close button unreliable, since the modal's
 * DOM node kept getting reconciled alongside the ticking player around it.
 * Portaling detaches it from that churn.
 */
export function InlineLyricsEditor({
  track,
  initialLines,
  currentTime,
  isPlaying,
  onTogglePlayback,
}: InlineLyricsEditorProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [lines, setLines] = useState<LyricLine[]>(initialLines);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const save = useMutation({
    mutationFn: () =>
      saveLyricsOverride({
        provider: track.provider,
        trackId: track.id,
        title: track.title,
        artist: track.artist,
        lines,
      }),
    onSuccess: () => {
      setSaved(true);
      setSaveError(false);
      void queryClient.invalidateQueries({
        queryKey: [
          "lyrics",
          track.provider,
          track.id,
          track.title,
          track.artist,
          track.duration,
        ],
      });
    },
    onError: () => setSaveError(true),
  });

  function openEditor() {
    setLines(initialLines);
    setSaved(false);
    setSaveError(false);
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={openEditor}
        aria-label={t("lyrics.editLyrics")}
        title={t("lyrics.editLyrics")}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-3 sm:p-6"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setOpen(false);
              }}
            >
              <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="inline-lyrics-editor-title"
                className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-border bg-card p-4 shadow-xl sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2
                      id="inline-lyrics-editor-title"
                      className="text-lg font-semibold"
                    >
                      {t("lyrics.editLyrics")}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {track.title} — {track.artist}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={t("common.close")}
                    onClick={() => setOpen(false)}
                    className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <X aria-hidden="true" className="h-4 w-4" />
                  </button>
                </div>
                <LyricsLinesEditor
                  lines={lines}
                  track={track}
                      liveSync={{ currentTimeMs: currentTime * 1000, isPlaying, onTogglePlayback }}
                  onChange={(nextLines) => {
                    setLines(nextLines);
                    setSaved(false);
                    setSaveError(false);
                  }}
                />
                <div className="mt-2 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    {saved ? (
                      <span role="status" className="text-green-600">
                        {t("admin.resources.lyricsReports.lyricsSaved")}
                      </span>
                    ) : null}
                    {saveError ? (
                      <span role="alert" className="text-destructive">
                        {t("admin.resources.lyricsReports.saveLyricsFailed")}
                      </span>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    disabled={save.isPending}
                    onClick={() => save.mutate()}
                    className="min-h-10 rounded-md bg-primary px-4 font-medium text-primary-foreground disabled:opacity-50"
                  >
                    {save.isPending ? t("common.saving") : t("common.save")}
                  </button>
                </div>
              </section>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
