import type { ChordCue } from "@/types/song";

const NOTES = [
  "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B",
] as const;
const C2 = 65.406;
const TARGET_SAMPLE_RATE = 5512;
const WINDOW_SECONDS = 1.5;
const HOP_SECONDS = 0.75;

const CHORD_TEMPLATES = [
  { suffix: "", tones: [[0, 1], [4, 0.9], [7, 0.82]] },
  { suffix: "m", tones: [[0, 1], [3, 0.9], [7, 0.82]] },
  { suffix: "dim", tones: [[0, 1], [3, 0.9], [6, 0.82]] },
  { suffix: "aug", tones: [[0, 1], [4, 0.9], [8, 0.82]] },
  { suffix: "sus2", tones: [[0, 1], [2, 0.82], [7, 0.9]] },
  { suffix: "sus4", tones: [[0, 1], [5, 0.82], [7, 0.9]] },
  { suffix: "7", tones: [[0, 1], [4, 0.9], [7, 0.82], [10, 0.68]] },
  { suffix: "maj7", tones: [[0, 1], [4, 0.9], [7, 0.82], [11, 0.68]] },
  { suffix: "m7", tones: [[0, 1], [3, 0.9], [7, 0.82], [10, 0.68]] },
] as const;

function goertzel(samples: Float32Array, frequency: number, sampleRate: number): number {
  const coefficient = 2 * Math.cos((2 * Math.PI * frequency) / sampleRate);
  let previous = 0;
  let beforePrevious = 0;
  for (const sample of samples) {
    const current = sample + coefficient * previous - beforePrevious;
    beforePrevious = previous;
    previous = current;
  }
  return Math.max(0, previous * previous + beforePrevious * beforePrevious - coefficient * previous * beforePrevious);
}

function windowAndDownsample(source: Float32Array, sampleRate: number): { samples: Float32Array; sampleRate: number; rms: number } {
  const stride = Math.max(1, Math.round(sampleRate / TARGET_SAMPLE_RATE));
  const length = Math.ceil(source.length / stride);
  const samples = new Float32Array(length);
  let squareSum = 0;
  for (let index = 0; index < length; index++) {
    const sample = source[Math.min(index * stride, source.length - 1)] ?? 0;
    squareSum += sample * sample;
    const hann = length > 1 ? 0.5 - 0.5 * Math.cos((2 * Math.PI * index) / (length - 1)) : 1;
    samples[index] = sample * hann;
  }
  return { samples, sampleRate: sampleRate / stride, rms: Math.sqrt(squareSum / Math.max(1, length)) };
}

function buildChroma(segment: Float32Array, sampleRate: number): number[] | null {
  const prepared = windowAndDownsample(segment, sampleRate);
  if (prepared.rms < 0.004) return null;
  const chroma = Array<number>(12).fill(0);
  for (let pitch = 0; pitch < 12; pitch++) {
    for (let octave = 0; octave < 5; octave++) {
      const frequency = C2 * 2 ** (octave + pitch / 12);
      if (frequency >= prepared.sampleRate / 2) continue;
      chroma[pitch] += Math.log1p(Math.sqrt(goertzel(prepared.samples, frequency, prepared.sampleRate))) / (1 + octave * 0.08);
    }
  }
  const norm = Math.sqrt(chroma.reduce((sum, value) => sum + value * value, 0));
  return norm > 0 ? chroma.map((value) => value / norm) : null;
}

export function classifyChordFromChroma(chroma: readonly number[]): string {
  if (chroma.length !== 12 || chroma.every((value) => value <= 0)) return "—";
  const total = chroma.reduce((sum, value) => sum + Math.max(0, value), 0);
  let best = { label: "—", score: Number.NEGATIVE_INFINITY };
  for (let root = 0; root < 12; root++) {
    for (const template of CHORD_TEMPLATES) {
      let dot = 0;
      let templateNorm = 0;
      let chordEnergy = 0;
      for (const [interval, weight] of template.tones) {
        const value = Math.max(0, chroma[(root + interval) % 12] ?? 0);
        dot += value * weight;
        chordEnergy += value;
        templateNorm += weight * weight;
      }
      const cosine = dot / Math.sqrt(templateNorm);
      const outside = Math.max(0, total - chordEnergy) / Math.max(total, Number.EPSILON);
      const complexityPenalty = template.tones.length > 3 ? 0.025 : 0;
      const score = cosine - outside * 0.18 - complexityPenalty + Math.max(0, chroma[root] ?? 0) * 0.035;
      if (score > best.score) best = { label: `${NOTES[root]}${template.suffix}`, score };
    }
  }
  return best.label;
}

export function smoothChordLabels(labels: readonly string[]): string[] {
  return labels.map((_, index) => {
    const votes = new Map<string, number>();
    for (let offset = -1; offset <= 1; offset++) {
      const label = labels[index + offset];
      if (!label || label === "—") continue;
      votes.set(label, (votes.get(label) ?? 0) + (offset === 0 ? 2 : 1));
    }
    return [...votes.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? "—";
  });
}

export function mergeChordCues(labels: readonly string[], duration: number): ChordCue[] {
  const cues: ChordCue[] = [];
  for (let index = 0; index < labels.length; index++) {
    const chord = labels[index];
    const start = index * HOP_SECONDS;
    const end = Math.min(duration, start + HOP_SECONDS);
    const previous = cues[cues.length - 1];
    if (previous?.chord === chord) previous.end = end;
    else cues.push({ start, end, chord });
  }
  return cues;
}

export { HOP_SECONDS, WINDOW_SECONDS, buildChroma };