import {
  TRANSCRIPTION_ERROR_CODE,
  TRANSCRIPTION_EVENT,
  TRANSCRIPTION_PHASE,
  TRANSCRIPTION_STATUS,
} from "@/constants/domain";
import type {
  TranscriptionEvent,
  TranscriptionResponse,
} from "@/types/transcription";
import { mergeSegments } from "@/utils/transcription";

export function reduceTranscriptionEvent(
  current: TranscriptionResponse,
  event: TranscriptionEvent,
): TranscriptionResponse {
  const failed = event.type === TRANSCRIPTION_EVENT.FAILED;
  const completed = event.type === TRANSCRIPTION_EVENT.COMPLETED;
  const ready =
    current.readyToPlay ||
    event.type === TRANSCRIPTION_EVENT.READY_TO_PLAY ||
    completed;
  return {
    ...current,
    segments: event.segment
      ? mergeSegments(current.segments, [event.segment])
      : current.segments,
    progress: event.progress ?? current.progress,
    bufferedUntil: event.bufferedUntil ?? current.bufferedUntil,
    readyToPlay: ready,
    processingPhase:
      event.processingPhase ??
      (event.type === TRANSCRIPTION_EVENT.MODEL_LOADING
        ? TRANSCRIPTION_PHASE.MODEL_LOADING
        : event.type === TRANSCRIPTION_EVENT.MODEL_READY
          ? TRANSCRIPTION_PHASE.MODEL_READY
          : current.processingPhase),
    status: failed
      ? TRANSCRIPTION_STATUS.FAILED
      : completed
        ? TRANSCRIPTION_STATUS.COMPLETED
        : event.type === TRANSCRIPTION_EVENT.READY_TO_PLAY
          ? TRANSCRIPTION_STATUS.READY_TO_PLAY
          : current.status,
    lrcAvailable: current.lrcAvailable || completed,
    error: failed
      ? {
          code: event.errorCode ?? TRANSCRIPTION_ERROR_CODE.FAILED,
          message: event.message ?? "Transcription failed",
        }
      : current.error,
  };
}
