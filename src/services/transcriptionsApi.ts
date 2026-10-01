import { GRAPHQL_URL } from "@/services/backend";
import { getAccessToken } from "@/services/authToken";
import type { TranscriptionEvent, TranscriptionResponse } from "@/types/transcription";
import { debugLog } from "@/utils/debug";
import { runtimeConfig } from "@/config/runtime";

const API_ORIGIN = new URL(GRAPHQL_URL).origin;
const BASE_URL = `${API_ORIGIN}/api/transcriptions`;

export class TranscriptionRateLimitError extends Error {
  readonly statusCode = 429;
  readonly retryAfterSeconds: number | null;

  constructor(retryAfterSeconds: number | null = null, message?: string) {
    super(message ?? "Le service de transcription est temporairement saturé.");
    this.name = "TranscriptionRateLimitError";
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

function headers(json = false): HeadersInit {
  const token = getAccessToken();
  return { ...(json ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

function parseRetryAfter(value: string | null): number | null {
  if (!value) return null;

  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) {
    return Math.max(0, Math.ceil(numericValue));
  }

  const timestamp = Date.parse(value);
  if (!Number.isNaN(timestamp)) {
    return Math.max(0, Math.ceil((timestamp - Date.now()) / 1000));
  }

  return null;
}

function parseErrorBody(rawBody: string): { message?: string; retryAfterSeconds?: number | string } | null {
  if (!rawBody.trim()) return null;
  try {
    const parsed = JSON.parse(rawBody) as unknown;
    if (parsed && typeof parsed === "object") {
      const record = parsed as Record<string, unknown>;
      if (typeof record.message === "string" || typeof record.retryAfterSeconds !== "undefined") {
        return {
          message: typeof record.message === "string" ? record.message : undefined,
          retryAfterSeconds: typeof record.retryAfterSeconds === "number" || typeof record.retryAfterSeconds === "string" ? record.retryAfterSeconds : undefined,
        };
      }
    }
  } catch {
    // Ignore invalid JSON; keep the generic user-facing message.
  }
  return null;
}

export function parseTranscriptionApiError(status: number, rawBody: string, retryAfterHeader: string | null): Error {
  const parsedBody = parseErrorBody(rawBody);
  const parsedRetryAfter = parseRetryAfter(retryAfterHeader) ??
    (typeof parsedBody?.retryAfterSeconds === "number" ? parsedBody.retryAfterSeconds :
      typeof parsedBody?.retryAfterSeconds === "string" ? Number(parsedBody.retryAfterSeconds) : null);

  if (status === 429) {
    const retryAfterSeconds = parsedRetryAfter ?? 30;
    const delayText = retryAfterSeconds > 0 ? ` Nous réessaierons automatiquement dans ${retryAfterSeconds} secondes.` : " Réessayez dans quelques instants.";
    return new TranscriptionRateLimitError(retryAfterSeconds, `Le service de transcription est temporairement saturé.${delayText}`);
  }

  const parsedMessage = parsedBody?.message ?? rawBody;
  if (status === 409 || /Only failed transcriptions can be retried|Retry limit reached|already running|already exists/i.test(parsedMessage)) {
    return new Error("La transcription ne peut pas être relancée pour le moment. Si elle a échoué définitivement, choisissez une autre piste ou réessayez plus tard.");
  }

  if (/Missing required configuration: AUDIUS_ACCESS_TOKEN|AUDIUS_ACCESS_TOKEN/i.test(parsedMessage)) {
    return new Error("La transcription nécessite un token Audius valide. Ajoutez AUDIUS_ACCESS_TOKEN dans votre fichier .env.development.local et redémarrez le worker.");
  }

  if (parsedMessage && /Trop de requêtes|too many requests|temporarily satur/i.test(parsedMessage)) {
    return new TranscriptionRateLimitError(parsedRetryAfter ?? 30, "Le service de transcription est temporairement saturé. Réessayez dans quelques instants.");
  }

  return new Error("La transcription a échoué. Réessayez plus tard.");
}

export function getFriendlyTranscriptionError(error: unknown): string {
  if (error instanceof TranscriptionRateLimitError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "La transcription a échoué. Réessayez plus tard.";
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeoutMs = runtimeConfig.transcriptionHttpTimeoutMs;
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  let response: Response;
  try {
    response = await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted) {
      debugLog("transcription.http.timeout", {
        path: new URL(url).pathname,
        timeoutMs,
      });
      throw new Error(`Le backend de transcription ne répond pas après ${timeoutMs / 1000} secondes`);
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
  if (!response.ok) {
    const body = await response.text();
    const retryAfterHeader = response.headers.get("Retry-After") ?? response.headers.get("retry-after");
    debugLog("transcription.http.error", { status: response.status, retryAfterHeader });
    throw parseTranscriptionApiError(response.status, body, retryAfterHeader);
  }
  return (await response.json()) as T;
}

export function getTranscriptionQueueDiagnostics(): Promise<Record<string, unknown>> {
  return request(`${BASE_URL}/diagnostics/queue`, { headers: headers() });
}
export function listTranscriptions(take = 20): Promise<TranscriptionResponse[]> {
  return request(`${BASE_URL}?take=${encodeURIComponent(String(take))}`, {
    headers: headers(),
  });
}

export function createTranscription(input: { provider?: "AUDIUS" | "SPOTIFY" | "YOUTUBE"; trackId: string; audioUrl: string; title?: string; artist?: string; language?: string; model?: string }): Promise<TranscriptionResponse> {
  return request(BASE_URL, { method: "POST", headers: headers(true), body: JSON.stringify(input) });
}
export function getTranscription(id: string): Promise<TranscriptionResponse> { return request(`${BASE_URL}/${encodeURIComponent(id)}`, { headers: headers() }); }
export function retryTranscription(id: string, audioUrl: string): Promise<TranscriptionResponse> {
  return request(`${BASE_URL}/${encodeURIComponent(id)}/retry`, { method: "POST", headers: headers(true), body: JSON.stringify({ audioUrl }) });
}
export async function downloadTranscriptionLrc(id: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}/lrc`, { headers: headers() });
  if (!response.ok) throw new Error("LRC is not ready");
  const blob = await response.blob();
  const disposition = response.headers.get("Content-Disposition") ?? "";
  const filename = /filename="([^"]+)"/.exec(disposition)?.[1] ?? "lyrics.lrc";
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = filename; link.click(); URL.revokeObjectURL(url);
}

export async function getAdminTranscriptionLrc(id: string): Promise<string> {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}/lrc/admin`, { headers: headers() });
  if (!response.ok) throw new Error('Unable to load LRC');
  const result: unknown = await response.json();
  if (!result || typeof result !== 'object' || !('content' in result) || typeof result.content !== 'string') throw new Error('Invalid LRC response');
  return result.content;
}

export async function saveAdminTranscriptionLrc(id: string, content: string): Promise<void> {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}/lrc/admin`, {
    method: 'PUT', headers: headers(true), body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error('Unable to save LRC');
}

export async function streamTranscriptionEvents(id: string, signal: AbortSignal, onEvent: (event: TranscriptionEvent) => void): Promise<void> {
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}/events`, { headers: { ...headers(), Accept: "text/event-stream" }, signal });
  if (!response.ok || !response.body) {
    const body = await response.text();
    throw new Error(`SSE connection failed (${response.status}): ${body.slice(0, 300)}`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const frames = buffer.split(/\r?\n\r?\n/); buffer = frames.pop() ?? "";
    for (const frame of frames) {
      const data = frame.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trimStart()).join("\n");
      if (!data) continue;
      const parsed: unknown = JSON.parse(data);
      if (parsed && typeof parsed === "object" && "type" in parsed && "transcriptionId" in parsed) {
        const event = parsed as TranscriptionEvent;
        onEvent(event);
      }
    }
  }
}

