import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ChangeEvent, type FormEvent, type UIEvent } from "react";
import { Check, Heart, Loader2, MessageCircle, Pencil, Plus, Trash2, X } from "lucide-react";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  createFeedComment,
  createFeedLike,
  createFeedPost,
  deleteFeedLike,
  deleteFeedComment,
  deleteFeedPost,
  fetchFeedPosts,
  fetchPostComments,
  uploadImages,
  updateFeedComment,
  updateFeedPost,
} from "@/services/api";
import type { FeedPost } from "@/types/feed";
import type { FeedComment } from "@/types/feed";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTranslation } from "react-i18next";
import { useFeed } from "@/hooks/useFeed";
import { PostComposer } from "@/components/feed/PostComposer";
import { DeleteConfirmationDialog } from "@/components/feed/DeleteConfirmationDialog";

function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return "";
  const diff = Date.now() - then;
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

interface FeedCardProps {
  post: FeedPost;
  onComment: (postId: string, content: string) => Promise<void>;
  currentUserId: string;
  onToggleLike: (post: FeedPost) => Promise<void>;
  onChanged: () => Promise<void>;
}

function FeedCard({ post, onComment, currentUserId, onToggleLike, onChanged }: FeedCardProps) {
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
  const [editOpen, setEditOpen] = useState(false);
  const [editContent, setEditContent] = useState(post.content ?? "");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const isLiked = post.likes.some((like) => like.userId === currentUserId);
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
      setEditError("Une publication doit contenir du texte ou une image.");
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
      setEditError("La modification n’a pas pu être enregistrée.");
    } finally {
      setEditSaving(false);
    }
  }

  async function saveCommentEdit(commentId: string) {
    const content = editingCommentContent.trim();
    if (!content) {
      setCommentEditError("Le commentaire ne peut pas être vide.");
      return;
    }
    setCommentEditSaving(true);
    setCommentEditError(null);
    try {
      await updateFeedComment(commentId, content);
      setDialogComments((current) => current.map((item) => item.id === commentId ? { ...item, content } : item));
      setEditingCommentId(null);
      await onChanged();
    } catch {
      setCommentEditError("La modification n’a pas pu être enregistrée.");
    } finally {
      setCommentEditSaving(false);
    }
  }

  return (
    <article className={`flex flex-col overflow-hidden rounded-xl border border-border bg-card p-3 shadow-sm sm:p-4 ${hasImages ? "h-[32rem]" : "h-auto"}`}>
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-foreground">
          {post.author.username.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="truncate text-sm text-foreground">
            {post.author.username}
          </div>
          <div className="font-musical text-xs text-muted-foreground">
            {formatRelative(post.createdAt)}
          </div>
        </div>
        {post.author.id === currentUserId && (
          <div className="ml-auto flex gap-1">
            <button type="button" aria-label="Modifier la publication" onClick={() => { setEditContent(post.content ?? ""); setEditError(null); setEditOpen(true); }} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"><Pencil className="h-4 w-4" /></button>
            <DeleteConfirmationDialog entity="post" onConfirm={async () => { await deleteFeedPost(post.id); await onChanged(); }} trigger={<button type="button" aria-label={t("deleteDialog.post.trigger")} className="min-h-11 min-w-11 rounded-md p-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>} />
          </div>
        )}
      </div>
      {post.content && <p className={`text-body mb-3 whitespace-pre-wrap break-words text-foreground ${hasImages ? "line-clamp-4" : "line-clamp-8"}`}>{post.content}</p>}
      {post.attachments.length > 0 && (
        <div className="mb-3 grid h-64 shrink-0 grid-cols-2 gap-1 overflow-hidden rounded-lg bg-secondary">
          {post.attachments.slice(0, 4).map((attachment, index) => <div key={attachment.id} className={`relative overflow-hidden ${post.attachments.length === 1 ? 'col-span-2' : ''}`}><img src={attachment.upload.storagePath} alt={`Image ${index + 1} de la publication`} className="h-full w-full object-cover" loading="lazy" />{index === 3 && post.attachments.length > 4 && <span className="absolute inset-0 grid place-items-center bg-black/60 text-xl font-semibold text-white">+{post.attachments.length - 4}</span>}</div>)}
        </div>
      )}
      <Dialog open={editOpen} onOpenChange={(open) => { if (!editSaving) setEditOpen(open); }}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-xl rounded-xl p-0">
          <DialogHeader className="border-b border-border px-5 py-4 text-left">
            <DialogTitle>Modifier la publication</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 px-5 pb-5">
            <div>
              <label htmlFor={`edit-post-${post.id}`} className="mb-2 block text-sm font-medium text-foreground">Votre texte</label>
              <textarea id={`edit-post-${post.id}`} value={editContent} onChange={(event) => { setEditContent(event.target.value); setEditError(null); }} maxLength={10000} rows={6} autoFocus className="w-full resize-y rounded-lg border border-border bg-secondary p-3 text-sm text-foreground outline-none transition-shadow placeholder:text-muted-foreground focus:ring-2 focus:ring-primary" placeholder={hasImages ? "Ajoutez une légende…" : "Écrivez quelque chose…"} />
              <div className="mt-1 flex justify-between gap-3 text-xs">
                <span className="text-destructive">{editError}</span>
                <span className="ml-auto text-muted-foreground">{editContent.length}/10 000</span>
              </div>
            </div>
            {hasImages && <div className="flex gap-2 overflow-x-auto rounded-lg bg-secondary p-2">{post.attachments.map((attachment) => <img key={attachment.id} src={attachment.upload.storagePath} alt="" className="h-16 w-16 shrink-0 rounded-md object-cover" />)}</div>}
            <div className="flex justify-end gap-2 border-t border-border pt-4">
              <button type="button" disabled={editSaving} onClick={() => setEditOpen(false)} className="min-h-11 rounded-md px-4 text-sm font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-50">Annuler</button>
              <button type="submit" disabled={editSaving || (!editContent.trim() && !hasImages)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50">{editSaving && <Loader2 className="h-4 w-4 animate-spin" />}Enregistrer</button>
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
          aria-label={isLiked ? "Retirer la réaction" : "Réagir à la publication"}
        >
          <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
          <span>{post.likeCount} {post.likeCount <= 1 ? "like" : "likes"}</span>
        </button>
        <button type="button" onClick={async () => { setCommentsOpen(true); setCommentsLoading(true); try { const rows = await fetchPostComments(post.id); setDialogComments(rows); setHasMoreComments(rows.length === 20); } finally { setCommentsLoading(false); } }} className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 hover:bg-secondary" aria-label="Afficher les commentaires">
          <MessageCircle className="h-3.5 w-3.5" />
          {post.commentCount}
        </button>
      </div>
      <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}><DialogContent className="max-h-[85vh]"><DialogHeader><DialogTitle>Commentaires</DialogTitle></DialogHeader>
        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-2" onScroll={async (event: UIEvent<HTMLDivElement>) => { const el = event.currentTarget; if (!commentsLoading && hasMoreComments && el.scrollHeight - el.scrollTop - el.clientHeight < 80) { setCommentsLoading(true); try { const rows = await fetchPostComments(post.id, dialogComments.length); setDialogComments((current) => [...current, ...rows]); setHasMoreComments(rows.length === 20); } finally { setCommentsLoading(false); } } }}>
          {dialogComments.map((c) => (
            <article key={c.id} className="rounded-lg border border-border bg-card p-3 text-sm">
              <header className="mb-2 flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-xs font-semibold text-foreground">
                  {c.author.profile?.avatarUrl ? <img src={c.author.profile.avatarUrl} alt={`Avatar de ${c.author.username}`} className="h-full w-full object-cover" loading="lazy" /> : c.author.username.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-foreground">{c.author.username}</div>
                  <div className="text-xs text-muted-foreground">{formatRelative(c.createdAt)}</div>
                </div>
                {c.author.id === currentUserId && (
                  <div className="flex shrink-0 gap-1">
                    <button type="button" aria-label="Modifier le commentaire" disabled={commentEditSaving} onClick={() => { setEditingCommentId(c.id); setEditingCommentContent(c.content); setCommentEditError(null); }} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50"><Pencil className="h-3.5 w-3.5" /></button>
                    <DeleteConfirmationDialog entity="comment" onConfirm={async () => { await deleteFeedComment(c.id); setDialogComments((current) => current.filter((item) => item.id !== c.id)); await onChanged(); }} trigger={<button type="button" aria-label={t("deleteDialog.comment.trigger")} className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>} />
                  </div>
                )}
              </header>
              {editingCommentId === c.id ? (
                <div className="space-y-2 pl-11">
                  <textarea value={editingCommentContent} onChange={(event) => { setEditingCommentContent(event.target.value); setCommentEditError(null); }} maxLength={5000} rows={3} autoFocus aria-label="Contenu du commentaire" className="w-full resize-y rounded-lg border border-border bg-secondary p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary" />
                  <div className="flex items-center gap-2">
                    {commentEditError && <span className="mr-auto text-xs text-destructive">{commentEditError}</span>}
                    {!commentEditError && <span className="mr-auto text-xs text-muted-foreground">{editingCommentContent.length}/5 000</span>}
                    <button type="button" disabled={commentEditSaving} onClick={() => { setEditingCommentId(null); setCommentEditError(null); }} className="inline-flex min-h-9 items-center gap-1 rounded-md px-3 text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50"><X className="h-3.5 w-3.5" />Annuler</button>
                    <button type="button" disabled={commentEditSaving || !editingCommentContent.trim()} onClick={() => void saveCommentEdit(c.id)} className="inline-flex min-h-9 items-center gap-1 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground disabled:opacity-50">{commentEditSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}Enregistrer</button>
                  </div>
                </div>
              ) : <p className="whitespace-pre-wrap break-words pl-11 text-foreground/90">{c.content}</p>}
            </article>
          ))}
          {!commentsLoading && dialogComments.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">Aucun commentaire.</p>}
          {commentsLoading && <Loader2 className="mx-auto h-5 w-5 animate-spin" />}
        </div>
      </DialogContent></Dialog>
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
          placeholder="Add a comment…"
          className="min-h-[44px] w-full flex-1 rounded-md border border-border bg-secondary px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={submitting || !comment.trim()}
          className="min-h-[44px] shrink-0 rounded-md bg-primary px-4 text-sm text-primary-foreground disabled:opacity-50"
        >
          Post
        </button>
      </form>
    </article>
  );
}

const LegacyFeedPage = () => {
  const { user, status } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);
  const [images, setImages] = useState<File[]>([]);

  const postsQuery = useQuery({
    queryKey: ["feed-posts"],
    queryFn: fetchFeedPosts,
    enabled: status === "authenticated",
    retry: 1,
  });

  const createPostMutation = useMutation({
    mutationFn: createFeedPost,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
      setDraft("");
      setComposerOpen(false);
      setImages([]);
    },
  });

  async function handleComment(postId: string, content: string) {
    if (!user) return;
    await createFeedComment({
      postId,
      content,
      authorId: user.id,
    });
    await queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
  }

  async function handleToggleLike(post: FeedPost) {
    if (!user) return;
    const existingLike = post.likes.find((like) => like.userId === user.id);
    if (existingLike) await deleteFeedLike(existingLike.id);
    else await createFeedLike(post.id, user.id);
    await queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
  }

  async function refreshFeed() {
    await queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
  }

  async function handleCreatePost(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || (!draft.trim() && images.length === 0) || images.length > 6) return;
    const uploaded = images.length ? await uploadImages(images) : [];
    createPostMutation.mutate({
      ...(draft.trim() ? { content: draft.trim() } : {}),
      authorId: user.id,
      imageUploadIds: uploaded.map((item) => item.id),
    });
  }

  const errorMessage = postsQuery.error
    ? "Unable to load the feed. Please try again later."
    : null;

  return (
    <div className={`${PAGE_SHELL} max-w-xl lg:max-w-xl`}>
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
        <h1 className={`${PAGE_TITLE} mb-0`}>Feed</h1>
        <button
          type="button"
          onClick={() => setComposerOpen((v) => !v)}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-md border border-border bg-card p-2 text-muted-foreground transition-colors hover:text-foreground"
          aria-label="New post"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {composerOpen && user && (
        <form
          onSubmit={handleCreatePost}
          className="mb-4 rounded-lg border border-border bg-card p-3 sm:p-4"
        >
          <textarea
            value={draft}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setDraft(e.target.value)
            }
            placeholder="Share a progression, tip, or practice note…"
            rows={3}
            className="w-full resize-none rounded-md border border-border bg-secondary p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <div className="mt-2 flex justify-end">
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => setImages(Array.from(event.target.files ?? []).slice(0, 6))} className="mr-auto max-w-[65%] text-xs text-muted-foreground" />
            <button
              type="submit"
              disabled={createPostMutation.isPending || (!draft.trim() && images.length === 0)}
              className="min-h-[44px] rounded-md bg-primary px-4 text-sm text-primary-foreground disabled:opacity-50"
            >
              {createPostMutation.isPending ? "Publishing…" : "Publish"}
            </button>
          </div>
        </form>
      )}

      {postsQuery.isLoading && (
        <div className="flex justify-center py-12 text-muted-foreground sm:py-16">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          {errorMessage}
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        {(postsQuery.data ?? []).map((post) => (
          <FeedCard key={post.id} post={post} onComment={handleComment} currentUserId={user?.id ?? ""} onToggleLike={handleToggleLike} onChanged={refreshFeed} />
        ))}
      </div>

      {postsQuery.isSuccess && (postsQuery.data?.length ?? 0) === 0 && (
        <p className="py-10 text-center text-sm text-muted-foreground sm:py-12">
          No posts yet. Be the first to share something.
        </p>
      )}
    </div>
  );
};

const FeedPage = () => {
  const { t } = useTranslation();
  const { user, postsQuery, createPost, comment, toggleLike, refresh } = useFeed();
  const [composerOpen, setComposerOpen] = useState(false);
  return <div className={`${PAGE_SHELL} max-w-xl lg:max-w-xl`}>
    <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
      <h1 className={`${PAGE_TITLE} mb-0`}>{t("feed.title")}</h1>
      <button type="button" onClick={() => setComposerOpen((value) => !value)} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground" aria-label={t("feed.newPost")}><Plus className="h-4 w-4" /></button>
    </div>
    {composerOpen && user && <PostComposer pending={createPost.isPending} onSubmit={async (content, images) => { await createPost.mutateAsync({ content, images }); setComposerOpen(false); }} />}
    {postsQuery.isLoading && <div className="flex justify-center py-12 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>}
    {postsQuery.error && <div className="mb-4 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">{t("feed.loadError")}</div>}
    <div className="space-y-3 sm:space-y-4">{(postsQuery.data ?? []).map((post) => <FeedCard key={post.id} post={post} onComment={comment} currentUserId={user?.id ?? ""} onToggleLike={toggleLike} onChanged={refresh} />)}</div>
    {postsQuery.isSuccess && !postsQuery.data?.length && <p className="py-10 text-center text-sm text-muted-foreground">{t("feed.empty")}</p>}
  </div>;
};

void LegacyFeedPage;
export default FeedPage;
