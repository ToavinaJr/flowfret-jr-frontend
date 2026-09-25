import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PlaybackItem } from "@/contexts/PlaybackContext";
import type { ChordCue } from "@/types/song";
import { getYouTubeAudioRequest } from "@/services/youtubeAudioApi";
import {
  AudioAnalysisError,
  analyzeAudioUrl,
  type AnalysisPhase,
} from "@/utils/chordDetection";
import {
  fetchChordTranscription,
  saveChordTranscription,
} from "@/services/chordTranscriptionsApi";
import { ApiClientError } from "@/types/api";
import { debugError, debugLog } from "@/utils/debug";

const CHORD_ENGINE_VERSION = "browser-chroma-v1";

class UnavailableChordSourceError extends Error {}

export interface ChordAnalysis {
  cues: ChordCue[];
  duration: number;
  source: "original" | "youtube-extraction" | "database";
}

export type ChordAnalysisStatus =
  "idle" | "loading" | "success" | "unavailable" | "error";

export type ChordAnalysisErrorCode =
  | "authentication"
  | "rateLimited"
  | "extractorConfiguration"
  | "youtubeExtraction"
  | "audioStream"
  | "audioDecode"
  | "network"
  | "unknown";

export interface ChordAnalysisFailure {
  code: ChordAnalysisErrorCode;
  status?: number;
  diagnosticId?: string;
}

export function classifyChordAnalysisError(
  error: unknown,
): ChordAnalysisFailure {
  if (error instanceof AudioAnalysisError) {
    if (error.status === 401 || error.status === 403) {
      return {
        code: "authentication",
        status: error.status,
        diagnosticId: error.diagnosticId,
      };
    }
    if (error.status === 429) {
      return {
        code: "rateLimited",
        status: error.status,
        diagnosticId: error.diagnosticId,
      };
    }
    if (error.status === 503) {
      return {
        code: "extractorConfiguration",
        status: error.status,
        diagnosticId: error.diagnosticId,
      };
    }
    if (error.status === 502) {
      return {
        code: "youtubeExtraction",
        status: error.status,
        diagnosticId: error.diagnosticId,
      };
    }
    if (error.phase === "stream") {
      return {
        code: "audioStream",
        status: error.status,
        diagnosticId: error.diagnosticId,
      };
    }
    if (error.phase === "decode") {
      return {
        code: "audioDecode",
        status: error.status,
        diagnosticId: error.diagnosticId,
      };
    }
    if (error.status === 0) return { code: "network" };
  }
  if (error instanceof ApiClientError) {
    if (error.status === 401 || error.status === 403) {
      return { code: "authentication", status: error.status };
    }
    if (error.status === 429) return { code: "rateLimited", status: 429 };
    if (error.status === 0) return { code: "network" };
  }
  return { code: "unknown" };
}

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
      debugLog("chords.cache_lookup_started", {
        provider: item.provider,
        providerTrackId: item.providerTrackId,
      });
      const stored = await fetchChordTranscription(
        item.provider,
        item.providerTrackId,
      );
      if (stored?.cues.length) {
        debugLog("chords.cache_hit", {
          provider: item.provider,
          providerTrackId: item.providerTrackId,
          cueCount: stored.cues.length,
        });
        onProgress(1, "complete");
        return {
          cues: stored.cues,
          duration: stored.duration,
          source: "database",
        };
      }
      debugLog("chords.cache_miss", {
        provider: item.provider,
        providerTrackId: item.providerTrackId,
      });
    } catch (error) {
      debugError("chords.cache_lookup_failed", {
        provider: item.provider,
        providerTrackId: item.providerTrackId,
        failure: classifyChordAnalysisError(error),
      });
      if (!canAnalyzeSource(item)) throw error;
    }
  }

  if (!canAnalyzeSource(item)) throw new UnavailableChordSourceError();
  debugLog("chords.direct_analysis_started", {
    engine: item.engine,
    provider: item.provider,
    providerTrackId: item.providerTrackId,
  });
  const analysis = await analyzeDirectItem(item, onProgress, signal);
  debugLog("chords.direct_analysis_succeeded", {
    source: analysis.source,
    duration: analysis.duration,
    cueCount: analysis.cues.length,
  });

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
      debugLog("chords.persistence_succeeded", {
        provider: item.provider,
        providerTrackId: item.providerTrackId,
      });
    } catch (error) {
      debugError("chords.persistence_failed", {
        provider: item.provider,
        providerTrackId: item.providerTrackId,
        failure: classifyChordAnalysisError(error),
      });
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
  failure: ChordAnalysisFailure | null;
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
    return { analysis: null, status: "idle", progress, phase, failure: null };
  if (!analyzable)
    return {
      analysis: null,
      status: "unavailable",
      progress,
      phase,
      failure: null,
    };
  if (query.isPending || query.isFetching)
    return {
      analysis: query.data ?? null,
      status: "loading",
      progress,
      phase,
      failure: null,
    };
  if (query.error instanceof UnavailableChordSourceError)
    return {
      analysis: null,
      status: "unavailable",
      progress,
      phase,
      failure: null,
    };
  if (query.isError)
    return {
      analysis: null,
      status: "error",
      progress,
      phase,
      failure: classifyChordAnalysisError(query.error),
    };
  return {
    analysis: query.data ?? null,
    status: "success",
    progress: 1,
    phase: "complete",
    failure: null,
  };
}
