import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MUSIC_PROVIDER } from "@/constants/domain";
import type { PlaybackItem } from "@/contexts/PlaybackContext";
import { searchMusic } from "@/services/musicGraphql";
import type { ChordCue } from "@/types/song";
import type { MusicTrack } from "@/types/music";
import {
  analyzeAudioUrl,
  type AnalysisPhase,
} from "@/utils/chordDetection";

export interface ChordAnalysis {
  cues: ChordCue[];
  duration: number;
  source: "original" | "audius-match";
  matchedTitle?: string;
  matchedArtist?: string;
}

export type ChordAnalysisStatus =
  | "idle"
  | "loading"
  | "success"
  | "unavailable"
  | "error";

class ChordSourceUnavailableError extends Error {}

function normalize(value: string): string[] {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(official|audio|video|lyrics?|visuali[sz]er|remaster(?:ed)?|feat|ft)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter((token) => token.length > 1);
}

function overlap(left: readonly string[], right: readonly string[]): number {
  if (!left.length || !right.length) return 0;
  const rightSet = new Set(right);
  return left.filter((token) => rightSet.has(token)).length / left.length;
}

export function chooseBestAudiusMatch(
  item: Pick<PlaybackItem, "title" | "artist" | "subtitle" | "duration">,
  tracks: readonly MusicTrack[],
): MusicTrack | null {
  const wantedTitle = normalize(item.title);
  const wantedArtist = normalize(item.artist || item.subtitle);
  const scored = tracks.map((track) => {
    const candidateTitle = normalize(track.title);
    const candidateArtist = normalize(
      track.artists.map((artist) => artist.name).join(" "),
    );
    const titleScore =
      (overlap(wantedTitle, candidateTitle) + overlap(candidateTitle, wantedTitle)) /
      2;
    const artistScore = Math.max(
      overlap(wantedArtist, candidateArtist),
      overlap(candidateArtist, wantedArtist),
    );
    const durationDifference =
      item.duration && track.durationMs
        ? Math.abs(item.duration - track.durationMs / 1000)
        : 0;
    const durationScore = durationDifference <= 8 ? 1 : durationDifference <= 20 ? 0.5 : 0;
    return {
      track,
      score: titleScore * 0.65 + artistScore * 0.25 + durationScore * 0.1,
    };
  });
  const best = scored.sort((left, right) => right.score - left.score)[0];
  return best && best.score >= 0.5 ? best.track : null;
}

async function analyzeItem(
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

  const hasDirectAudio =
    item.engine === "audio" ||
    item.src.startsWith("blob:") ||
    item.src.startsWith("data:");
  if (hasDirectAudio) {
    const result = await analyzeAudioUrl(
      item.src,
      item.title,
      onProgress,
      signal,
    );
    return { ...result, source: "original" };
  }

  const query = [item.artist || item.subtitle, item.title]
    .filter(Boolean)
    .join(" ");
  onProgress(0, "matching");
  const result = await searchMusic(query, 5, undefined, MUSIC_PROVIDER.AUDIUS);
  const match = chooseBestAudiusMatch(item, result.tracks);
  if (!match) throw new ChordSourceUnavailableError();
  const analysis = await analyzeAudioUrl(
    match.streamUrl,
    item.title,
    onProgress,
    signal,
  );
  return {
    ...analysis,
    source: "audius-match",
    matchedTitle: match.title,
    matchedArtist: match.artists.map((artist) => artist.name).join(", "),
  };
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
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<AnalysisPhase>("decoding");

  useEffect(() => {
    setProgress(0);
    setPhase("decoding");
  }, [item?.id, item?.src]);

  useEffect(() => {
    if (!enabled && item) {
      void queryClient.cancelQueries({
        queryKey: ["chord-analysis", item.id, item.src],
        exact: true,
      });
    }
  }, [enabled, item, queryClient]);

  const query = useQuery({
    queryKey: ["chord-analysis", item?.id, item?.src],
    queryFn: ({ signal }) =>
      analyzeItem(
        item!,
        (nextProgress, nextPhase) => {
          setProgress(nextProgress);
          setPhase(nextPhase);
        },
        signal,
      ),
    enabled: enabled && Boolean(item),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 30 * 60 * 1000,
    retry: false,
  });

  if (!enabled || !item)
    return { analysis: null, status: "idle", progress, phase };
  if (query.isPending || query.isFetching)
    return {
      analysis: query.data ?? null,
      status: "loading",
      progress,
      phase,
    };
  if (query.error instanceof ChordSourceUnavailableError)
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
