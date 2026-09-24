import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PlaybackItem } from "@/contexts/PlaybackContext";
import type { ChordCue } from "@/types/song";
import {
  analyzeAudioUrl,
  type AnalysisPhase,
} from "@/utils/chordDetection";

export interface ChordAnalysis {
  cues: ChordCue[];
  duration: number;
  source: "original";
}

export type ChordAnalysisStatus =
  | "idle"
  | "loading"
  | "success"
  | "unavailable"
  | "error";

export function canAnalyzeDirectly(item: PlaybackItem): boolean {
  return (
    Boolean(item.chordCues?.length) ||
    item.engine === "audio" ||
    item.src.startsWith("blob:") ||
    item.src.startsWith("data:")
  );
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
): {
  analysis: ChordAnalysis | null;
  status: ChordAnalysisStatus;
  progress: number;
  phase: AnalysisPhase;
} {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<AnalysisPhase>("decoding");
  const direct = Boolean(item && canAnalyzeDirectly(item));

  useEffect(() => {
    setProgress(0);
    setPhase("decoding");
  }, [item?.id, item?.src]);

  const query = useQuery({
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

  if (!enabled || !item)
    return { analysis: null, status: "idle", progress, phase };
  if (!direct)
    return { analysis: null, status: "unavailable", progress, phase };
  if (query.isPending || query.isFetching)
    return {
      analysis: query.data ?? null,
      status: "loading",
      progress,
      phase,
    };
  if (query.isError)
    return { analysis: null, status: "error", progress, phase };
  return {
    analysis: query.data ?? null,
    status: "success",
    progress: 1,
    phase: "complete",
  };
}
