import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { PAGE_SHELL } from "@/constants/navigation";
import { useAuth } from "@/hooks/useAuth";
import {
  createFeedComment,
  createFeedLike,
  deleteFeedLike,
  fetchFeedPost,
} from "@/services/api";
import { FeedCard } from "@/pages/FeedPage";
import type { FeedPost } from "@/types/feed";
import { FeedSkeleton } from "@/components/skeletons/AppSkeletons";

export default function PostPage() {
  const { postId } = useParams();
  const { user } = useAuth();
  const client = useQueryClient();
  const post = useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchFeedPost(postId!),
    enabled: Boolean(postId),
  });
  const refresh = async () => {
    await client.invalidateQueries({ queryKey: ["post", postId] });
  };
  const comment = async (id: string, content: string) => {
    if (!user) throw new Error("Unauthenticated");
    const created = await createFeedComment({
      postId: id,
      content,
      authorId: user.id,
    });
    await refresh();
    return created;
  };
  const toggleLike = async (row: FeedPost) => {
    if (!user) return;
    if (row.viewerLikeId) await deleteFeedLike(row.viewerLikeId);
    else await createFeedLike(row.id, user.id);
    await refresh();
  };
  return (
    <main className={`${PAGE_SHELL} max-w-xl lg:max-w-xl`}>
      <Link
        to="/notifications"
        className="mb-5 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Notifications
      </Link>
      {post.isLoading && <FeedSkeleton count={1} />}
      {post.data && (
        <FeedCard
          post={post.data}
          onComment={comment}
          currentUserId={user?.id ?? ""}
          onToggleLike={toggleLike}
          onChanged={refresh}
        />
      )}{" "}
      {post.isSuccess && !post.data && (
        <p className="rounded-lg border bg-card p-5 text-sm text-muted-foreground">
          Cette publication n’est plus disponible.
        </p>
      )}
    </main>
  );
}
