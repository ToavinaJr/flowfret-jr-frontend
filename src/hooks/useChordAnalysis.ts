import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PlaybackItem } from "@/contexts/PlaybackContext";
import type { ChordCue } from "@/types/song";
import { getYouTubeAudioRequest } from "@/services/youtubeAudioApi";
import {
  analyzeAudioUrl,
  type AnalysisPhase,
} from "@/utils/chordDetection";
import {
  fetchChordTranscription,
  saveChordTranscription,
} from "@/services/chordTranscriptionsApi";

const CHORD_ENGINE_VERSION = "browser-chroma-v1";

class UnavailableChordSourceError extends Error {}

export interface ChordAnalysis {
  cues: ChordCue[];
  duration: number;
  source: "original" | "youtube-extraction" | "database";
}

export type ChordAnalysisStatus =
  | "idle"
  | "loading"
  | "success"
  | "unavailable"
  | "error";

export function canAnalyzeSource(item: PlaybackItem): boolean {
  return (
    Boolean(item.chordCues?.length) ||
    item.engine === "audio" ||
    (item.engine === "youtube" && Boolean(getYouTubeAudioRequest(item.src))) ||
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
  const youtubeRequest =
    item.engine === "youtube" ? getYouTubeAudioRequest(item.src) : null;
  const result = await analyzeAudioUrl(
    youtubeRequest?.url ?? item.src,
    item.title,
    onProgress,
    signal,
    youtubeRequest?.headers,
  );
  return {
    ...result,
    source: youtubeRequest ? "youtube-extraction" : "original",
  };
}

function hasDatabaseKey(item: PlaybackItem): boolean {
  return Boolean(item.provider && item.providerTrackId);
}

async function loadOrAnalyzeItem(
  item: PlaybackItem,
  onProgress: (ratio: number, phase: AnalysisPhase) => void,
  signal: AbortSignal,
): Promise<ChordAnalysis> {
  if (item.provider && item.providerTrackId) {
    try {
      const stored = await fetchChordTranscription(
        item.provider,
        item.providerTrackId,
      );
      if (stored?.cues.length) {
        onProgress(1, "complete");
        return {
          cues: stored.cues,
          duration: stored.duration,
          source: "database",
        };
      }
    } catch (error) {
      if (!canAnalyzeSource(item)) throw error;
    }
  }

  if (!canAnalyzeSource(item)) throw new UnavailableChordSourceError();
  const analysis = await analyzeDirectItem(item, onProgress, signal);

  if (item.provider && item.providerTrackId && analysis.cues.length) {
    try {
      await saveChordTranscription({
        provider: item.provider,
        providerTrackId: item.providerTrackId,
        title: item.title,
        artist: item.artist,
        analysis,
        engineVersion: CHORD_ENGINE_VERSION,
      });
    } catch {
      // The local analysis remains usable if persistence is temporarily down.
    }
  }
  return analysis;
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
  const analyzable = Boolean(
    item && (canAnalyzeSource(item) || hasDatabaseKey(item)),
  );

  useEffect(() => {
    setProgress(0);
    setPhase("decoding");
  }, [item?.id, item?.src]);

  const query = useQuery({
    queryKey: ["chord-analysis", item?.id, item?.src],
    queryFn: ({ signal }) =>
      loadOrAnalyzeItem(
        item!,
        (nextProgress, nextPhase) => {
          setProgress(nextProgress);
          setPhase(nextPhase);
        },
        signal,
      ),
    enabled: enabled && analyzable,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 30 * 60 * 1000,
    retry: false,
  });

  if (!enabled || !item)
    return { analysis: null, status: "idle", progress, phase };
  if (!analyzable)
    return { analysis: null, status: "unavailable", progress, phase };
  if (query.isPending || query.isFetching)
    return {
      analysis: query.data ?? null,
      status: "loading",
      progress,
      phase,
    };
  if (query.error instanceof UnavailableChordSourceError)
    return { analysis: null, status: "unavailable", progress, phase };
  if (query.isError)
    return { analysis: null, status: "error", progress, phase };
  return {
    analysis: query.data ?? null,
    status: "success",
    progress: 1,
    phase: "complete",
  };
}
