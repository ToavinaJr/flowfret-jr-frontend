import { useCallback, useEffect, useRef, useState } from "react";
import { createTranscription, getTranscription, retryTranscription, streamTranscriptionEvents } from "@/services/transcriptionsApi";
import type { MusicTrack } from "@/types/music";
import type { TranscriptionEvent, TranscriptionResponse } from "@/types/transcription";
import { mergeSegments } from "@/utils/transcription";

export function useTranscriptionEvents(track: MusicTrack) {
  const [state, setState] = useState<TranscriptionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const activeIdRef = useRef<string | null>(null);

  const applyEvent = useCallback((event: TranscriptionEvent) => {
    if (event.transcriptionId !== activeIdRef.current) return;
    setState((current) => {
      if (!current) return current;
      const segments = event.segment ? mergeSegments(current.segments, [event.segment]) : current.segments;
      const failed = event.type === "transcription.failed";
      const completed = event.type === "transcription.completed";
      const ready = current.readyToPlay || event.type === "transcription.ready-to-play" || completed;
      return { ...current, segments, progress: event.progress ?? current.progress, bufferedUntil: event.bufferedUntil ?? current.bufferedUntil, readyToPlay: ready,
        status: failed ? "FAILED" : completed ? "COMPLETED" : event.type === "transcription.ready-to-play" ? "READY_TO_PLAY" : current.status,
        lrcAvailable: current.lrcAvailable || completed, error: failed ? { code: event.errorCode ?? "TRANSCRIPTION_FAILED", message: event.message ?? "Transcription failed" } : current.error };
    });
  }, []);

  const connect = useCallback(async (id: string) => {
    controllerRef.current?.abort();
    const controller = new AbortController(); controllerRef.current = controller;
    for (let attempt = 0; attempt < 4 && !controller.signal.aborted; attempt += 1) {
      try {
        if (attempt > 0) setState(await getTranscription(id));
        await streamTranscriptionEvents(id, controller.signal, applyEvent);
        return;
      } catch (connectionError) {
        if (controller.signal.aborted) return;
        if (attempt === 3) setError(connectionError instanceof Error ? connectionError.message : "SSE failed");
        await new Promise((resolve) => window.setTimeout(resolve, 500 * 2 ** attempt));
      }
    }
  }, [applyEvent]);

  const prepare = useCallback(async () => {
    setError(null);
    const response = await createTranscription({ trackId: track.audiusId, audioUrl: track.streamUrl, title: track.title, artist: track.artists[0]?.name, model: "small" });
    activeIdRef.current = response.transcriptionId;
    setState(response);
    if (!response.cached && response.status !== "FAILED") void connect(response.transcriptionId);
    return response;
  }, [connect, track]);

  const retry = useCallback(async () => {
    if (!state) return;
    const response = await retryTranscription(state.transcriptionId, track.streamUrl);
    activeIdRef.current = response.transcriptionId; setState(response); setError(null); void connect(response.transcriptionId);
  }, [connect, state, track.streamUrl]);

  useEffect(() => () => controllerRef.current?.abort(), []);
  useEffect(() => { controllerRef.current?.abort(); activeIdRef.current = null; setState(null); setError(null); }, [track.audiusId]);
  return { transcription: state, error, prepare, retry };
}
