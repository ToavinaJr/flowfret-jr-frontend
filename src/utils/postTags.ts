const TAG_PATTERN = /(^|[^\p{L}\p{N}._%+-])@([\p{L}\p{N}_]{1,30})/gu;

export function extractPostTags(content: string): string[] {
  const tags: string[] = [];
  for (const match of content.matchAll(TAG_PATTERN)) {
    const name = match[2].normalize("NFKC").toLocaleLowerCase("en-US");
    if (!tags.includes(name)) tags.push(name);
    if (tags.length === 10) break;
  }
  return tags;
}
