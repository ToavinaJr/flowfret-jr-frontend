import type { PlaybackItem } from "@/contexts/playback-context";
import { GRAPHQL_URL } from "./backend";
import { getAccessToken } from "./authToken";

export interface AudioStems {
  audioStemId: string;
  status: "PENDING" | "DOWNLOADING" | "PROCESSING" | "COMPLETED" | "FAILED";
  progress: number;
  simulated?: boolean;
  vocalsUrl: string | null;
  instrumentalUrl: string | null;
  error?: { code: string } | null;
}

export type VocalRemovalFailureReason =
  | "unsupportedSource"
  | "sourceUnavailable"
  | "sourceExpired"
  | "sourceExtractionFailed"
  | "extractorUnavailable"
  | "sourceTooLarge"
  | "sourceTooLong"
  | "queueBusy"
  | "serviceUnavailable"
  | "separationTimedOut"
  | "separationFailed"
  | "storageFailed"
  | "authenticationRequired"
  | "accessDenied"
  | "rateLimited"
  | "requestTimedOut"
  | "networkUnavailable"
  | "audioLoadFailed"
  | "retryLimitReached"
  | "generic";

const failureReasons: Record<string, VocalRemovalFailureReason> = {
  AUDIO_STEM_PROVIDER_UNSUPPORTED: "unsupportedSource",
  PROVIDER_UNSUPPORTED: "unsupportedSource",
  AUDIO_DOWNLOAD_FAILED: "sourceUnavailable",
  YOUTUBE_AUDIO_EXTRACTION_FAILED: "sourceExtractionFailed",
  YOUTUBE_EXTRACTOR_UNAVAILABLE: "extractorUnavailable",
  AUDIO_URL_EXPIRED: "sourceExpired",
  AUDIO_TOO_LARGE: "sourceTooLarge",
  AUDIO_TOO_LONG: "sourceTooLong",
  AUDIO_STEM_QUEUE_SATURATED: "queueBusy",
  QUEUE_SATURATED: "queueBusy",
  REDIS_UNAVAILABLE: "queueBusy",
  DATABASE_UNAVAILABLE: "serviceUnavailable",
  AUDIO_STEM_NOT_FOUND: "serviceUnavailable",
  AUDIO_STEM_ALREADY_RUNNING: "retryLimitReached",
  DEMUCS_TIMEOUT: "separationTimedOut",
  DEMUCS_FAILED: "separationFailed",
  AUDIO_STEM_UPLOAD_FAILED: "storageFailed",
  AUTHENTICATION_REQUIRED: "authenticationRequired",
  UNAUTHORIZED: "authenticationRequired",
  RATE_LIMITED: "rateLimited",
  HTTP_401: "authenticationRequired",
  STEMS_HTTP_401: "authenticationRequired",
  HTTP_403: "accessDenied",
  HTTP_404: "serviceUnavailable",
  HTTP_409: "retryLimitReached",
  HTTP_429: "rateLimited",
  STEMS_HTTP_429: "rateLimited",
  HTTP_413: "sourceTooLong",
  HTTP_408: "requestTimedOut",
  HTTP_504: "requestTimedOut",
};

export function vocalRemovalFailureReason(code: string | null): VocalRemovalFailureReason {
  if (!code) return "generic";
  if (Object.prototype.hasOwnProperty.call(failureReasons, code)) return failureReasons[code] ?? "generic";
  if (/^(STEMS_)?HTTP_5\d\d$/.test(code)) return "serviceUnavailable";
  if (code === "REQUEST_TIMEOUT" || code === "TimeoutError") return "requestTimedOut";
  if (code === "NETWORK_ERROR" || code === "TypeError") return "networkUnavailable";
  if (code === "STEM_DOWNLOAD_FAILED" || code === "STEM_TOO_LARGE") return "audioLoadFailed";
  return "generic";
}

const endpoint = `${new URL(GRAPHQL_URL).origin}/api/audio-stems`;

export function supportsVocalRemoval(item: PlaybackItem | null): boolean {
  return Boolean(item?.providerTrackId && (item.provider === "AUDIUS" || item.provider === "YOUTUBE"));
}

function audioUrl(value: unknown): value is string | null {
  if (value === null) return true;
  if (typeof value !== "string") return false;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

function stemStatus(value: unknown): value is AudioStems["status"] {
  return typeof value === "string" && ["PENDING", "DOWNLOADING", "PROCESSING", "COMPLETED", "FAILED"].includes(value);
}

export function parseAudioStems(value: unknown): AudioStems {
  if (!value || typeof value !== "object") throw new Error("INVALID_STEMS_RESPONSE");
  const row = value as Record<string, unknown>;
  const error = row.error && typeof row.error === "object" && "code" in row.error &&
    typeof (row.error as { code?: unknown }).code === "string"
    ? { code: (row.error as { code: string }).code }
    : null;
  if (typeof row.audioStemId !== "string" || !/^[a-f\d-]{36}$/i.test(row.audioStemId) ||
    !stemStatus(row.status) ||
    typeof row.progress !== "number" || !Number.isFinite(row.progress) ||
    !audioUrl(row.vocalsUrl) || !audioUrl(row.instrumentalUrl) ||
    (row.status === "COMPLETED" && (!row.vocalsUrl || !row.instrumentalUrl))) {
    throw new Error("INVALID_STEMS_RESPONSE");
  }
  return {
    audioStemId: row.audioStemId,
    status: row.status,
    progress: row.progress,
    ...(typeof row.simulated === "boolean" ? { simulated: row.simulated } : {}),
    vocalsUrl: row.vocalsUrl,
    instrumentalUrl: row.instrumentalUrl,
    ...(Object.prototype.hasOwnProperty.call(row, "error") ? { error } : {}),
  };
}

async function request(path: string, signal: AbortSignal, body?: object): Promise<AudioStems> {
  const token = getAccessToken();
  const response = await fetch(`${endpoint}${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${token ?? ""}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.any([signal, AbortSignal.timeout(30_000)]),
  });
  if (!response.ok) {
    let code = `HTTP_${response.status}`;
    try {
      const payload: unknown = await response.json();
      if (payload && typeof payload === "object" && "code" in payload &&
        typeof (payload as { code?: unknown }).code === "string") {
        code = (payload as { code: string }).code;
      }
    } catch {
      // Keep the status-based reason when the server did not return JSON.
    }
    throw new Error(code);
  }
  return parseAudioStems(await response.json());
}

export function createAudioStems(item: PlaybackItem, signal: AbortSignal) {
  if (!supportsVocalRemoval(item)) throw new Error("STEMS_UNSUPPORTED");
  return request("", signal, {
    provider: item.provider,
    trackId: item.providerTrackId,
    audioUrl: item.provider === "YOUTUBE"
      ? `https://www.youtube.com/watch?v=${encodeURIComponent(item.providerTrackId!)}`
      : item.streamUrl || item.src,
    title: item.title || undefined,
    artist: item.artist || undefined,
  });
}

export function getAudioStems(id: string, signal: AbortSignal) {
  return request(`/${encodeURIComponent(id)}`, signal);
}
