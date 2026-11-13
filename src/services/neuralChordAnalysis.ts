import { GRAPHQL_URL } from "@/services/backend";
import { getAccessToken } from "@/services/authToken";
import type { ChordCue } from "@/types/song";

export interface NeuralChordAnalysis {
  duration: number;
  cues: ChordCue[];
  beats: number[];
  downbeats: number[];
  engineVersion: "btc-beat-this-v1";
}

export function parseNeuralChordAnalysis(value: unknown): NeuralChordAnalysis {
  if (!value || typeof value !== "object") throw new Error("Invalid chord analysis");
  const result = value as Partial<NeuralChordAnalysis>;
  if (typeof result.duration !== "number" || !Number.isFinite(result.duration) || result.duration <= 0 || result.duration > 900 ||
      result.engineVersion !== "btc-beat-this-v1" || !Array.isArray(result.cues) || result.cues.length === 0 || result.cues.length > 20000) throw new Error("Invalid chord analysis");
  let previousEnd = 0;
  for (const cue of result.cues) {
    if (!cue || !Number.isFinite(cue.start) || !Number.isFinite(cue.end) || cue.start < previousEnd || cue.end <= cue.start ||
        cue.end > result.duration + 0.01 || typeof cue.chord !== "string" || cue.chord.length > 32) throw new Error("Invalid chord timeline");
    previousEnd = cue.end;
  }
  const readBeats = (beats: unknown): number[] => {
    if (!Array.isArray(beats) || beats.length > 10000) throw new Error("Invalid beats");
    let previous = -1;
    return beats.map((beat: unknown) => {
      if (typeof beat !== "number" || !Number.isFinite(beat) || beat < 0 || beat <= previous || beat > result.duration!) throw new Error("Invalid beats");
      previous = beat;
      return beat;
    });
  };
  return { duration: result.duration, cues: result.cues, beats: readBeats(result.beats), downbeats: readBeats(result.downbeats), engineVersion: result.engineVersion };
}

/** Returns null when the server engine is unavailable; the caller must label its local fallback. */
export async function requestNeuralChordAnalysis(file: File, onStart: () => void, signal?: AbortSignal): Promise<NeuralChordAnalysis | null> {
  const token = getAccessToken();
  const base = GRAPHQL_URL.replace(/\/graphql\/?$/, "/api/chords");
  if (!token || base === GRAPHQL_URL) return null;
  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  if (signal?.aborted) controller.abort();
  const timer = window.setTimeout(abort, 910_000);
  const headers = { Authorization: `Bearer ${token}` };
  try {
    const capabilityResponse = await fetch(`${base}/capabilities`, { headers, signal: controller.signal });
    if (!capabilityResponse.ok) return null;
    const capabilities: unknown = await capabilityResponse.json();
    if (!capabilities || typeof capabilities !== "object" || !("neuralAnalysis" in capabilities) || capabilities.neuralAnalysis !== true) return null;
    onStart();
    const body = new FormData();
    body.append("file", file);
    const response = await fetch(`${base}/analyze`, { method: "POST", headers, body, signal: controller.signal });
    if (!response.ok) return null;
    return parseNeuralChordAnalysis(await response.json());
  } catch (error) {
    if (signal?.aborted) throw error;
    return null;
  } finally {
    window.clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
  }
}
