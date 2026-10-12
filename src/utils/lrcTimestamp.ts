const TIMESTAMP_PATTERN = /^(\d{1,3}):([0-5]\d)[.:](\d{1,2})$/;

export function formatLrcTimestamp(ms: number | null): string {
  if (ms === null || !Number.isFinite(ms) || ms < 0) return "";
  const totalCentiseconds = Math.round(ms / 10);
  const minutes = Math.floor(totalCentiseconds / 6000);
  const seconds = Math.floor((totalCentiseconds % 6000) / 100);
  const centiseconds = totalCentiseconds % 100;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

export function parseLrcTimestamp(value: string): number | null {
  const match = TIMESTAMP_PATTERN.exec(value.trim());
  if (!match) return null;
  const minutes = Number(match[1]);
  const seconds = Number(match[2]);
  const centiseconds = Number(match[3].padEnd(2, "0"));
  return (minutes * 60 + seconds) * 1000 + centiseconds * 10;
}
