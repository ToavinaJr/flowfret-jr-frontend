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
  status?: string;
  role?: string;
  postStatus?: string;
  transcriptionStatus?: string;
  provider?: string;
  action?: string;
  entityType?: string;
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
