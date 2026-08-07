import { GRAPHQL_URL } from "@/services/backend";
import { getAccessToken } from "@/services/authToken";
import type { TranscriptionEvent, TranscriptionResponse } from "@/types/transcription";

const API_ORIGIN = new URL(GRAPHQL_URL).origin;
const BASE_URL = `${API_ORIGIN}/api/transcriptions`;

function debug(event: string, details: Record<string, unknown> = {}): void {
  console.info(`[FretFlow:transcription] ${event}`, details);
}

function headers(json = false): HeadersInit {
  const token = getAccessToken();
  return { ...(json ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const startedAt = performance.now();
  debug("http.request", {
    method: init?.method ?? "GET",
    path: new URL(url).pathname,
  });
  const response = await fetch(url, init);
  debug("http.response", {
    method: init?.method ?? "GET",
    path: new URL(url).pathname,
    status: response.status,
    elapsedMs: Math.round(performance.now() - startedAt),
  });
  if (!response.ok) {
    const body = await response.text();
    debug("http.error", { status: response.status, body: body.slice(0, 1000) });
    throw new Error(`Transcription request failed (${response.status}): ${body.slice(0, 300)}`);
  }
  const payload = (await response.json()) as T;
  debug("http.payload", {
    transcriptionId: (payload as { transcriptionId?: string }).transcriptionId,
    status: (payload as { status?: string }).status,
    jobId: (payload as { jobId?: string }).jobId,
  });
  return payload;
}

export function getTranscriptionQueueDiagnostics(): Promise<Record<string, unknown>> {
  return request(`${BASE_URL}/diagnostics/queue`, { headers: headers() });
}

export function createTranscription(input: { trackId: string; audioUrl: string; title?: string; artist?: string; language?: string; model?: string }): Promise<TranscriptionResponse> {
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

export async function streamTranscriptionEvents(id: string, signal: AbortSignal, onEvent: (event: TranscriptionEvent) => void): Promise<void> {
  debug("sse.connecting", { transcriptionId: id });
  const response = await fetch(`${BASE_URL}/${encodeURIComponent(id)}/events`, { headers: { ...headers(), Accept: "text/event-stream" }, signal });
  debug("sse.response", { transcriptionId: id, status: response.status, hasBody: Boolean(response.body) });
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
        if (event.type !== "transcription.heartbeat") debug("sse.event", { transcriptionId: id, type: event.type, progress: event.progress, bufferedUntil: event.bufferedUntil });
        onEvent(event);
      }
    }
  }
}

