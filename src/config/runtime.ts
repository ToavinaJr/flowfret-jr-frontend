function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export const runtimeConfig = Object.freeze({
  graphqlUrl: import.meta.env.VITE_GRAPHQL_URL?.trim(),
  googleClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? "",
  transcriptionHttpTimeoutMs: positiveInteger(
    import.meta.env.VITE_TRANSCRIPTION_HTTP_TIMEOUT_MS,
    20_000,
  ),
  debug: ["1", "true", "yes", "on"].includes(
    (import.meta.env.VITE_DEBUG ?? "").trim().toLowerCase(),
  ),
});
