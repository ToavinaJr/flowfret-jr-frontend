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
});
