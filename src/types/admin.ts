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
