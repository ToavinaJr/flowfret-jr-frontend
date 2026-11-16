import type { MusicTrack } from "@/types/music";

export function getRecommendationGenres(tracks: MusicTrack[]): string[] {
  const genres = new Map<string, string>();

  for (const track of tracks) {
    const genre = track.genre?.trim();
    if (!genre) continue;

    const normalizedGenre = genre.toLocaleLowerCase();
    if (!genres.has(normalizedGenre)) genres.set(normalizedGenre, genre);
  }

  return [...genres.entries()]
    .sort(([leftKey, leftLabel], [rightKey, rightLabel]) =>
      leftKey.localeCompare(rightKey) || leftLabel.localeCompare(rightLabel),
    )
    .map(([, label]) => label);
}

export function filterRecommendationsByGenre(
  tracks: MusicTrack[],
  genre: string | null,
): MusicTrack[] {
  if (!genre) return tracks;

  const normalizedGenre = genre.trim().toLocaleLowerCase();
  return tracks.filter(
    (track) => track.genre?.trim().toLocaleLowerCase() === normalizedGenre,
  );
}
