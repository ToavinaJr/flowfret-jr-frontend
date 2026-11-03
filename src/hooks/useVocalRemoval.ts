import { useCallback, useEffect, useRef, useState } from "react";
import type { PlaybackItem, StemPreparationPhase } from "@/contexts/playback-context";
import { createAudioStems, getAudioStems, supportsVocalRemoval } from "@/services/audioStemsApi";
import { StemMixer } from "@/services/stemMixer";
import { unlockAudioContext } from "@/utils/audioContext";

export type StemStatus = "idle" | "preparing" | "ready" | "failed";
async function decodeStem(context: AudioContext, url: string, signal: AbortSignal) {
  const response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(120_000)]) });
  if (!response.ok || Number(response.headers.get("Content-Length")) > 30 * 1024 * 1024) throw new Error("STEM_DOWNLOAD_FAILED");
  const data = await response.arrayBuffer();
  if (data.byteLength > 30 * 1024 * 1024) throw new Error("STEM_TOO_LARGE");
  signal.throwIfAborted();
  return context.decodeAudioData(data);
}

export function useVocalRemoval(onEnded: () => void) {
  const mixerRef = useRef<StemMixer | null>(null);
  const activeRef = useRef(false);
  const requestRef = useRef<AbortController | null>(null);
  const endedRef = useRef(onEnded);
  endedRef.current = onEnded;
  const [status, setStatus] = useState<StemStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<StemPreparationPhase>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [removal, setRemoval] = useState(0);
  const [simulated, setSimulated] = useState(false);

  const dispose = useCallback(() => {
    requestRef.current?.abort();
    requestRef.current = null;
    mixerRef.current?.dispose();
    mixerRef.current = null;
    activeRef.current = false;
  }, []);

  const reset = useCallback(() => {
    dispose();
    setStatus("idle");
    setProgress(0);
    setPhase(null);
    setErrorCode(null);
    setRemoval(0);
    setSimulated(false);
  }, [dispose]);

  useEffect(() => dispose, [dispose]);

  const prepare = useCallback(async (item: PlaybackItem) => {
    if (!supportsVocalRemoval(item) || requestRef.current || mixerRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(15 * 60_000)]);
    setStatus("preparing");
    setProgress(0);
    setPhase("queue");
    setErrorCode(null);
    try {
      const context = await unlockAudioContext();
      let result = await createAudioStems(item, signal);
      setSimulated(result.simulated === true);
      while (result.status === "PENDING" || result.status === "DOWNLOADING" || result.status === "PROCESSING") {
        setProgress(Math.max(0, Math.min(99, result.progress)));
        setPhase(result.status === "PENDING" ? "queue" : result.status === "DOWNLOADING" ? "download" : "separation");
        await new Promise<void>((resolve, reject) => {
          signal.throwIfAborted();
          const abort = () => { clearTimeout(timer); reject(signal.reason); };
          const timer = setTimeout(() => { signal.removeEventListener("abort", abort); resolve(); }, 3000);
          signal.addEventListener("abort", abort, { once: true });
        });
        result = await getAudioStems(result.audioStemId, signal);
      }
      if (result.status === "FAILED") throw new Error(result.error?.code ?? "DEMUCS_FAILED");
      if (result.status !== "COMPLETED" || !result.vocalsUrl || !result.instrumentalUrl) throw new Error("DEMUCS_FAILED");
      setPhase("finalizing");
      const [vocals, instrumental] = await Promise.all([
        decodeStem(context, result.vocalsUrl, signal),
        decodeStem(context, result.instrumentalUrl, signal),
      ]);
      signal.throwIfAborted();
      mixerRef.current = new StemMixer(context, vocals, instrumental, () => endedRef.current());
      setProgress(100);
      setPhase(null);
      setStatus("ready");
    } catch (error) {
      if (!controller.signal.aborted) {
        setPhase(null);
        setErrorCode(
          error instanceof Error
            ? error.name === "TimeoutError"
              ? "REQUEST_TIMEOUT"
              : error.name === "TypeError"
                ? "NETWORK_ERROR"
                : error.message
            : null,
        );
        setStatus("failed");
      }
    } finally {
      controller.abort();
      if (requestRef.current === controller) requestRef.current = null;
    }
  }, []);

  return { mixerRef, activeRef, status, progress, phase, errorCode, removal, simulated, setRemoval, reset, prepare };
}
