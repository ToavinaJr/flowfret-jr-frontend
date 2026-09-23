type ValueOf<T> = T[keyof T];

export const FRIENDSHIP_STATUS = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
  CANCELED: "CANCELED",
  BLOCKED: "BLOCKED",
} as const;
export type FriendshipStatus = ValueOf<typeof FRIENDSHIP_STATUS>;

export const USER_ROLE = {
  USER: "USER",
  ADMIN: "ADMIN",
} as const;
export type UserRole = ValueOf<typeof USER_ROLE>;

export const PROFILE_VISIBILITY = {
  PUBLIC: "PUBLIC",
  FRIENDS: "FRIENDS",
  PRIVATE: "PRIVATE",
} as const;
export type ProfileVisibility = ValueOf<typeof PROFILE_VISIBILITY>;

export const REPORT_STATUS = {
  OPEN: "OPEN",
  REVIEWED: "REVIEWED",
  DISMISSED: "DISMISSED",
  RESOLVED: "RESOLVED",
} as const;
export type ReportStatus = ValueOf<typeof REPORT_STATUS>;

export const MUSIC_PROVIDER = {
  YOUTUBE: "YOUTUBE",
  AUDIUS: "AUDIUS",
  SPOTIFY: "SPOTIFY",
} as const;
export type MusicProvider = ValueOf<typeof MUSIC_PROVIDER>;

export const NOTIFICATION_KIND = {
  FRIEND_REQUEST: "FRIEND_REQUEST",
  FRIEND_ACCEPTED: "FRIEND_ACCEPTED",
  FRIEND_POST: "FRIEND_POST",
  POST_LIKE: "POST_LIKE",
  POST_COMMENT: "POST_COMMENT",
  FOLLOWED_POST_ACTIVITY: "FOLLOWED_POST_ACTIVITY",
} as const;
export type NotificationKind = ValueOf<typeof NOTIFICATION_KIND>;

export const ACTIVITY_ACTION = {
  TRACK_LISTENED: "TRACK_LISTENED",
  FRIEND_REQUESTED: "FRIEND_REQUESTED",
  FRIEND_ACCEPTED: "FRIEND_ACCEPTED",
  POST_CREATED: "POST_CREATED",
  POST_LIKED: "POST_LIKED",
  COMMENT_CREATED: "COMMENT_CREATED",
} as const;
export type ActivityAction = ValueOf<typeof ACTIVITY_ACTION>;

export const TRANSCRIPTION_STATUS = {
  PENDING: "PENDING",
  DOWNLOADING: "DOWNLOADING",
  PROCESSING: "PROCESSING",
  READY_TO_PLAY: "READY_TO_PLAY",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;
export type TranscriptionStatus = ValueOf<typeof TRANSCRIPTION_STATUS>;

export const TRANSCRIPTION_ERROR_CODE = {
  FAILED: "TRANSCRIPTION_FAILED",
} as const;

export const TRANSCRIPTION_PHASE = {
  AUDIO_PREPARING: "AUDIO_PREPARING",
  MODEL_LOADING: "MODEL_LOADING",
  MODEL_READY: "MODEL_READY",
  TRANSCRIBING: "TRANSCRIBING",
  COMPLETED: "COMPLETED",
} as const;
export type TranscriptionPhase = ValueOf<typeof TRANSCRIPTION_PHASE>;

export const TRANSCRIPTION_EVENT = {
  PENDING: "transcription.pending",
  PROCESSING: "transcription.processing",
  MODEL_LOADING: "transcription.model-loading",
  MODEL_READY: "transcription.model-ready",
  PROGRESS: "transcription.progress",
  SEGMENT: "transcription.segment",
  READY_TO_PLAY: "transcription.ready-to-play",
  COMPLETED: "transcription.completed",
  FAILED: "transcription.failed",
  HEARTBEAT: "transcription.heartbeat",
} as const;
export type TranscriptionEventType = ValueOf<typeof TRANSCRIPTION_EVENT>;

export const PLAYER_PREPARATION_STATE = {
  IDLE: "IDLE",
  CHECKING_CACHE: "CHECKING_CACHE",
  PREPARING_LYRICS: "PREPARING_LYRICS",
  READY: "READY",
  PLAYING: "PLAYING",
  BUFFERING_LYRICS: "BUFFERING_LYRICS",
  PAUSED: "PAUSED",
  COMPLETED: "COMPLETED",
  FAILED: "FAILED",
} as const;
export type PlayerPreparationState = ValueOf<typeof PLAYER_PREPARATION_STATE>;
