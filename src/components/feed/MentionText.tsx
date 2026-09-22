import { Link } from "react-router-dom";
import type { FeedAuthor } from "@/types/feed";
import { mentionSegments } from "@/utils/mentions";

interface MentionTextProps {
  content: string;
  mentionedUsers: FeedAuthor[];
  className?: string;
}

export function MentionText({
  content,
  mentionedUsers,
  className,
}: MentionTextProps) {
  return (
    <span className={className}>
      {mentionSegments(content, mentionedUsers).map((segment, index) =>
        segment.user ? (
          <Link
            key={`${index}-${segment.user.id}`}
            to={`/profile/${segment.user.id}`}
            className="rounded bg-sky-100 px-0.5 font-semibold text-sky-700 hover:bg-sky-200 hover:underline dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-900/70"
          >
            {segment.text}
          </Link>
        ) : (
          segment.text
        ),
      )}
    </span>
  );
}
