export interface AdminCategoryStatistic {
  key: string;
  count: number;
}

export interface AdminDailyStatistic {
  date: string;
  users: number;
  posts: number;
  comments: number;
  reports: number;
  trackPlays: number;
}

export interface AdminDashboardStatistics {
  generatedAt: string;
  periodStart: string;
  periodEnd: string;
  days: number;
  totals: {
    users: number;
    activeUsers: number;
    posts: number;
    comments: number;
    openReports: number;
    uploads: number;
    transcriptions: number;
    chordTranscriptions: number;
    playlists: number;
    catalogTracks: number;
    trackPlays: number;
  };
  period: {
    newUsers: number;
    newPosts: number;
    newComments: number;
    newUploads: number;
    newTranscriptions: number;
    reportsCreated: number;
    trackPlays: number;
  };
  daily: AdminDailyStatistic[];
  usersByStatus: AdminCategoryStatistic[];
  transcriptionsByStatus: AdminCategoryStatistic[];
  playsByProvider: AdminCategoryStatistic[];
}

export interface AdminBackendStatus {
  databaseReachable: boolean;
  serverTime: string;
}

export const ADMIN_MANAGED_ENTITIES = [
  "USER",
  "PROFILE",
  "POST",
  "COMMENT",
  "FRIENDSHIP",
  "UPLOAD",
  "NOTIFICATION",
  "NOTIFICATION_PREFERENCE",
  "POST_LIKE",
  "POST_REPORT",
  "POST_MENTION",
  "COMMENT_MENTION",
  "POST_ATTACHMENT",
  "TRANSCRIPTION",
  "CHORD_TRANSCRIPTION",
  "LISTENING_HISTORY",
  "CATALOG_TRACK",
  "PLAYLIST",
  "PLAYLIST_ITEM",
  "TRANSCRIPTION_ACCESS",
] as const;
export type AdminManagedEntity = (typeof ADMIN_MANAGED_ENTITIES)[number];
export interface AdminManagedEntityConnection {
  nodes: Array<Record<string, unknown> & { _adminId: string }>;
  totalCount: number;
}

export interface AdminPageInfo {
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  endCursor: string | null;
}

export interface AdminConnection<T> {
  nodes: T[];
  totalCount: number;
  pageInfo: AdminPageInfo;
}

export interface AdminListInput {
  first?: number;
  after?: string;
  search?: string;
  includeDeleted?: boolean;
  direction?: "ASC" | "DESC";
  status?: string;
  role?: string;
  postStatus?: string;
  transcriptionStatus?: string;
  provider?: string;
  action?: string;
  entityType?: string;
  from?: string;
  to?: string;
  reportStatus?: string;
  uploadStatus?: string;
}

export interface AdminPostReport {
  id: string;
  postId: string;
  reporterId: string;
  reporterUsername: string;
  reason: string;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
  isDeleted: boolean;
  postContent: string | null;
  postAuthorUsername: string;
  postStatus: string;
  postVisibility: string;
  postIsDeleted: boolean;
}

export interface AdminLyricsReport {
  id: string;
  provider: string;
  trackId: string;
  title: string;
  artist: string;
  reporterId: string;
  reason: string;
  proposedLyrics: string | null;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
  isDeleted: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  status: string;
  role: string;
  lastLoginAt: string | null;
  createdAt: string;
  isDeleted: boolean;
  updatedAt?: string;
  deletedAt?: string | null;
  activity?: AdminUserActivity;
}

export interface AdminUserActivity {
  posts: number;
  comments: number;
  playlists: number;
  uploads: number;
}

export interface AdminUserSecurityResult {
  user: AdminUser;
  revokedSessionCount: number;
  auditLogId: string;
}

export interface AdminPost {
  id: string;
  authorId: string;
  authorUsername: string;
  content: string | null;
  visibility: string;
  status: string;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  isDeleted: boolean;
}

export interface AdminTranscription {
  id: string;
  provider: string;
  trackId: string;
  title: string | null;
  artist: string | null;
  status: string;
  progress: number;
  attempts: number;
  createdAt: string;
  isDeleted: boolean;
}

export interface AdminUpload {
  id: string;
  userId: string;
  username: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  status: string;
  sourceType: string;
  cleanupPending: boolean;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface AdminChordTranscription {
  id: string;
  provider: string;
  providerTrackId: string;
  title: string | null;
  artist: string | null;
  duration: number | null;
  cueCount: number | null;
  engineVersion: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface AdminPlaylist {
  id: string;
  userId: string;
  username: string;
  name: string;
  description: string | null;
  visibility: string;
  itemCount: number;
  createdAt: string;
  isDeleted: boolean;
}

export interface AdminCatalogTrack {
  id: string;
  provider: string;
  providerTrackId: string;
  title: string;
  artists: unknown;
  album: string | null;
  genre: string | null;
  durationMs: number;
  playlistCount: number;
  createdAt: string;
}

export interface AdminListeningHistory {
  id: string;
  userId: string;
  username: string;
  provider: string;
  providerTrackId: string;
  title: string;
  artists: unknown;
  playCount: number;
  lastPlayedAt: string;
  createdAt: string;
}

export interface AdminAuditLog {
  id: string;
  actorId: string;
  actorUsername: string;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}
