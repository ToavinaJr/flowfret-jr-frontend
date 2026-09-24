import type { MusicProvider } from "@/constants/domain";
import type { ChordAnalysis } from "@/hooks/useChordAnalysis";
import type { ChordCue } from "@/types/song";
import { graphqlRequest } from "@/services/graphqlClient";

export interface StoredChordTranscription {
  provider: MusicProvider;
  providerTrackId: string;
  duration: number;
  cues: ChordCue[];
  engineVersion: string;
}

export async function fetchChordTranscription(
  provider: MusicProvider,
  providerTrackId: string,
): Promise<StoredChordTranscription | null> {
  const data = await graphqlRequest<{
    chordTranscription: StoredChordTranscription | null;
  }>({
    query: `query ChordTranscription($provider: MusicProvider!, $providerTrackId: String!) {
      chordTranscription(provider: $provider, providerTrackId: $providerTrackId) {
        provider providerTrackId duration engineVersion
        cues { start end chord }
      }
    }`,
    variables: { provider, providerTrackId },
  });
  return data.chordTranscription;
}

export async function saveChordTranscription(input: {
  provider: MusicProvider;
  providerTrackId: string;
  title: string;
  artist?: string;
  analysis: ChordAnalysis;
  engineVersion: string;
}): Promise<StoredChordTranscription> {
  const data = await graphqlRequest<{
    saveChordTranscription: StoredChordTranscription;
  }>({
    query: `mutation SaveChordTranscription($data: SaveChordTranscriptionInput!) {
      saveChordTranscription(data: $data) {
        provider providerTrackId duration engineVersion
        cues { start end chord }
      }
    }`,
    variables: {
      data: {
        provider: input.provider,
        providerTrackId: input.providerTrackId,
        title: input.title,
        artist: input.artist,
        duration: input.analysis.duration,
        cues: input.analysis.cues,
        engineVersion: input.engineVersion,
      },
    },
  });
  return data.saveChordTranscription;
}
