import { useState } from "react";
import { Plus } from "lucide-react";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { useTranslation } from "react-i18next";
import { useFeed } from "@/hooks/useFeed";
import { PostComposer } from "@/components/feed/PostComposer";
import { FeedCard } from "@/components/feed/FeedCard";
import { FeedSkeleton } from "@/components/skeletons/AppSkeletons";
import type { FeedPost } from "@/types/feed";

export { FeedCard } from "@/components/feed/FeedCard";
export type { FeedCardProps } from "@/components/feed/FeedCard";

const FeedPage = () => {
  const { t } = useTranslation();
  const { user, postsQuery, createPost, comment, toggleLike, refresh } =
    useFeed();
  const [composerOpen, setComposerOpen] = useState(false);
  return (
    <div className={`${PAGE_SHELL} max-w-xl lg:max-w-xl`}>
      <div className="mb-4 flex items-center justify-between gap-3 sm:mb-6">
        <h1 className={`${PAGE_TITLE} mb-0`}>{t("feed.title")}</h1>
        <button
          type="button"
          onClick={() => setComposerOpen((value) => !value)}
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-border bg-card text-muted-foreground hover:text-foreground"
          aria-label={t("feed.newPost")}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {composerOpen && user && (
        <PostComposer
          pending={createPost.isPending}
          onSubmit={async (content, images) => {
            await createPost.mutateAsync({ content, images });
            setComposerOpen(false);
          }}
        />
      )}
      {postsQuery.isLoading && <FeedSkeleton />}
      {postsQuery.error && (
        <div className="mb-4 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          {t("feed.loadError")}
        </div>
      )}
      <div className="space-y-3 sm:space-y-4">
        {(postsQuery.data ?? []).map((post: FeedPost) => (
          <FeedCard
            key={post.id}
            post={post}
            onComment={comment}
            currentUserId={user?.id ?? ""}
            onToggleLike={toggleLike}
            onChanged={refresh}
          />
        ))}
      </div>
      {postsQuery.isSuccess && !postsQuery.data?.length && (
        <p className="py-10 text-center text-sm text-muted-foreground">
          {t("feed.empty")}
        </p>
      )}
    </div>
  );
};

export default FeedPage;
