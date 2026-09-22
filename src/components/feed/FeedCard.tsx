import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type UIEvent,
} from "react";
import {
  Check,
  Flag,
  Heart,
  Loader2,
  MessageCircle,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import {
  deleteFeedComment,
  deleteFeedPost,
  fetchPostComments,
  updateFeedComment,
  updateFeedPost,
  reportFeedPost,
} from "@/services/api";
import type { FeedPost, FeedComment } from "@/types/feed";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { DeleteConfirmationDialog } from "@/components/feed/DeleteConfirmationDialog";
import { toast } from "sonner";
import { DetailsPost } from "@/components/feed/DetailsPost";
import { Link } from "react-router-dom";
import { CommentsSkeleton } from "@/components/skeletons/AppSkeletons";

function formatRelative(iso: string, t: (key: string) => string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return t("feed.relativeMinutes").replace("{{count}}", String(Math.max(1, mins)));
  const hours = Math.floor(mins / 60);
  if (hours < 24) return t("feed.relativeHours").replace("{{count}}", String(hours));
  return t("feed.relativeDays").replace("{{count}}", String(Math.floor(hours / 24)));
}

export interface FeedCardProps {
  post: FeedPost;
  onComment: (postId: string, content: string) => Promise<void>;
  currentUserId: string;
  onToggleLike: (post: FeedPost) => Promise<void>;
  onChanged: () => Promise<void>;
}

export function FeedCard({
  post,
  onComment,
  currentUserId,
  onToggleLike,
  onChanged,
}: FeedCardProps) {
  const { t } = useTranslation();
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [liking, setLiking] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [dialogComments, setDialogComments] = useState<FeedComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [commentEditSaving, setCommentEditSaving] = useState(false);
  const [commentEditError, setCommentEditError] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editContent, setEditContent] = useState(post.content ?? "");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const isLiked = post.viewerHasLiked;
  const hasImages = post.attachments.length > 0;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      await onComment(post.id, comment.trim());
      setComment("");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEdit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const content = editContent.trim();
    if (!content && !hasImages) {
      setEditError(t("feed.postContentRequired"));
      return;
    }
    if (content === (post.content ?? "").trim()) {
      setEditOpen(false);
      return;
    }
    setEditSaving(true);
    setEditError(null);
    try {
      await updateFeedPost(post.id, content);
      await onChanged();
      setEditOpen(false);
    } catch {
      setEditError(t("feed.editFailed"));
    } finally {
      setEditSaving(false);
    }
  }

  async function saveCommentEdit(commentId: string) {
    const content = editingCommentContent.trim();
    if (!content) {
      setCommentEditError(t("feed.commentRequired"));
      return;
    }
    setCommentEditSaving(true);
    setCommentEditError(null);
    try {
      await updateFeedComment(commentId, content);
      setDialogComments((current) =>
        current.map((item) =>
          item.id === commentId ? { ...item, content } : item,
        ),
      );
      setEditingCommentId(null);
      await onChanged();
      toast.success(t("feed.commentEdited"));
    } catch {
      setCommentEditError(t("feed.editFailed"));
      toast.error(t("feed.commentEditFailed"));
    } finally {
      setCommentEditSaving(false);
    }
  }

  return (
    <article
      onClick={(event) => {
        if (
          !(event.target as HTMLElement).closest(
            "button, input, textarea, a, [role='dialog']",
          )
        )
          setDetailsOpen(true);
      }}
      className={`flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card p-3 shadow-sm transition-colors hover:border-primary/30 sm:p-4 ${hasImages ? "h-[32rem]" : "h-auto"}`}
    >
      <div className="mb-3 flex items-center gap-3">
        <Link
          to={`/profile/${post.author.id}`}
          className="flex min-w-0 items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-sm font-medium text-foreground">
            {post.author.profile?.avatarUrl ? (
              <img
                src={post.author.profile.avatarUrl}
                alt={`Avatar de ${post.author.username}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              post.author.username.slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm text-foreground hover:underline">
              {post.author.username}
            </div>
            <div className="font-musical text-xs text-muted-foreground">
              {formatRelative(post.createdAt, t)}
            </div>
          </div>
        </Link>
        {post.author.id === currentUserId && (
          <div className="ml-auto flex gap-1">
            <button
              type="button"
              aria-label={t("feed.editPost")}
              onClick={() => {
                setEditContent(post.content ?? "");
                setEditError(null);
                setEditOpen(true);
              }}
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <DeleteConfirmationDialog
              entity="post"
              onConfirm={async () => {
                await deleteFeedPost(post.id);
                await onChanged();
              }}
              trigger={
                <button
                  type="button"
                  aria-label={t("deleteDialog.post.trigger")}
                  className="min-h-11 min-w-11 rounded-md p-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              }
            />
          </div>
        )}
        {post.author.id !== currentUserId && (
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="ml-auto inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-destructive"
            aria-label={t("feed.reportPost")}
          >
            <Flag className="h-4 w-4" />
          </button>
        )}
      </div>
      {post.content && (
        <p
          className={`text-body mb-3 whitespace-pre-wrap break-words text-foreground ${hasImages ? "line-clamp-4" : "line-clamp-8"}`}
        >
          {post.content}
        </p>
      )}
      {post.attachments.length > 0 && (
        <div className="mb-3 grid h-64 shrink-0 grid-cols-2 gap-1 overflow-hidden rounded-lg bg-secondary">
          {post.attachments.slice(0, 4).map((attachment, index) => (
            <div
              key={attachment.id}
              className={`relative overflow-hidden ${post.attachments.length === 1 ? "col-span-2" : ""}`}
            >
              <img
                src={attachment.upload.storagePath}
                alt={t("postDetails.previewAlt", { number: index + 1 })}
                className="h-full w-full object-cover"
                loading="lazy"
              />
              {index === 3 && post.attachments.length > 4 && (
                <span className="absolute inset-0 grid place-items-center bg-black/60 px-2 text-center text-lg font-semibold text-white">
                  {t("postDetails.morePhotos", {
                    count: post.attachments.length - 4,
                  })}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
      <DetailsPost
        post={post}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          if (!editSaving) setEditOpen(open);
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-xl rounded-xl p-0">
          <DialogHeader className="border-b border-border px-5 py-4 text-left">
            <DialogTitle>{t("feed.editPost")}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 px-5 pb-5">
            <div>
              <label
                htmlFor={`edit-post-${post.id}`}
                className="mb-2 block text-sm font-medium text-foreground"
              >
                {t("feed.yourText")}
              </label>
              <textarea
                id={`edit-post-${post.id}`}
                value={editContent}
                onChange={(event) => {
                  setEditContent(event.target.value);
                  setEditError(null);
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
                <span className="text-destructive">{editError}</span>
                <span className="ml-auto text-muted-foreground">
                  {editContent.length}/10 000
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
                disabled={editSaving}
                onClick={() => setEditOpen(false)}
                className="min-h-11 rounded-md px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50"
              >
                {t("common.cancel")}
              </button>
              <button
                type="submit"
                disabled={editSaving || (!editContent.trim() && !hasImages)}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {editSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("common.save")}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={reportOpen} onOpenChange={(open) => !reporting && setReportOpen(open)}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>{t("feed.reportPost")}</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              if (reportReason.trim().length < 5) return;
              setReporting(true);
              try {
                await reportFeedPost(post.id, currentUserId, reportReason);
                toast.success(t("feed.reportSuccess"));
                setReportReason("");
                setReportOpen(false);
              } catch {
                toast.error(t("feed.reportError"));
              } finally {
                setReporting(false);
              }
            }}
          >
            <textarea
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
              minLength={5}
              maxLength={1000}
              rows={5}
              required
              placeholder={t("feed.reportPlaceholder")}
              aria-label={t("feed.reportReason")}
              className="w-full resize-y rounded-lg border border-border bg-secondary p-3 text-sm outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex justify-end gap-2">
              <button type="button" disabled={reporting} onClick={() => setReportOpen(false)} className="min-h-11 rounded-md px-4 text-sm hover:bg-secondary disabled:opacity-50">
                {t("common.cancel")}
              </button>
              <button type="submit" disabled={reporting || reportReason.trim().length < 5} className="min-h-11 rounded-md bg-destructive px-4 text-sm text-destructive-foreground disabled:opacity-50">
                {t(reporting ? "feed.reporting" : "feed.submitReport")}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <button
          type="button"
          disabled={liking}
          onClick={async () => {
            setLiking(true);
            try {
              await onToggleLike(post);
            } finally {
              setLiking(false);
            }
          }}
          className={`inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 transition-colors disabled:opacity-50 ${isLiked ? "text-primary" : "hover:bg-secondary hover:text-foreground"}`}
          aria-pressed={isLiked}
          aria-label={
            isLiked ? t("feed.removeReaction") : t("feed.reactToPost")
          }
        >
          <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          <span>
            {post.likeCount}{" "}
            {post.likeCount <= 1 ? t("feed.like") : t("feed.likes")}
          </span>
        </button>
        <button
          type="button"
          onClick={async () => {
            setCommentsOpen(true);
            setCommentsLoading(true);
            try {
              const rows = await fetchPostComments(post.id);
              setDialogComments(rows);
              setHasMoreComments(rows.length === 20);
            } finally {
              setCommentsLoading(false);
            }
          }}
          className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 hover:bg-secondary"
          aria-label={t("feed.showComments")}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          {post.commentCount}
        </button>
      </div>
      <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
        <DialogContent className="max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{t("feed.comments")}</DialogTitle>
          </DialogHeader>
          <div
            className="max-h-[60vh] space-y-3 overflow-y-auto pr-2"
            onScroll={async (event: UIEvent<HTMLDivElement>) => {
              const el = event.currentTarget;
              if (
                !commentsLoading &&
                hasMoreComments &&
                el.scrollHeight - el.scrollTop - el.clientHeight < 80
              ) {
                setCommentsLoading(true);
                try {
                  const rows = await fetchPostComments(
                    post.id,
                    dialogComments.length,
                  );
                  setDialogComments((current) => [...current, ...rows]);
                  setHasMoreComments(rows.length === 20);
                } finally {
                  setCommentsLoading(false);
                }
              }
            }}
          >
            {dialogComments.map((c) => (
              <article
                key={c.id}
                className="rounded-lg border border-border bg-card p-3 text-sm"
              >
                <header className="mb-2 flex items-center gap-2">
                  <Link
                    to={`/profile/${c.author.id}`}
                    className="flex min-w-0 flex-1 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-xs font-semibold text-foreground">
                      {c.author.profile?.avatarUrl ? (
                        <img
                          src={c.author.profile.avatarUrl}
                          alt={`Avatar de ${c.author.username}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        c.author.username.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-foreground hover:underline">
                        {c.author.username}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatRelative(c.createdAt, t)}
                      </div>
                    </div>
                  </Link>
                  {c.author.id === currentUserId && (
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        aria-label={t("feed.editComment")}
                        disabled={commentEditSaving}
                        onClick={() => {
                          setEditingCommentId(c.id);
                          setEditingCommentContent(c.content);
                          setCommentEditError(null);
                        }}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <DeleteConfirmationDialog
                        entity="comment"
                        onConfirm={async () => {
                          await deleteFeedComment(c.id);
                          setDialogComments((current) =>
                            current.filter((item) => item.id !== c.id),
                          );
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
                {editingCommentId === c.id ? (
                  <div className="space-y-2 pl-11">
                    <textarea
                      value={editingCommentContent}
                      onChange={(event) => {
                        setEditingCommentContent(event.target.value);
                        setCommentEditError(null);
                      }}
                      maxLength={5000}
                      rows={3}
                      autoFocus
                      aria-label={t("feed.commentContent")}
                      className="w-full resize-y rounded-lg border border-border bg-secondary p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="flex items-center gap-2">
                      {commentEditError && (
                        <span className="mr-auto text-xs text-destructive">
                          {commentEditError}
                        </span>
                      )}
                      {!commentEditError && (
                        <span className="mr-auto text-xs text-muted-foreground">
                          {editingCommentContent.length}/5 000
                        </span>
                      )}
                      <button
                        type="button"
                        disabled={commentEditSaving}
                        onClick={() => {
                          setEditingCommentId(null);
                          setCommentEditError(null);
                        }}
                        className="inline-flex min-h-9 items-center gap-1 rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50"
                      >
                        <X className="h-3.5 w-3.5" />
                        {t("common.cancel")}
                      </button>
                      <button
                        type="button"
                        disabled={
                          commentEditSaving || !editingCommentContent.trim()
                        }
                        onClick={() => void saveCommentEdit(c.id)}
                        className="inline-flex min-h-9 items-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-50"
                      >
                        {commentEditSaving ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        {t("common.save")}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap break-words pl-11 text-foreground/90">
                    {c.content}
                  </p>
                )}
              </article>
            ))}
            {!commentsLoading && dialogComments.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t("feed.noComments")}
              </p>
            )}
            {commentsLoading && <CommentsSkeleton />}
          </div>
        </DialogContent>
      </Dialog>
      <form
        onSubmit={handleSubmit}
        className="mt-auto flex flex-col gap-2 border-t border-border pt-3 sm:flex-row"
      >
        <input
          type="text"
          value={comment}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setComment(e.target.value)
          }
          placeholder={t("feed.addComment")}
          className="min-h-[44px] w-full flex-1 rounded-md border border-border bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={submitting || !comment.trim()}
          className="min-h-[44px] shrink-0 rounded-md bg-primary px-4 text-sm text-primary-foreground disabled:opacity-50"
        >
          {t("feed.postComment")}
        </button>
      </form>
    </article>
  );
}
