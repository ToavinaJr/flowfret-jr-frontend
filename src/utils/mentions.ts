import type { FeedAuthor } from "@/types/feed";

const MENTION_PATTERN = /(^|[^\p{L}\p{N}._%+-])@([\p{L}\p{N}_]{1,50})/gu;

export interface MentionSegment {
  text: string;
  user?: FeedAuthor;
}

export function mentionSegments(
  content: string,
  mentionedUsers: FeedAuthor[],
): MentionSegment[] {
  const users = new Map(
    mentionedUsers.map((user) => [user.username.toLowerCase(), user]),
  );
  const segments: MentionSegment[] = [];
  const appendText = (text: string) => {
    if (!text) return;
    const previous = segments[segments.length - 1];
    if (previous && !previous.user) previous.text += text;
    else segments.push({ text });
  };
  let cursor = 0;
  for (const match of content.matchAll(MENTION_PATTERN)) {
    const index = match.index;
    if (index > cursor) appendText(content.slice(cursor, index));
    appendText(match[1]);
    const text = `@${match[2]}`;
    const user = users.get(match[2].toLowerCase());
    if (user) segments.push({ text, user });
    else appendText(text);
    cursor = index + match[0].length;
  }
  if (cursor < content.length) appendText(content.slice(cursor));
  return segments;
}

export function activeMentionAt(
  content: string,
  cursor: number,
): { start: number; query: string } | null {
  const beforeCursor = content.slice(0, cursor);
  const match = beforeCursor.match(
    /(?:^|[^\p{L}\p{N}._%+-])@([\p{L}\p{N}_]{0,50})$/u,
  );
  if (!match) return null;
  return { start: cursor - match[1].length - 1, query: match[1] };
}
