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

export { classifyChordFromChroma } from "@/utils/chordDetectionMath";

export type AnalysisPhase =
  | "downloading"
  | "decoding"
  | "classifying"
  | "complete";
export type ProgressCallback = (ratio: number, phase: AnalysisPhase) => void;
export interface AnalysisResult {
  title: string;
  duration: number;
  cues: ChordCue[];
}


export async function analyzeAudioFile(
  file: File,
  onProgress: ProgressCallback,
  signal?: AbortSignal,
): Promise<AnalysisResult> {
  return analyzeAudioBlob(
    file,
    file.name.replace(/\.[^/.]+$/, ""),
    onProgress,
    signal,
  );
}

export async function analyzeAudioUrl(
  url: string,
  title: string,
  onProgress: ProgressCallback,
  signal?: AbortSignal,
  headers?: HeadersInit,
): Promise<AnalysisResult> {
  onProgress(0, "downloading");
  const response = await fetch(url, { signal, headers });
  if (!response.ok) throw new Error(`Audio request failed (${response.status})`);
  const blob = await response.blob();
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
  return analyzeAudioBlob(blob, title, onProgress, signal);
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
