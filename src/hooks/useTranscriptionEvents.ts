import { useCallback, useEffect, useRef, useState } from "react";
import {
  createTranscription,
  getFriendlyTranscriptionError,
  getTranscription,
  retryTranscription,
  streamTranscriptionEvents,
  TranscriptionRateLimitError,
} from "@/services/transcriptionsApi";
import type { MusicTrack } from "@/types/music";
import type {
  TranscriptionEvent,
  TranscriptionResponse,
} from "@/types/transcription";
import { mergeSegments } from "@/utils/transcription";
import {
  TRANSCRIPTION_EVENT,
  TRANSCRIPTION_ERROR_CODE,
  TRANSCRIPTION_PHASE,
  TRANSCRIPTION_STATUS,
} from "@/constants/domain";

export function useTranscriptionEvents(track: MusicTrack) {
  const [state, setState] = useState<TranscriptionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const retryTimerRef = useRef<number | null>(null);
  const prepareRef = useRef<
    (() => Promise<TranscriptionResponse | undefined>) | null
  >(null);

  const applyEvent = useCallback((event: TranscriptionEvent) => {
    if (event.transcriptionId !== activeIdRef.current) {
      console.warn("[FretFlow:transcription] stale_event_ignored", {
        eventId: event.transcriptionId,
        activeId: activeIdRef.current,
      });
      return;
    }
    setState((current) => {
      if (!current) return current;
      const segments = event.segment
        ? mergeSegments(current.segments, [event.segment])
        : current.segments;
      const failed = event.type === TRANSCRIPTION_EVENT.FAILED;
      const completed = event.type === TRANSCRIPTION_EVENT.COMPLETED;
      const ready =
        current.readyToPlay ||
        event.type === TRANSCRIPTION_EVENT.READY_TO_PLAY ||
        completed;
      return {
        ...current,
        segments,
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
    });
    if (event.type === TRANSCRIPTION_EVENT.COMPLETED) {
      void getTranscription(event.transcriptionId)
        .then((snapshot) => {
          if (activeIdRef.current === event.transcriptionId) setState(snapshot);
        })
        .catch((snapshotError) => {
          console.error("[FretFlow:transcription] final_snapshot_failed", {
            transcriptionId: event.transcriptionId,
            error: snapshotError,
          });
        });
    }
  }, []);

  const connect = useCallback(
    async (id: string) => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      for (
        let attempt = 0;
        attempt < 4 && !controller.signal.aborted;
        attempt += 1
      ) {
        try {
          if (attempt > 0) setState(await getTranscription(id));
          await streamTranscriptionEvents(id, controller.signal, applyEvent);
          return;
        } catch (connectionError) {
          if (controller.signal.aborted) return;
          console.error("[FretFlow:transcription] sse_attempt_failed", {
            transcriptionId: id,
            attempt: attempt + 1,
            error: connectionError,
          });
          if (attempt === 3)
            setError(
              connectionError instanceof Error
                ? connectionError.message
                : "SSE failed",
            );
          await new Promise((resolve) =>
            window.setTimeout(resolve, 500 * 2 ** attempt),
          );
        }
      }
    },
    [applyEvent],
  );

  const scheduleRateLimitRetry = useCallback((retryError: unknown) => {
    if (!(retryError instanceof TranscriptionRateLimitError)) return false;
    const delayMs = ((retryError.retryAfterSeconds ?? 30) + 1) * 1000;
    if (retryTimerRef.current) window.clearTimeout(retryTimerRef.current);
    retryTimerRef.current = window.setTimeout(() => {
      setError(null);
      void prepareRef.current?.();
    }, delayMs);
    return true;
  }, []);

  const prepare = useCallback(async () => {
    setError(null);
    try {
      const response = await createTranscription({
        trackId: track.audiusId,
        audioUrl: track.streamUrl,
        title: track.title,
        artist: track.artists[0]?.name,
        model: "small",
      });
      activeIdRef.current = response.transcriptionId;
      setState(response);
      if (!response.cached && response.status !== TRANSCRIPTION_STATUS.FAILED)
        void connect(response.transcriptionId);
      return response;
    } catch (prepareError) {
      console.error("[FretFlow:transcription] prepare_failed", {
        trackId: track.audiusId,
        error: prepareError,
      });
      const friendlyError = getFriendlyTranscriptionError(prepareError);
      if (scheduleRateLimitRetry(prepareError)) {
        setError(friendlyError);
        return undefined;
      }
      setError(friendlyError);
      throw prepareError;
    }
  }, [connect, scheduleRateLimitRetry, track]);

  prepareRef.current = prepare;

  const retry = useCallback(async () => {
    if (!state) return;
    try {
      const response = await retryTranscription(
        state.transcriptionId,
        track.streamUrl,
      );
      activeIdRef.current = response.transcriptionId;
      setState(response);
      setError(null);
      void connect(response.transcriptionId);
      return response;
    } catch (retryError) {
      const friendlyError = getFriendlyTranscriptionError(retryError);
      if (scheduleRateLimitRetry(retryError)) {
        setError(friendlyError);
        return undefined;
      }
      setError(friendlyError);
      throw retryError;
    }
  }, [connect, scheduleRateLimitRetry, state, track.streamUrl]);

  useEffect(
    () => () => {
      controllerRef.current?.abort();
      if (retryTimerRef.current) window.clearTimeout(retryTimerRef.current);
    },
    [],
  );
  useEffect(() => {
    controllerRef.current?.abort();
    activeIdRef.current = null;
    setState(null);
    setError(null);
  }, [track.audiusId]);
  return { transcription: state, error, prepare, retry };
}
