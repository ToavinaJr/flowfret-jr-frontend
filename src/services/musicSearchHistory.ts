const STORAGE_KEY = "flowfret.music-search-history.v1";
const MAX_RECENT_SEARCHES = 8;

export function readMusicSearchHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter((entry): entry is string => typeof entry === "string").slice(0, MAX_RECENT_SEARCHES);
  } catch {
    return [];
  }
}

export function saveMusicSearch(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return readMusicSearchHistory();
  const next = [trimmed, ...readMusicSearchHistory().filter((entry) => entry.toLocaleLowerCase() !== trimmed.toLocaleLowerCase())].slice(0, MAX_RECENT_SEARCHES);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Search should continue when storage is unavailable or full.
  }
  return next;
}

export function clearMusicSearchHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Search should continue when storage is unavailable.
  }
}
