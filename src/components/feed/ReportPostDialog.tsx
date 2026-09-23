import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { reportFeedPost } from "@/services/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ReportPostDialogProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportPostDialog({
  postId,
  open,
  onOpenChange,
}: ReportPostDialogProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (reason.trim().length < 5) return;
    setSubmitting(true);
    try {
      await reportFeedPost(postId, reason.trim());
      toast.success(t("feed.reportSuccess"));
      setReason("");
      onOpenChange(false);
    } catch {
      toast.error(t("feed.reportError"));
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
          <DialogTitle>{t("feed.reportPost")}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={submit}>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            minLength={5}
            maxLength={1000}
            rows={5}
            required
            placeholder={t("feed.reportPlaceholder")}
            aria-label={t("feed.reportReason")}
            className="w-full resize-y rounded-lg border border-border bg-secondary p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
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
              {t(submitting ? "feed.reporting" : "feed.submitReport")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
