import type {
  TranscriptionEventType,
  TranscriptionPhase,
  TranscriptionStatus,
} from "@/constants/domain";
export type {
  PlayerPreparationState,
  TranscriptionEventType,
  TranscriptionPhase,
  TranscriptionStatus,
} from "@/constants/domain";

export interface TranscriptionWord {
  start: number;
  end: number;
  text: string;
  probability?: number;
}
export interface TranscriptionSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  words: TranscriptionWord[];
}
export interface TranscriptionError {
  code: string;
  message: string;
}
export interface TranscriptionResponse {
  transcriptionId: string;
  provider: "AUDIUS" | "SPOTIFY" | "YOUTUBE";
  trackId: string;
  title: string | null;
  artist: string | null;
  createdAt: string;
  updatedAt: string;
  jobId: string | null;
  status: TranscriptionStatus;
  cached: boolean;
  readyToPlay: boolean;
  processingPhase: TranscriptionPhase | null;
  bufferedUntil: number;
  progress: number;
  segments: TranscriptionSegment[];
  language: string | null;
  detectedLanguage: string | null;
  lrcAvailable: boolean;
  error: TranscriptionError | null;
}
export interface TranscriptionEvent {
  type: TranscriptionEventType;
  transcriptionId: string;
  progress?: number;
  bufferedUntil?: number;
  readyToPlay?: boolean;
  processingPhase?: TranscriptionPhase;
  segment?: TranscriptionSegment;
  errorCode?: string;
  message?: string;
  timestamp?: string;
}
