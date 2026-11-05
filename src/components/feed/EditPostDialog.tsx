import { useState, type FormEvent } from "react";
import { Loader2, Pencil } from "lucide-react";
import { PopupTitle } from "@/components/ui/PopupTitle";
import { useTranslation } from "react-i18next";
import { updateFeedPost } from "@/services/api";
import type { FeedPost } from "@/types/feed";
import {
  Dialog,
  DialogContent,
  DialogHeader,
} from "@/components/ui/dialog";
import { MentionInput } from "./MentionInput";

interface EditPostDialogProps {
  post: FeedPost;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => Promise<void>;
}

export function EditPostDialog({
  post,
  open,
  onOpenChange,
  onChanged,
}: EditPostDialogProps) {
  const { t } = useTranslation();
  const [content, setContent] = useState(post.content ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasImages = post.attachments.length > 0;

  function changeOpen(nextOpen: boolean) {
    if (saving) return;
    if (nextOpen) {
      setContent(post.content ?? "");
      setError(null);
    }
    onOpenChange(nextOpen);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = content.trim();
    if (!normalized && !hasImages) {
      setError(t("feed.postContentRequired"));
      return;
    }
    if (normalized === (post.content ?? "").trim()) {
      onOpenChange(false);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateFeedPost(post.id, normalized);
      await onChanged();
      onOpenChange(false);
    } catch {
      setError(t("feed.editFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={changeOpen}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-xl rounded-xl p-0">
        <DialogHeader className="border-b border-border px-5 py-4 text-left">
          <PopupTitle icon={Pencil}>{t("feed.editPost")}</PopupTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 px-5 pb-5">
          <div>
            <label
              htmlFor={`edit-post-${post.id}`}
              className="mb-2 block text-sm font-medium text-foreground"
            >
              {t("feed.yourText")}
            </label>
            <MentionInput
              id={`edit-post-${post.id}`}
              value={content}
              onChange={(value) => {
                setContent(value);
                setError(null);
              }}
              maxLength={10000}
              rows={6}
              autoFocus
              className="w-full resize-y rounded-lg border border-border bg-secondary p-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-primary"
              placeholder={
                hasImages
                  ? t("feed.captionPlaceholder")
                  : t("feed.writePlaceholder")
              }
            />
            <div className="mt-1 flex justify-between gap-3 text-xs">
              <span className="text-destructive">{error}</span>
              <span className="ml-auto text-muted-foreground">
                {content.length}/10 000
              </span>
            </div>
          </div>
          {hasImages && (
            <div className="flex gap-2 overflow-x-auto rounded-lg bg-secondary p-2">
              {post.attachments.map((attachment) => (
                <img
                  key={attachment.id}
                  src={attachment.upload.storagePath}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-md object-cover"
                />
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              disabled={saving}
              onClick={() => onOpenChange(false)}
              className="min-h-11 rounded-md px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={saving || (!content.trim() && !hasImages)}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("common.save")}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
