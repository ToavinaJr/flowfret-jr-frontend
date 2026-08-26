const DEBUG_ENABLED = ['1', 'true', 'yes', 'on'].includes(
  (import.meta.env.DEBUG ?? '').trim().toLowerCase(),
);

export function debugLog(event: string, details: Record<string, unknown>): void {
  if (DEBUG_ENABLED) console.debug(`[FretFlow] ${event}`, details);
}

export function debugError(event: string, details: Record<string, unknown>): void {
  if (DEBUG_ENABLED) console.error(`[FretFlow] ${event}`, details);
}
