import { buildChroma, classifyChordFromChroma } from "@/utils/chordDetectionMath";

const CAPTURE_INTERVAL_MS = 750;

export type TabAudioCaptureErrorCode =
  | "unsupported"
  | "permission-denied"
  | "no-audio"
  | "failed";

export class TabAudioCaptureError extends Error {
  constructor(public readonly code: TabAudioCaptureErrorCode) {
    super(code);
    this.name = "TabAudioCaptureError";
  }
}

export interface TabAudioCapture {
  stop: () => void;
}

export async function startTabAudioCapture(
  onChord: (chord: string) => void,
  onEnded: () => void,
): Promise<TabAudioCapture> {
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new TabAudioCaptureError("unsupported");
  }

  let stream: MediaStream;
  try {
    const options = {
      video: true,
      audio: true,
      preferCurrentTab: true,
      selfBrowserSurface: "include",
      surfaceSwitching: "exclude",
      systemAudio: "include",
    } as DisplayMediaStreamOptions;
    stream = await navigator.mediaDevices.getDisplayMedia(options);
  } catch (error) {
    if (error instanceof DOMException && error.name === "NotAllowedError") {
      throw new TabAudioCaptureError("permission-denied");
    }
    throw new TabAudioCaptureError("failed");
  }

  const audioTrack = stream.getAudioTracks()[0];
  if (!audioTrack) {
    stream.getTracks().forEach((track) => track.stop());
    throw new TabAudioCaptureError("no-audio");
  }

  stream.getVideoTracks().forEach((track) => {
    track.enabled = false;
  });

  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(
    new MediaStream([audioTrack]),
  );
  const analyser = audioContext.createAnalyser();
  analyser.fftSize = 32768;
  analyser.smoothingTimeConstant = 0;
  source.connect(analyser);
  await audioContext.resume();

  const samples = new Float32Array(analyser.fftSize);
  let stopped = false;
  const timer = window.setInterval(() => {
    analyser.getFloatTimeDomainData(samples);
    const chroma = buildChroma(samples, audioContext.sampleRate);
    onChord(chroma ? classifyChordFromChroma(chroma) : "—");
  }, CAPTURE_INTERVAL_MS);

  const stop = (notify: boolean) => {
    if (stopped) return;
    stopped = true;
    window.clearInterval(timer);
    source.disconnect();
    analyser.disconnect();
    stream.getTracks().forEach((track) => track.stop());
    void audioContext.close();
    if (notify) onEnded();
  };
  stream.getTracks().forEach((track) =>
    track.addEventListener("ended", () => stop(true), { once: true }),
  );

  return { stop: () => stop(false) };
}
