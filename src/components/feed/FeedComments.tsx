import {
  useState,
  type FormEvent,
  type ReactNode,
  type UIEvent,
} from "react";
import { MessageCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { fetchPostComments } from "@/services/api";
import type { FeedComment, FeedPost } from "@/types/feed";
import { CommentsSkeleton } from "@/components/skeletons/AppSkeletons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FeedCommentItem } from "./FeedCommentItem";
import { MentionInput } from "./MentionInput";

const PAGE_SIZE = 20;

interface FeedCommentsProps {
  post: FeedPost;
  currentUserId: string;
  onComment: (postId: string, content: string) => Promise<FeedComment>;
  onChanged: () => Promise<void>;
  leadingAction?: ReactNode;
}

export function FeedComments({
  post,
  currentUserId,
  onComment,
  onChanged,
  leadingAction,
}: FeedCommentsProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<FeedComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  async function load(offset = 0) {
    if (loading) return;
    setLoading(true);
    try {
      const rows = await fetchPostComments(post.id, offset);
      setComments((current) => (offset ? [...current, ...rows] : rows));
      setHasMore(rows.length === PAGE_SIZE);
    } finally {
      setLoading(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = draft.trim();
    if (!content) return;
    setSubmitting(true);
    try {
      const created = await onComment(post.id, content);
      const rows = await fetchPostComments(post.id);
      setComments(rows.length ? rows : [created]);
      setHasMore(rows.length === PAGE_SIZE);
      setDraft("");
      setOpen(true);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleScroll(event: UIEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    if (
      !loading &&
      hasMore &&
      element.scrollHeight - element.scrollTop - element.clientHeight < 80
    ) {
      await load(comments.length);
    }
  }

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {leadingAction}
        <button
          type="button"
          onClick={() => {
            setOpen(true);
            void load();
          }}
          className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 hover:bg-secondary"
          aria-label={t("feed.showComments")}
        >
          <MessageCircle className="h-3.5 w-3.5" />
          {post.commentCount}
        </button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>{t("feed.comments")}</DialogTitle>
          </DialogHeader>
          <div
            className="max-h-[60vh] space-y-3 overflow-y-auto pr-2"
            onScroll={(event) => void handleScroll(event)}
          >
            {comments.map((comment) => (
              <FeedCommentItem
                key={comment.id}
                comment={comment}
                currentUserId={currentUserId}
                onUpdated={(updated) =>
                  setComments((current) =>
                    current.map((item) =>
                      item.id === updated.id ? updated : item,
                    ),
                  )
                }
                onDeleted={(id) =>
                  setComments((current) =>
                    current.filter((item) => item.id !== id),
                  )
                }
                onChanged={onChanged}
              />
            ))}
            {!loading && comments.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {t("feed.noComments")}
              </p>
            )}
            {loading && <CommentsSkeleton />}
          </div>
        </DialogContent>
      </Dialog>
      <form
        onSubmit={submit}
        className="mt-auto flex flex-col gap-2 border-t border-border pt-3 sm:flex-row"
      >
        <MentionInput
          value={draft}
          onChange={setDraft}
          rows={1}
          maxLength={5000}
          placeholder={t("feed.addComment")}
          className="min-h-[44px] w-full resize-none rounded-md border border-border bg-secondary px-3 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          type="submit"
          disabled={submitting || !draft.trim()}
          className="min-h-[44px] shrink-0 rounded-md bg-primary px-4 text-sm text-primary-foreground disabled:opacity-50"
        >
          {t("feed.postComment")}
        </button>
      </form>
    </>
  );
}
