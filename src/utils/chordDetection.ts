/** Browser-side chord recognition based on a multi-octave chromagram. */
import {
  buildChroma,
  classifyChordFromChroma,
  HOP_SECONDS,
  mergeChordCues,
  smoothChordLabels,
  WINDOW_SECONDS,
} from "@/utils/chordDetectionMath";
import type { ChordCue } from "@/types/song";
import { debugError, debugLog } from "@/utils/debug";
import { requestNeuralChordAnalysis } from "@/services/neuralChordAnalysis";

export { classifyChordFromChroma } from "@/utils/chordDetectionMath";

export type AnalysisPhase =
  "downloading" | "decoding" | "classifying" | "neural" | "complete";
export type ProgressCallback = (ratio: number, phase: AnalysisPhase) => void;
export interface AnalysisResult {
  title: string;
  duration: number;
  cues: ChordCue[];
  engineVersion?: string;
  beats?: number[];
  downbeats?: number[];
}

export type AudioAnalysisFailurePhase =
  "request" | "response" | "stream" | "decode";

export class AudioAnalysisError extends Error {
  constructor(
    readonly phase: AudioAnalysisFailurePhase,
    readonly status: number,
    readonly diagnosticId?: string,
  ) {
    super(`Audio analysis failed during ${phase}`);
    this.name = "AudioAnalysisError";
  }
}

export async function analyzeAudioFile(
  file: File,
  onProgress: ProgressCallback,
  signal?: AbortSignal,
): Promise<AnalysisResult> {
  const title = file.name.replace(/\.[^/.]+$/, "");
  const neural = await requestNeuralChordAnalysis(file, () => onProgress(0, "neural"), signal);
  if (neural) {
    onProgress(1, "complete");
    return { ...neural, title };
  }
  const local = await analyzeAudioBlob(
    file,
    file.name.replace(/\.[^/.]+$/, ""),
    onProgress,
    signal,
  );
  return { ...local, engineVersion: "browser-chroma-v1" };
}

export async function analyzeAudioUrl(
  url: string,
  title: string,
  onProgress: ProgressCallback,
  signal?: AbortSignal,
  headers?: HeadersInit,
): Promise<AnalysisResult> {
  onProgress(0, "downloading");
  debugLog("chords.audio_request_started", {
    title,
    origin: new URL(url, window.location.href).origin,
  });
  let response: Response;
  try {
    response = await fetch(url, { signal, headers });
  } catch (error) {
    if (signal?.aborted) throw error;
    debugError("chords.audio_request_failed", { error });
    throw new AudioAnalysisError("request", 0);
  }
  const diagnosticId =
    response.headers.get("X-Chord-Diagnostic-Id") ?? undefined;
  debugLog("chords.audio_response", {
    status: response.status,
    diagnosticId,
    contentType: response.headers.get("content-type"),
  });
  if (!response.ok) {
    throw new AudioAnalysisError("response", response.status, diagnosticId);
  }
  let blob: Blob;
  try {
    blob = await response.blob();
  } catch (error) {
    debugError("chords.audio_stream_failed", { diagnosticId, error });
    throw new AudioAnalysisError("stream", response.status, diagnosticId);
  }
  if (blob.size === 0) {
    throw new AudioAnalysisError("stream", response.status, diagnosticId);
  }
  debugLog("chords.audio_downloaded", { diagnosticId, bytes: blob.size });
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  try {
    return await analyzeAudioBlob(blob, title, onProgress, signal);
  } catch (error) {
    if (signal?.aborted) throw error;
    debugError("chords.audio_decode_or_analysis_failed", {
      diagnosticId,
      error,
    });
    throw new AudioAnalysisError("decode", response.status, diagnosticId);
  }
}

async function analyzeAudioBlob(
  blob: Blob,
  title: string,
  onProgress: ProgressCallback,
  signal?: AbortSignal,
): Promise<AnalysisResult> {
  onProgress(0, "decoding");
  const audioContext = new AudioContext({ sampleRate: 22050 });
  let buffer: AudioBuffer;
  try {
    buffer = await audioContext.decodeAudioData(await blob.arrayBuffer());
  } finally {
    await audioContext.close();
  }

  const sampleRate = buffer.sampleRate;
  const mono = new Float32Array(buffer.length);
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel);
    for (let index = 0; index < mono.length; index++)
      mono[index] += data[index] / buffer.numberOfChannels;
  }
  const frameCount = Math.max(1, Math.ceil(buffer.duration / HOP_SECONDS));
  const frameLength = Math.round(WINDOW_SECONDS * sampleRate);
  const labels: string[] = [];
  for (let frame = 0; frame < frameCount; frame++) {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const start = Math.round(frame * HOP_SECONDS * sampleRate);
    const segment = mono.subarray(
      start,
      Math.min(mono.length, start + frameLength),
    );
    const chroma = buildChroma(segment, sampleRate);
    labels.push(chroma ? classifyChordFromChroma(chroma) : "—");
    if (frame % 4 === 3 || frame === frameCount - 1) {
      const ratio = (frame + 1) / frameCount;
      onProgress(ratio, "classifying");
      await new Promise<void>((resolve) => setTimeout(resolve, 0));
    }
  }
  const smoothed = smoothChordLabels(labels);
  onProgress(1, "complete");
  return {
    title,
    duration: buffer.duration,
    cues: mergeChordCues(smoothed, buffer.duration),
  };
}
