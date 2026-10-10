import { GRAPHQL_URL } from "@/services/backend";
import { getAccessToken } from "@/services/authToken";
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

  const token = getAccessToken();
  const response = await fetch(`${ENDPOINT}?${params.toString()}`, {
    signal,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Lyrics request failed");
  return response.json() as Promise<Lyrics>;
}

function authHeaders(json = false): HeadersInit {
  const token = getAccessToken();
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface ReportLyricsInput {
  provider: string;
  trackId: string;
  title: string;
  artist: string;
  reason: string;
  proposedLyrics?: string;
}

export async function reportLyrics(input: ReportLyricsInput): Promise<void> {
  const response = await fetch(`${ENDPOINT}/report`, {
    method: "POST",
    headers: authHeaders(true),
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error("Lyrics report failed");
}

export async function getLyricsOverride(
  provider: string,
  trackId: string,
  title: string,
  artist: string,
): Promise<Lyrics | null> {
  const params = new URLSearchParams({ provider, trackId, title, artist });
  const response = await fetch(`${ENDPOINT}/override?${params.toString()}`, {
    headers: authHeaders(),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Lyrics override request failed");
  return response.json() as Promise<Lyrics>;
}

export interface SaveLyricsOverrideInput {
  provider: string;
  trackId: string;
  title: string;
  artist: string;
  plainLyrics: string;
}

export async function saveLyricsOverride(
  input: SaveLyricsOverrideInput,
): Promise<void> {
  const response = await fetch(`${ENDPOINT}/override`, {
    method: "PUT",
    headers: authHeaders(true),
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error("Lyrics override save failed");
}
