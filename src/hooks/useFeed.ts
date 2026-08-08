import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { createFeedComment, createFeedLike, createFeedPost, deleteFeedLike, fetchFeedPosts, uploadImages } from "@/services/api";
import type { FeedPost } from "@/types/feed";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export function useFeed() {
  const { user, status } = useAuth();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const postsQuery = useQuery({ queryKey: ["feed-posts"], queryFn: fetchFeedPosts, enabled: status === "authenticated", retry: 1 });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["feed-posts"] });
  const createPost = useMutation({
    mutationFn: async ({ content, images }: { content: string; images: File[] }) => {
      if (!user) throw new Error("Unauthenticated");
      const toastId = toast.loading(t(images.length ? "feed.uploadingPost" : "feed.publishing"));
      try {
        const uploaded = images.length ? await uploadImages(images) : [];
        const post = await createFeedPost({ ...(content.trim() ? { content: content.trim() } : {}), authorId: user.id, imageUploadIds: uploaded.map(({ id }) => id) });
        toast.success(t("feed.postCreated"), { id: toastId });
        return post;
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("feed.postCreateError"), { id: toastId });
        throw error;
      }
    },
    onSuccess: refresh,
  });
  const comment = async (postId: string, content: string) => {
    if (!user) return;
    const toastId = toast.loading(t("feed.commentPublishing"));
    try { await createFeedComment({ postId, content, authorId: user.id }); await refresh(); toast.success(t("feed.commentCreated"), { id: toastId }); }
    catch (error) { toast.error(t("feed.commentCreateError"), { id: toastId }); throw error; }
  };
  const toggleLike = async (post: FeedPost) => { if (!user) return; const like = post.likes.find(({ userId }) => userId === user.id); if (like) await deleteFeedLike(like.id); else await createFeedLike(post.id, user.id); await refresh(); };
  return { user, postsQuery, createPost, comment, toggleLike, refresh };
}
