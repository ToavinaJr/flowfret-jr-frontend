import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { Heart, Loader2, MessageCircle, Plus } from "lucide-react";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  createFeedComment,
  createFeedLike,
  createFeedPost,
  deleteFeedLike,
  fetchFeedPosts,
} from "@/services/api";
import type { FeedPost } from "@/types/feed";

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
}

function FeedCard({ post, onComment, currentUserId, onToggleLike }: FeedCardProps) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [liking, setLiking] = useState(false);
  const isLiked = post.likes.some((like) => like.userId === currentUserId);

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

  return (
    <article className="rounded-lg border border-border bg-card p-3 sm:p-4">
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
      </div>
      <p className="text-body mb-3 whitespace-pre-wrap break-words text-foreground">
        {post.content}
      </p>
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
        <span className="inline-flex items-center gap-1">
          <MessageCircle className="h-3.5 w-3.5" />
          {post.commentCount}
        </span>
      </div>
      {post.comments.length > 0 && (
        <div className="mb-3 space-y-2 border-t border-border pt-3">
          {post.comments.slice(0, 5).map((c) => (
            <div key={c.id} className="break-words text-sm">
              <span className="font-medium text-foreground">
                {c.author.username}
              </span>{" "}
              <span className="text-muted-foreground">{c.content}</span>
            </div>
          ))}
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 sm:flex-row"
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

const FeedPage = () => {
  const { user, status } = useAuth();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState("");
  const [composerOpen, setComposerOpen] = useState(false);

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

  function handleCreatePost(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || !draft.trim()) return;
    createPostMutation.mutate({
      content: draft.trim(),
      authorId: user.id,
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
            <button
              type="submit"
              disabled={createPostMutation.isPending || !draft.trim()}
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
          <FeedCard key={post.id} post={post} onComment={handleComment} currentUserId={user?.id ?? ""} onToggleLike={handleToggleLike} />
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

export default FeedPage;
