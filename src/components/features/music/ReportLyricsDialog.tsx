import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { Flag } from "lucide-react";
import { toast } from "sonner";
import { reportLyrics } from "@/services/lyricsApi";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { PopupTitle } from "@/components/ui/PopupTitle";

interface ReportLyricsDialogProps {
  provider: string;
  trackId: string;
  title: string;
  artist: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportLyricsDialog({
  provider,
  trackId,
  title,
  artist,
  open,
  onOpenChange,
}: ReportLyricsDialogProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [proposedLyrics, setProposedLyrics] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (reason.trim().length < 5) return;
    setSubmitting(true);
    try {
      await reportLyrics({
        provider,
        trackId,
        title,
        artist,
        reason: reason.trim(),
        proposedLyrics: proposedLyrics.trim() || undefined,
      });
      toast.success(t("lyrics.reportSuccess"));
      setReason("");
      setProposedLyrics("");
      onOpenChange(false);
    } catch {
      toast.error(t("lyrics.reportError"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => !submitting && onOpenChange(nextOpen)}
    >
      <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-xl">
        <DialogHeader>
          <PopupTitle icon={Flag}>{t("lyrics.reportLyrics")}</PopupTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <textarea
            id="report-lyrics-reason"
            name="reason"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            minLength={5}
            maxLength={1000}
            rows={5}
            required
            placeholder={t("lyrics.reportPlaceholder")}
            aria-label={t("lyrics.reportReason")}
            className="w-full resize-y rounded-lg border border-border bg-secondary p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
          <div>
            <label
              htmlFor="report-lyrics-proposal"
              className="mb-1 block text-xs font-medium text-muted-foreground"
            >
              {t("lyrics.proposedLyricsLabel")}
            </label>
            <textarea
              id="report-lyrics-proposal"
              name="proposedLyrics"
              value={proposedLyrics}
              onChange={(event) => setProposedLyrics(event.target.value)}
              maxLength={20_000}
              rows={6}
              placeholder={t("lyrics.proposedLyricsPlaceholder")}
              className="w-full resize-y rounded-lg border border-border bg-secondary p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => onOpenChange(false)}
              className="min-h-11 rounded-md px-4 text-sm hover:bg-secondary disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting || reason.trim().length < 5}
              className="min-h-11 rounded-md bg-destructive px-4 text-sm text-destructive-foreground disabled:opacity-50"
            >
              {t(submitting ? "lyrics.reporting" : "lyrics.submitReport")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
