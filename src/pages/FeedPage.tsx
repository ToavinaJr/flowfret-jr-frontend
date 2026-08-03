import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Loader2, MessageCircle, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import {
  createFeedComment,
  createFeedPost,
  fetchFeedPosts,
} from "@/services/api";
import { ApiClientError } from "@/types/api";
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
}

function FeedCard({ post, onComment }: FeedCardProps) {
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
    <article className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-sm font-medium text-foreground">
          {post.author.username.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <div className="text-sm text-foreground">{post.author.username}</div>
          <div className="text-xs font-musical text-muted-foreground">
            {formatRelative(post.createdAt)}
          </div>
        </div>
      </div>
      <p className="text-body text-foreground mb-3 whitespace-pre-wrap">
        {post.content}
      </p>
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        <span>{post.likeCount} likes</span>
        <span className="inline-flex items-center gap-1">
          <MessageCircle className="h-3.5 w-3.5" />
          {post.commentCount}
        </span>
      </div>
      {post.comments.length > 0 && (
        <div className="space-y-2 mb-3 border-t border-border pt-3">
          {post.comments.slice(0, 5).map((c) => (
            <div key={c.id} className="text-sm">
              <span className="text-foreground font-medium">
                {c.author.username}
              </span>{" "}
              <span className="text-muted-foreground">{c.content}</span>
            </div>
          ))}
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={comment}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setComment(e.target.value)
          }
          placeholder="Add a comment…"
          className="flex-1 min-h-[44px] px-3 rounded-md bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={submitting || !comment.trim()}
          className="min-h-[44px] px-4 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-50"
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

  function handleCreatePost(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user || !draft.trim()) return;
    createPostMutation.mutate({
      content: draft.trim(),
      authorId: user.id,
    });
  }

  const errorMessage =
    postsQuery.error instanceof ApiClientError
      ? postsQuery.error.message
      : postsQuery.error
        ? "Could not load feed. Is the backend running?"
        : null;

  return (
    <div className="max-w-[600px] mx-auto px-4 py-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-display text-foreground">Feed</h1>
        <button
          type="button"
          onClick={() => setComposerOpen((v) => !v)}
          className="min-h-[44px] min-w-[44px] p-2 rounded-md bg-card border border-border text-muted-foreground hover:text-foreground transition-colors"
          aria-label="New post"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {composerOpen && user && (
        <form
          onSubmit={handleCreatePost}
          className="bg-card border border-border rounded-lg p-4 mb-4"
        >
          <textarea
            value={draft}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setDraft(e.target.value)
            }
            placeholder="Share a progression, tip, or practice note…"
            rows={3}
            className="w-full rounded-md bg-secondary border border-border p-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          />
          <div className="flex justify-end mt-2">
            <button
              type="submit"
              disabled={createPostMutation.isPending || !draft.trim()}
              className="min-h-[44px] px-4 rounded-md bg-primary text-primary-foreground text-sm disabled:opacity-50"
            >
              {createPostMutation.isPending ? "Publishing…" : "Publish"}
            </button>
          </div>
        </form>
      )}

      {postsQuery.isLoading && (
        <div className="flex justify-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      )}

      {errorMessage && (
        <div className="bg-card border border-border rounded-lg p-4 text-sm text-muted-foreground mb-4">
          {errorMessage}
          <p className="mt-2 text-xs">
            Start <code className="font-musical">backend-guitare-app</code> on
            port 3000, then refresh.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {(postsQuery.data ?? []).map((post) => (
          <FeedCard key={post.id} post={post} onComment={handleComment} />
        ))}
      </div>

      {postsQuery.isSuccess && (postsQuery.data?.length ?? 0) === 0 && (
        <p className="text-center text-sm text-muted-foreground py-12">
          No posts yet. Be the first to share something.
        </p>
      )}
    </div>
  );
};

export default FeedPage;
