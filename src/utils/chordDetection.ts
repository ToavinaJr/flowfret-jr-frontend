/**
 * Chord detection from raw audio via Web Audio + Goertzel chroma.
 */

import type { ChordCue } from "@/types/song";

const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
const C4 = 261.63;

export type ProgressCallback = (ratio: number, label: string) => void;

export interface AnalysisResult {
  title: string;
  duration: number;
  cues: ChordCue[];
}

function goertzel(samples: Float32Array, freq: number, sr: number): number {
  const omega = (2 * Math.PI * freq) / sr;
  const coeff = 2 * Math.cos(omega);
  let s1 = 0;
  let s2 = 0;
  for (let i = 0; i < samples.length; i++) {
    const s0 = samples[i] + coeff * s1 - s2;
    s2 = s1;
    s1 = s0;
  }
  return s1 * s1 + s2 * s2 - s1 * s2 * coeff;
}

function detectChordForSegment(segment: Float32Array, sr: number): string {
  const chroma = new Float32Array(12);

  for (let n = 0; n < 12; n++) {
    let energy = 0;
    for (let oct = 1; oct <= 7; oct++) {
      const freq = C4 * Math.pow(2, oct - 4 + n / 12);
      if (freq < 20 || freq >= sr / 2) continue;
      energy += goertzel(segment, freq, sr);
    }
    chroma[n] = energy;
  }

  let maxIdx = 0;
  for (let i = 1; i < 12; i++) {
    if (chroma[i] > chroma[maxIdx]) maxIdx = i;
  }
  return NOTES[maxIdx];
}

export async function analyzeAudioFile(
  file: File,
  onProgress: ProgressCallback,
): Promise<AnalysisResult> {
  onProgress(0, "Décodage audio…");

  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new AudioContext({ sampleRate: 22050 });
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  } finally {
    await audioCtx.close();
  }

  const pcm = audioBuffer.getChannelData(0);
  const sr = audioBuffer.sampleRate;
  const duration = audioBuffer.duration;
  const totalSeg = Math.floor(duration);

  onProgress(0, `Analyse de ${totalSeg} secondes…`);

  const cues: ChordCue[] = [];

  for (let i = 0; i < totalSeg; i++) {
    const start = i * sr;
    const end = Math.min((i + 1) * sr, pcm.length);
    const segment = new Float32Array(
      pcm.buffer,
      pcm.byteOffset + start * 4,
      end - start,
    );
    const chord = detectChordForSegment(segment, sr);
    cues.push({ start: i, end: i + 1, chord });

    if (i % 4 === 3) {
      onProgress(
        (i + 1) / totalSeg,
        `Analyse… ${Math.round(((i + 1) / totalSeg) * 100)}%`,
      );
      await new Promise<void>((r) => setTimeout(r, 0));
    }
  }

  onProgress(1, "Terminé !");

  return {
    title: file.name.replace(/\.[^/.]+$/, ""),
    duration,
    cues,
  };
}
