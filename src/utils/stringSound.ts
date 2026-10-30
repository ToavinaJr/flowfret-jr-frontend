/**
 * Guitar string synthesis via Web Audio API (pluck + harmonics + decay).
 */

import { unlockAudioContext } from "@/utils/audioContext";
import { requestAudioOwner } from "@/utils/audioPriority";
import { debugError } from "@/utils/debug";

/** Standard tuning Hz: E2, A2, D3, G3, B3, E4 (low → high) */
const OPEN_FREQ = [82.41, 110.0, 146.83, 196.0, 246.94, 329.63];

export function getNoteFrequency(stringIdx: number, fret: number): number {
  return OPEN_FREQ[stringIdx] * Math.pow(2, fret / 12);
}

const bufferCache = new Map<number, AudioBuffer>();

function buildPluckBuffer(ctx: AudioContext, freq: number, durationSec = 1.4): AudioBuffer {
  const key = Math.round(freq * 10);
  const cached = bufferCache.get(key);
  if (cached) return cached;

  const sr = ctx.sampleRate;
  const n = Math.floor(sr * durationSec);
  const buffer = ctx.createBuffer(1, n, sr);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < n; i++) {
    const t = i / sr;
    const env = Math.exp(-t * 3.6);
    let sample = 0;
    sample += Math.sin(2 * Math.PI * freq * t) * 0.55;
    sample += Math.sin(2 * Math.PI * freq * 2 * t) * 0.22;
    sample += Math.sin(2 * Math.PI * freq * 3 * t) * 0.13;
    sample += Math.sin(2 * Math.PI * freq * 4 * t) * 0.06;
    data[i] = sample * env;
  }

  bufferCache.set(key, buffer);
  return buffer;
}

let activeSources: AudioBufferSourceNode[] = [];

function stopActiveSources(): void {
  for (const source of activeSources) {
    try {
      source.stop();
    } catch {
      // already stopped
    }
  }
  activeSources = [];
}

async function playFrequency(freq: number, when = 0): Promise<void> {
  const ctx = await unlockAudioContext();
  requestAudioOwner("synth");
  const buffer = buildPluckBuffer(ctx, freq);
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  gain.gain.value = 0.85;
  source.buffer = buffer;
  source.connect(gain);
  gain.connect(ctx.destination);
  activeSources.push(source);
  source.onended = () => {
    activeSources = activeSources.filter((s) => s !== source);
  };
  source.start(ctx.currentTime + when);
}

export async function playStringNote(
  stringIdx: number,
  fret: number,
): Promise<void> {
  if (fret < 0) return;
  try {
    const freq = getNoteFrequency(stringIdx, fret);
    await playFrequency(freq);
  } catch (error) {
    debugError("audio.string_note_failed", { error });
  }
}

export async function strumChord(
  diagramFrets: number[],
  baseFret: number,
  capo = 0,
): Promise<void> {
  stopActiveSources();
  const ctx = await unlockAudioContext();
  requestAudioOwner("synth");

  let delay = 0;
  for (let si = 0; si < diagramFrets.length; si++) {
    const df = diagramFrets[si];
    if (df < 0) continue;
    const actualFret = (df === 0 ? 0 : baseFret - 1 + df) + capo;
    const freq = getNoteFrequency(si, actualFret);
    const buffer = buildPluckBuffer(ctx, freq);
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    gain.gain.value = 0.75;
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(ctx.destination);
    activeSources.push(source);
    source.onended = () => {
      activeSources = activeSources.filter((s) => s !== source);
    };
    source.start(ctx.currentTime + delay);
    delay += 0.07;
  }
}

/** Metronome click (short accent / normal) */
export async function playClick(accent: boolean): Promise<void> {
  const ctx = await unlockAudioContext();
  requestAudioOwner("metronome");
  const freq = accent ? 1200 : 800;
  const duration = 0.05;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "square";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(accent ? 0.35 : 0.2, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}
