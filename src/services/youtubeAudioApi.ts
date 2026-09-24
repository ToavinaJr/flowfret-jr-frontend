import { getAccessToken } from "@/services/authToken";
import { GRAPHQL_URL } from "@/services/backend";

const API_ORIGIN = new URL(GRAPHQL_URL).origin;
const VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

export function getYouTubeAudioRequest(videoId: string): {
  url: string;
  headers: HeadersInit;
} | null {
  if (!VIDEO_ID_PATTERN.test(videoId)) return null;
  const token = getAccessToken();
  return {
    url: `${API_ORIGIN}/api/youtube/${encodeURIComponent(videoId)}/audio`,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  };
}
