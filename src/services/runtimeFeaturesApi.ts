import { GRAPHQL_URL } from "@/services/backend";

export interface RuntimeFeatures {
  chordTranscription: boolean;
}

const API_ORIGIN = new URL(GRAPHQL_URL).origin;

export async function fetchRuntimeFeatures(): Promise<RuntimeFeatures> {
  const response = await fetch(`${API_ORIGIN}/api/features`);
  if (!response.ok) {
    throw new Error("Unable to load application features.");
  }
  const features: unknown = await response.json();
  if (
    typeof features !== "object" ||
    features === null ||
    !("chordTranscription" in features) ||
    typeof features.chordTranscription !== "boolean"
  ) {
    throw new Error("Invalid application feature configuration.");
  }
  return { chordTranscription: features.chordTranscription };
}
