import { useState } from "react";
import { Check, Loader2, Pencil, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { deleteFeedComment, updateFeedComment } from "@/services/api";
import type { FeedComment } from "@/types/feed";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";
import { formatRelative } from "./feed-format";
import { MentionInput } from "./MentionInput";
import { MentionText } from "./MentionText";
import { UserAvatar } from "@/components/common/UserAvatar";

interface FeedCommentItemProps {
  comment: FeedComment;
  currentUserId: string;
  onUpdated: (comment: FeedComment) => void;
  onDeleted: (commentId: string) => void;
  onChanged: () => Promise<void>;
}

export function FeedCommentItem({
  comment,
  currentUserId,
  onUpdated,
  onDeleted,
  onChanged,
}: FeedCommentItemProps) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(comment.content);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    const normalized = content.trim();
    if (!normalized) {
      setError(t("feed.commentRequired"));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const updated = await updateFeedComment(comment.id, normalized);
      onUpdated({ ...comment, ...updated });
      setEditing(false);
      await onChanged();
      toast.success(t("feed.commentEdited"));
    } catch {
      setError(t("feed.editFailed"));
      toast.error(t("feed.commentEditFailed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="rounded-lg border border-border bg-card p-3 text-sm">
      <header className="mb-2 flex items-center gap-2">
        <Link
          to={`/profile/${comment.author.id}`}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <UserAvatar
            src={comment.author.avatarUrl}
            name={comment.author.username}
            alt={t("friends.avatarAlt", { name: comment.author.username })}
            size="xs"
          />
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-foreground hover:underline">
              {comment.author.username}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatRelative(comment.createdAt, t)}
            </div>
          </div>
        </Link>
        {comment.author.id === currentUserId && (
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              aria-label={t("feed.editComment")}
              disabled={saving}
              onClick={() => {
                setContent(comment.content);
                setError(null);
                setEditing(true);
              }}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <DeleteConfirmationDialog
              entity="comment"
              onConfirm={async () => {
                await deleteFeedComment(comment.id);
                onDeleted(comment.id);
                await onChanged();
              }}
              trigger={
                <button
                  type="button"
                  aria-label={t("deleteDialog.comment.trigger")}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              }
            />
          </div>
        )}
      </header>
      {editing ? (
        <div className="space-y-2 pl-11">
          <MentionInput
            value={content}
            onChange={(value) => {
              setContent(value);
              setError(null);
            }}
            maxLength={5000}
            rows={3}
            autoFocus
            aria-label={t("feed.commentContent")}
            className="w-full resize-y rounded-lg border border-border bg-secondary p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="flex items-center gap-2">
            <span
              className={`mr-auto text-xs ${error ? "text-destructive" : "text-muted-foreground"}`}
            >
              {error ?? `${content.length}/5 000`}
            </span>
            <button
              type="button"
              disabled={saving}
              onClick={() => setEditing(false)}
              className="inline-flex min-h-9 items-center gap-1 rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-secondary disabled:opacity-50"
            >
              <X className="h-3.5 w-3.5" /> {t("common.cancel")}
            </button>
            <button
              type="button"
              disabled={saving || !content.trim()}
              onClick={() => void save()}
              className="inline-flex min-h-9 items-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              {t("common.save")}
            </button>
          </div>
        </div>
      ) : (
        <MentionText
          content={comment.content}
          mentionedUsers={comment.mentionedUsers ?? []}
          className="block whitespace-pre-wrap break-words pl-11 text-foreground/90"
        />
      )}
    </article>
  );
}
