const TIMESTAMP_PATTERN = /^(\d{1,3}):([0-5]?\d):([0-5]?\d)$/;

/** h:mm:ss, whole seconds only — simple enough to type by hand while aligning. */
export function formatLrcTimestamp(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms) || ms < 0) return "";
  const totalSeconds = Math.round(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function parseLrcTimestamp(value: string): number | null {
  const match = TIMESTAMP_PATTERN.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3]);
  return ((hours * 60 + minutes) * 60 + seconds) * 1000;
}
