import { describe, expect, it, vi } from "vitest";
import { StemMixer } from "./stemMixer";

function fixture() {
  const nodes: Array<{ gain: { value: number; cancelScheduledValues: ReturnType<typeof vi.fn>; setValueAtTime: ReturnType<typeof vi.fn>; linearRampToValueAtTime: ReturnType<typeof vi.fn> }; connect: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }> = [];
  const sources: Array<{ start: ReturnType<typeof vi.fn>; stop: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn>; connect: ReturnType<typeof vi.fn>; onended: (() => void) | null; buffer: AudioBuffer | null }> = [];
  const context = {
    currentTime: 10, destination: {}, resume: vi.fn().mockResolvedValue(undefined),
    createGain: () => {
      const node = { gain: { value: 1, cancelScheduledValues: vi.fn(), setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn() };
      nodes.push(node); return node;
    },
    createBufferSource: () => {
      const source = { start: vi.fn(), stop: vi.fn(), connect: vi.fn(), disconnect: vi.fn(), onended: null, buffer: null };
      sources.push(source); return source;
    },
  };
  const buffer = { duration: 120, numberOfChannels: 1, getChannelData: () => new Float32Array([0.8, -0.8]) } as unknown as AudioBuffer;
  const ended = vi.fn();
  const mixer = new StemMixer(context as unknown as AudioContext, buffer, buffer, ended);
  return { mixer, context, nodes, sources, ended };
}

describe("StemMixer", () => {
  it("schedules both stems at one timestamp and preserves position across pause, seek and resume", async () => {
    const { mixer, context, sources, ended } = fixture();
    mixer.seek(25);
    await mixer.resume();
    expect(sources[0].start.mock.calls[0]).toEqual(sources[1].start.mock.calls[0]);
    expect(sources[0].start).toHaveBeenCalledWith(10.02, 25, 95);
    context.currentTime = 12.02;
    mixer.pause();
    expect(mixer.currentTime).toBeCloseTo(27);
    expect(sources[0].stop).toHaveBeenCalledOnce();
    expect(ended).not.toHaveBeenCalled();
    mixer.seek(60);
    await mixer.resume();
    expect(sources[2].start.mock.calls[0][1]).toBe(60);
    expect(sources[2].start.mock.calls[0]).toEqual(sources[3].start.mock.calls[0]);
    sources[3].onended?.();
    expect(ended).toHaveBeenCalledOnce();
    expect(mixer.currentTime).toBe(120);
  });

  it("ramps only vocals while master volume and clipping headroom stay independent", () => {
    const { mixer, nodes } = fixture();
    mixer.setRemoval(0.5);
    expect(nodes[1].gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(0.5, 10.03);
    mixer.setRemoval(5);
    expect(nodes[1].gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(0, 10.03);
    mixer.setRemoval(-1);
    expect(nodes[1].gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(1, 10.03);
    mixer.setVolume(0.2);
    expect(nodes[0].gain.linearRampToValueAtTime).toHaveBeenLastCalledWith(0.2, 10.03);
    expect(nodes[2].gain.linearRampToValueAtTime).not.toHaveBeenCalled();
    expect(nodes[3].gain.value).toBeCloseTo(0.45);
  });

  it("does not start a pending resume after pause or disposal", async () => {
    const { mixer, context, sources } = fixture();
    let resolve!: () => void;
    context.resume.mockImplementation(() => new Promise<void>((done) => { resolve = done; }));
    const pending = mixer.resume();
    mixer.pause();
    resolve();
    await pending;
    expect(sources).toHaveLength(0);
    const second = mixer.resume();
    mixer.dispose();
    resolve();
    await second;
    expect(sources).toHaveLength(0);
  });
});
