import { describe, expect, it } from "vitest";
import {
  TranscriptionRateLimitError,
  getFriendlyTranscriptionError,
  parseTranscriptionApiError,
} from "./transcriptionsApi";

describe("transcription API errors", () => {
  it("formats a 429 as a friendly user-facing message", () => {
    const error = parseTranscriptionApiError(
      429,
      '{"statusCode":429,"message":"Trop de requêtes. Réessayez plus tard."}',
      "30",
    );

    expect(error).toBeInstanceOf(TranscriptionRateLimitError);
    expect((error as TranscriptionRateLimitError).retryAfterSeconds).toBe(30);
    expect(getFriendlyTranscriptionError(error)).toContain("temporairement saturé");
    expect(getFriendlyTranscriptionError(error)).not.toContain("Trop de requêtes");
  });

  it("keeps non-rate-limit failures readable without exposing raw backend payloads", () => {
    const error = parseTranscriptionApiError(500, '{"statusCode":500,"message":"server exploded"}', null);

    expect(error).toBeInstanceOf(Error);
    expect(getFriendlyTranscriptionError(error)).toContain("La transcription a échoué");
  });

  it("renders a configuration error with actionable guidance for missing Audius token", () => {
    const error = parseTranscriptionApiError(
      500,
      '{"statusCode":500,"message":"Missing required configuration: AUDIUS_ACCESS_TOKEN. Configure it in your .env.development.local or .env file before starting the transcription worker."}',
      null,
    );

    expect(getFriendlyTranscriptionError(error)).toContain("AUDIUS_ACCESS_TOKEN");
    expect(getFriendlyTranscriptionError(error)).toContain(".env.development.local");
  });

  it("renders retry conflicts with a clear user message instead of raw backend status text", () => {
    const error = parseTranscriptionApiError(
      409,
      '{"statusCode":409,"message":"Only failed transcriptions can be retried"}',
      null,
    );

    expect(getFriendlyTranscriptionError(error)).toContain("ne peut pas être relancée");
  });
});
