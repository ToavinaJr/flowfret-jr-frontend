import { useCallback, useEffect, useRef, useState } from "react";
import type { PlaybackItem, StemPreparationPhase } from "@/contexts/playback-context";
import { createAudioStems, getAudioStems, supportsVocalRemoval } from "@/services/audioStemsApi";
import { StemMixer } from "@/services/stemMixer";
import { unlockAudioContext } from "@/utils/audioContext";
import { debugError, debugLog } from "@/utils/debug";

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
    const supported = supportsVocalRemoval(item);
    if (!supported || requestRef.current || mixerRef.current) {
      debugLog("audio_stems.prepare_skipped", {
        provider: item.provider ?? "unknown",
        hasTrackId: Boolean(item.providerTrackId),
        supported,
        requestInProgress: Boolean(requestRef.current),
        stemsReady: Boolean(mixerRef.current),
      });
      return;
    }
    debugLog("audio_stems.prepare_started", {
      provider: item.provider,
      hasTrackId: Boolean(item.providerTrackId),
    });
    const controller = new AbortController();
    requestRef.current = controller;
    const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(15 * 60_000)]);
    let currentPhase: StemPreparationPhase = "queue";
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
        currentPhase = result.status === "PENDING" ? "queue" : result.status === "DOWNLOADING" ? "download" : "separation";
        setPhase(currentPhase);
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
      currentPhase = "finalizing";
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
        const errorCode = error instanceof Error
          ? error.name === "TimeoutError"
            ? "REQUEST_TIMEOUT"
            : error.name === "TypeError"
              ? "NETWORK_ERROR"
              : error.message
          : null;
        debugError("audio_stems.prepare_failed", {
          phase: currentPhase ?? "queue",
          errorName: error instanceof Error ? error.name : "unknown",
          code: errorCode ?? "UNKNOWN_ERROR",
        });
        setErrorCode(errorCode);
        setStatus("failed");
      } else {
        debugLog("audio_stems.prepare_aborted", {});
      }
    } finally {
      controller.abort();
      if (requestRef.current === controller) requestRef.current = null;
    }
  }, []);

  return { mixerRef, activeRef, status, progress, phase, errorCode, removal, simulated, setRemoval, reset, prepare };
}
