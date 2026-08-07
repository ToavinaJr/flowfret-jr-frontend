export type TranscriptionStatus = "PENDING" | "DOWNLOADING" | "PROCESSING" | "READY_TO_PLAY" | "COMPLETED" | "FAILED";
export type PlayerPreparationState = "IDLE" | "CHECKING_CACHE" | "PREPARING_LYRICS" | "READY" | "PLAYING" | "BUFFERING_LYRICS" | "PAUSED" | "COMPLETED" | "FAILED";

export interface TranscriptionWord { start: number; end: number; text: string; probability?: number; }
export interface TranscriptionSegment { id: string; start: number; end: number; text: string; words: TranscriptionWord[]; }
export interface TranscriptionError { code: string; message: string; }
export interface TranscriptionResponse {
  transcriptionId: string; jobId: string | null; status: TranscriptionStatus; cached: boolean; readyToPlay: boolean;
  bufferedUntil: number; progress: number; segments: TranscriptionSegment[]; language: string | null;
  detectedLanguage: string | null; lrcAvailable: boolean; error: TranscriptionError | null;
}
export type TranscriptionEventType = "transcription.pending" | "transcription.processing" | "transcription.progress" | "transcription.segment" | "transcription.ready-to-play" | "transcription.completed" | "transcription.failed" | "transcription.heartbeat";
export interface TranscriptionEvent {
  type: TranscriptionEventType; transcriptionId: string; progress?: number; bufferedUntil?: number; readyToPlay?: boolean;
  segment?: TranscriptionSegment; errorCode?: string; message?: string; timestamp?: string;
}

