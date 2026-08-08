import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { createFeedComment, createFeedLike, createFeedPost, deleteFeedLike, fetchFeedPosts, uploadImages } from "@/services/api";
import type { FeedPost } from "@/types/feed";

export function useFeed() {
  const { user, status } = useAuth();
  const queryClient = useQueryClient();
  const postsQuery = useQuery({ queryKey: ["feed-posts"], queryFn: fetchFeedPosts, enabled: status === "authenticated", retry: 1 });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
  const createPost = useMutation({
    mutationFn: async ({ content, images }: { content: string; images: File[] }) => {
      if (!user) throw new Error("Unauthenticated");
      const uploaded = images.length ? await uploadImages(images) : [];
      return createFeedPost({ ...(content.trim() ? { content: content.trim() } : {}), authorId: user.id, imageUploadIds: uploaded.map(({ id }) => id) });
    },
    onSuccess: refresh,
  });
  const comment = async (postId: string, content: string) => { if (!user) return; await createFeedComment({ postId, content, authorId: user.id }); await refresh(); };
  const toggleLike = async (post: FeedPost) => { if (!user) return; const like = post.likes.find(({ userId }) => userId === user.id); if (like) await deleteFeedLike(like.id); else await createFeedLike(post.id, user.id); await refresh(); };
  return { user, postsQuery, createPost, comment, toggleLike, refresh };
}
