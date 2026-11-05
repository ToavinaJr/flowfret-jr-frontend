export const MIN_PRACTICE_LOOP_SECONDS = 0.5;

export interface PracticeLoop {
  start: number | null;
  end: number | null;
  enabled: boolean;
}

export const EMPTY_PRACTICE_LOOP: PracticeLoop = {
  start: null,
  end: null,
  enabled: false,
};

export function normalizeLoopTime(time: number, duration: number): number {
  const finiteTime = Number.isFinite(time) ? Math.max(0, time) : 0;
  return Number.isFinite(duration) && duration > 0
    ? Math.min(finiteTime, duration)
    : finiteTime;
}

export function isPracticeLoopValid(
  loop: PracticeLoop,
  duration: number,
): boolean {
  if (loop.start === null || loop.end === null) return false;
  if (loop.start < 0 || loop.end <= loop.start) return false;
  if (loop.end - loop.start < MIN_PRACTICE_LOOP_SECONDS) return false;
  return !Number.isFinite(duration) || duration <= 0 || loop.end <= duration;
}

export function setPracticeLoopStart(
  loop: PracticeLoop,
  time: number,
  duration: number,
): PracticeLoop {
  const start = normalizeLoopTime(time, duration);
  const end = loop.end !== null && loop.end - start >= MIN_PRACTICE_LOOP_SECONDS
    ? loop.end
    : null;
  return { start, end, enabled: loop.enabled && end !== null };
}

export function setPracticeLoopEnd(
  loop: PracticeLoop,
  time: number,
  duration: number,
): PracticeLoop | null {
  if (loop.start === null) return null;
  const end = normalizeLoopTime(time, duration);
  if (end - loop.start < MIN_PRACTICE_LOOP_SECONDS) return null;
  return { ...loop, end, enabled: true };
}

export function clampPracticeLoop(
  loop: PracticeLoop,
  duration: number,
): PracticeLoop {
  if (!Number.isFinite(duration) || duration <= 0 || loop.end === null) return loop;
  const end = Math.min(loop.end, duration);
  if (loop.start === null || end - loop.start < MIN_PRACTICE_LOOP_SECONDS) {
    return { ...loop, start: null, end: null, enabled: false };
  }
  if (end === loop.end) return loop;
  return { ...loop, end };
}
