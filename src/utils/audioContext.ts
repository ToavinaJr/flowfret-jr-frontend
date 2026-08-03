/** Shared Web AudioContext singleton — unlock on first user gesture. */

let sharedContext: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!sharedContext || sharedContext.state === "closed") {
    sharedContext = new AudioContext();
  }
  return sharedContext;
}

export async function unlockAudioContext(): Promise<AudioContext> {
  const ctx = getAudioContext();
  if (ctx.state === "suspended") {
    await ctx.resume();
  }
  return ctx;
}

export function getAudioContextStatus(): AudioContext["state"] {
  return sharedContext?.state ?? "suspended";
}
