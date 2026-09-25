import { runtimeConfig } from "@/config/runtime";

export function debugLog(
  event: string,
  details: Record<string, unknown>,
): void {
  if (runtimeConfig.debug) console.debug(`[FlowFret] ${event}`, details);
}

export function debugError(
  event: string,
  details: Record<string, unknown>,
): void {
  if (runtimeConfig.debug) console.error(`[FlowFret] ${event}`, details);
}
