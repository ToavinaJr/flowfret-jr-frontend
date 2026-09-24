import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PlaybackItem } from "@/contexts/PlaybackContext";
import type { ChordCue } from "@/types/song";
import {
  analyzeAudioUrl,
  type AnalysisPhase,
} from "@/utils/chordDetection";
import {
  startTabAudioCapture,
  TabAudioCaptureError,
  type TabAudioCapture,
  type TabAudioCaptureErrorCode,
} from "@/utils/tabAudioCapture";

export interface ChordAnalysis {
  cues: ChordCue[];
  duration: number;
  source: "original" | "tab-capture";
}

export type ChordAnalysisStatus =
  | "idle"
  | "requesting-capture"
  | "capturing"
  | "loading"
  | "success"
  | "unavailable"
  | "error";

const capturedAnalysisCache = new Map<string, ChordAnalysis>();
const CAPTURE_CUE_SECONDS = 0.75;

function itemKey(item: PlaybackItem): string {
  return `${item.provider ?? item.engine ?? "audio"}:${item.id}`;
}

function hasDirectAudio(item: PlaybackItem): boolean {
  return (
    Boolean(item.chordCues?.length) ||
    item.engine === "audio" ||
    item.src.startsWith("blob:") ||
    item.src.startsWith("data:")
  );
}

export function appendCapturedChord(
  cues: readonly ChordCue[],
  chord: string,
  currentTime: number,
): ChordCue[] {
  const start = Math.max(0, currentTime - CAPTURE_CUE_SECONDS);
  const end = Math.max(CAPTURE_CUE_SECONDS, currentTime + CAPTURE_CUE_SECONDS);
  const previous = cues[cues.length - 1];
  if (previous && start < previous.start) return [...cues];
  if (
    previous?.chord === chord &&
    start <= previous.end + CAPTURE_CUE_SECONDS
  ) {
    return [...cues.slice(0, -1), { ...previous, end }];
  }
  return [...cues, { start, end, chord }];
}

async function analyzeDirectItem(
  item: PlaybackItem,
  onProgress: (ratio: number, phase: AnalysisPhase) => void,
  signal: AbortSignal,
): Promise<ChordAnalysis> {
  if (item.chordCues?.length) {
    onProgress(1, "complete");
    return {
      cues: item.chordCues,
      duration:
        item.duration ?? item.chordCues[item.chordCues.length - 1]?.end ?? 0,
      source: "original",
    };
  }
  const result = await analyzeAudioUrl(
    item.src,
    item.title,
    onProgress,
    signal,
  );
  return { ...result, source: "original" };
}

export function useChordAnalysis(
  item: PlaybackItem | null,
  enabled: boolean,
  currentTime: number,
): {
  analysis: ChordAnalysis | null;
  status: ChordAnalysisStatus;
  progress: number;
  phase: AnalysisPhase;
  captureError: TabAudioCaptureErrorCode | null;
  requiresCapture: boolean;
  startCapture: () => Promise<void>;
  finishCapture: () => void;
} {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<AnalysisPhase>("decoding");
  const [captureStatus, setCaptureStatus] =
    useState<ChordAnalysisStatus>("idle");
  const [captureError, setCaptureError] =
    useState<TabAudioCaptureErrorCode | null>(null);
  const [capturedAnalysis, setCapturedAnalysis] =
    useState<ChordAnalysis | null>(null);
  const captureRef = useRef<TabAudioCapture | null>(null);
  const cuesRef = useRef<ChordCue[]>([]);
  const currentTimeRef = useRef(currentTime);
  const captureRequestedRef = useRef(false);
  currentTimeRef.current = currentTime;

  const direct = Boolean(item && hasDirectAudio(item));
  const key = item ? itemKey(item) : "none";

  const directQuery = useQuery({
    queryKey: ["chord-analysis", item?.id, item?.src],
    queryFn: ({ signal }) =>
      analyzeDirectItem(
        item!,
        (nextProgress, nextPhase) => {
          setProgress(nextProgress);
          setPhase(nextPhase);
        },
        signal,
      ),
    enabled: enabled && direct,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 30 * 60 * 1000,
    retry: false,
  });

  const cacheCapturedCues = useCallback(() => {
    if (!item || cuesRef.current.length === 0) return null;
    const analysis: ChordAnalysis = {
      cues: cuesRef.current,
      duration: item.duration ?? currentTimeRef.current,
      source: "tab-capture",
    };
    capturedAnalysisCache.set(itemKey(item), analysis);
    setCapturedAnalysis(analysis);
    return analysis;
  }, [item]);

  const finishCapture = useCallback(() => {
    captureRequestedRef.current = false;
    captureRef.current?.stop();
    captureRef.current = null;
    const analysis = cacheCapturedCues();
    setCaptureStatus(analysis ? "success" : "unavailable");
  }, [cacheCapturedCues]);

  const startCapture = useCallback(async () => {
    if (!item || hasDirectAudio(item)) return;
    const cached = capturedAnalysisCache.get(itemKey(item));
    if (cached) {
      setCapturedAnalysis(cached);
      setCaptureStatus("success");
      return;
    }

    captureRequestedRef.current = true;
    setCaptureError(null);
    setCaptureStatus("requesting-capture");
    cuesRef.current = [];
    try {
      const capture = await startTabAudioCapture(
        (chord) => {
          if (chord === "—") return;
          const cues = appendCapturedChord(
            cuesRef.current,
            chord,
            currentTimeRef.current,
          );
          cuesRef.current = cues;
          setCapturedAnalysis({
            cues,
            duration: item.duration ?? currentTimeRef.current,
            source: "tab-capture",
          });
        },
        () => {
          captureRef.current = null;
          const analysis = cacheCapturedCues();
          setCaptureStatus(analysis ? "success" : "unavailable");
        },
      );
      if (!captureRequestedRef.current) {
        capture.stop();
        return;
      }
      captureRef.current = capture;
      setCaptureStatus("capturing");
    } catch (error) {
      const code =
        error instanceof TabAudioCaptureError ? error.code : "failed";
      setCaptureError(code);
      setCaptureStatus("unavailable");
    }
  }, [cacheCapturedCues, item]);

  useEffect(() => {
    const cached = item ? capturedAnalysisCache.get(key) ?? null : null;
    cuesRef.current = cached?.cues ?? [];
    setCapturedAnalysis(cached);
    setCaptureStatus(cached ? "success" : "idle");
    setCaptureError(null);
    setProgress(0);
    setPhase("decoding");
    return () => {
      captureRequestedRef.current = false;
      captureRef.current?.stop();
      captureRef.current = null;
    };
  }, [key, item]);

  useEffect(() => {
    if (!enabled && captureRef.current) finishCapture();
    if (!enabled) captureRequestedRef.current = false;
  }, [enabled, finishCapture]);

  if (!item) {
    return {
      analysis: null,
      status: "idle",
      progress,
      phase,
      captureError,
      requiresCapture: false,
      startCapture,
      finishCapture,
    };
  }

  if (!direct) {
    return {
      analysis: capturedAnalysis,
      status: enabled ? captureStatus : "idle",
      progress: 0,
      phase,
      captureError,
      requiresCapture: true,
      startCapture,
      finishCapture,
    };
  }

  const status: ChordAnalysisStatus = !enabled
    ? "idle"
    : directQuery.isPending || directQuery.isFetching
      ? "loading"
      : directQuery.isError
        ? "error"
        : "success";
  return {
    analysis: directQuery.data ?? null,
    status,
    progress: status === "success" ? 1 : progress,
    phase: status === "success" ? "complete" : phase,
    captureError,
    requiresCapture: false,
    startCapture,
    finishCapture,
  };
}
