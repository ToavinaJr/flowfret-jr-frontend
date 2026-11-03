export function clampGain(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
}

/** Both buffers use the same clock, start time and seek offset. */
export class StemMixer {
  private readonly master: GainNode;
  private readonly vocalGain: GainNode;
  private readonly instrumentalGain: GainNode;
  private sources: AudioBufferSourceNode[] = [];
  private offset = 0;
  private startedAt = 0;
  private disposed = false;
  private revision = 0;
  readonly duration: number;

  constructor(
    private readonly context: AudioContext,
    private readonly vocals: AudioBuffer,
    private readonly instrumental: AudioBuffer,
    private readonly onEnded: () => void,
  ) {
    this.duration = Math.min(vocals.duration, instrumental.duration);
    if (!Number.isFinite(this.duration) || this.duration <= 0 || this.duration > 420 ||
      Math.abs(vocals.duration - instrumental.duration) > 0.1) throw new Error("INVALID_STEM_DURATION");
    this.master = context.createGain();
    this.vocalGain = context.createGain();
    this.instrumentalGain = context.createGain();
    // Keep a fixed headroom so summing the two stems cannot clip decoded PCM.
    const headroom = context.createGain();
    headroom.gain.value = 0.45;
    this.headroom = headroom;
    this.vocalGain.connect(headroom);
    this.instrumentalGain.connect(headroom);
    headroom.connect(this.master);
    this.master.connect(context.destination);
  }

  private readonly headroom: GainNode;

  get currentTime() {
    return Math.min(this.duration, this.offset + (this.sources.length ? Math.max(0, this.context.currentTime - this.startedAt) : 0));
  }

  async resume() {
    if (this.disposed) return;
    const revision = this.revision;
    await this.context.resume();
    if (this.disposed || revision !== this.revision || this.sources.length) return;
    if (this.offset >= this.duration) this.offset = 0;
    this.start();
  }

  private start() {
    const startAt = this.context.currentTime + 0.02;
    this.startedAt = startAt;
    this.sources = [this.vocals, this.instrumental].map((buffer, index) => {
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      source.connect(index === 0 ? this.vocalGain : this.instrumentalGain);
      source.start(startAt, this.offset, this.duration - this.offset);
      return source;
    });
    this.sources[1].onended = () => {
      this.pause();
      this.offset = this.duration;
      this.onEnded();
    };
  }

  pause() {
    this.revision++;
    this.offset = this.currentTime;
    for (const source of this.sources) {
      source.onended = null;
      source.stop();
      source.disconnect();
    }
    this.sources = [];
  }

  seek(time: number) {
    const playing = this.sources.length > 0;
    this.pause();
    this.offset = Math.max(0, Math.min(this.duration, Number.isFinite(time) ? time : 0));
    if (playing && this.offset < this.duration) this.start();
  }

  private ramp(node: GainNode, value: number) {
    const now = this.context.currentTime;
    node.gain.cancelScheduledValues(now);
    node.gain.setValueAtTime(node.gain.value, now);
    node.gain.linearRampToValueAtTime(value, now + 0.03);
  }

  setRemoval(value: number) { this.ramp(this.vocalGain, 1 - clampGain(value)); }
  setVolume(value: number) { this.ramp(this.master, clampGain(value)); }

  dispose() {
    this.disposed = true;
    this.pause();
    this.master.disconnect();
    this.headroom.disconnect();
    this.vocalGain.disconnect();
    this.instrumentalGain.disconnect();
  }
}
