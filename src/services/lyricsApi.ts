import { GRAPHQL_URL } from "@/services/backend";
import type { Lyrics, LyricsTrack } from "@/types/lyrics";

const ENDPOINT = `${new URL(GRAPHQL_URL).origin}/api/lyrics`;

export async function getLyrics(track: LyricsTrack, signal?: AbortSignal): Promise<Lyrics | null> {
  const params = new URLSearchParams({
    title: track.title,
    artist: track.artist,
    trackId: track.id,
    provider: track.provider,
  });
  if (track.album) params.set("album", track.album);
  if (track.duration && Number.isFinite(track.duration)) params.set("duration", String(Math.round(track.duration)));

  const response = await fetch(`${ENDPOINT}?${params.toString()}`, { signal });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Lyrics request failed");
  return response.json() as Promise<Lyrics>;
}
