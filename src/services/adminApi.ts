import { graphqlRequest } from "@/services/graphqlClient";
import type {
  AdminAuditLog,
  AdminBackendStatus,
  AdminConnection,
  AdminCatalogTrack,
  AdminChordTranscription,
  AdminDashboardStatistics,
  AdminListeningHistory,
  AdminListInput,
  AdminPlaylist,
  AdminPostReport,
  AdminPost,
  AdminTranscription,
  AdminUpload,
  AdminUser,
  AdminUserSecurityResult,
} from "@/types/admin";

const PAGE_INFO_FIELDS =
  "pageInfo { hasNextPage hasPreviousPage endCursor } totalCount";

export async function fetchAdminBackendStatus(): Promise<AdminBackendStatus> {
  const result = await graphqlRequest<{
    adminBackendStatus: AdminBackendStatus;
  }>({
    query: `query AdminBackendStatus {
      adminBackendStatus { databaseReachable serverTime }
    }`,
  });
  return result.adminBackendStatus;
}

export async function fetchAdminDashboardStatistics(
  days = 30,
): Promise<AdminDashboardStatistics> {
  const result = await graphqlRequest<{
    adminDashboardStatistics: AdminDashboardStatistics;
  }>({
    query: `query AdminDashboardStatistics($input: AdminStatisticsInput) {
      adminDashboardStatistics(input: $input) {
        generatedAt
        periodStart
        periodEnd
        days
        totals {
          users activeUsers posts comments openReports uploads transcriptions
          chordTranscriptions playlists catalogTracks trackPlays
        }
        period {
          newUsers newPosts newComments newUploads newTranscriptions
          reportsCreated trackPlays
        }
        daily { date users posts comments reports trackPlays }
        usersByStatus { key count }
        transcriptionsByStatus { key count }
        playsByProvider { key count }
      }
    }`,
    variables: { input: { days } },
  });
  return result.adminDashboardStatistics;
}

export async function fetchAdminUsers(
  input: AdminListInput,
): Promise<AdminConnection<AdminUser>> {
  const result = await graphqlRequest<{
    adminUsers: AdminConnection<AdminUser>;
  }>({
    query: `query AdminUsers($input: AdminUsersInput) {
      adminUsers(input: $input) {
        nodes {
          id email username displayName status role lastLoginAt createdAt isDeleted
        }
        ${PAGE_INFO_FIELDS}
      }
    }`,
    variables: { input },
  });
  return result.adminUsers;
}

export async function fetchAdminUser(id: string): Promise<AdminUser> {
  const result = await graphqlRequest<{ adminUser: AdminUser | null }>({
    query: `query AdminUser($id: String!) {
      adminUser(id: $id) {
        id email username displayName status role lastLoginAt createdAt updatedAt isDeleted deletedAt
        activity { posts comments playlists uploads }
      }
    }`,
    variables: { id },
  });
  if (!result.adminUser) throw new Error("ADMIN_USER_NOT_FOUND");
  return result.adminUser;
}

export async function setAdminUserRole(
  userId: string,
  role: string,
  reason: string,
): Promise<AdminUserSecurityResult> {
  const result = await graphqlRequest<{
    adminSetUserRole: AdminUserSecurityResult;
  }>({
    query: `mutation AdminSetUserRole($input: AdminSetUserRoleInput!) {
      adminSetUserRole(input: $input) {
        user { id email username displayName status role lastLoginAt createdAt updatedAt isDeleted deletedAt }
        revokedSessionCount auditLogId
      }
    }`,
    variables: { input: { userId, role, reason } },
  });
  return result.adminSetUserRole;
}

export async function setAdminUserStatus(
  userId: string,
  status: string,
  reason: string,
): Promise<AdminUserSecurityResult> {
  const result = await graphqlRequest<{
    adminSetUserStatus: AdminUserSecurityResult;
  }>({
    query: `mutation AdminSetUserStatus($input: AdminSetUserStatusInput!) {
      adminSetUserStatus(input: $input) {
        user { id email username displayName status role lastLoginAt createdAt updatedAt isDeleted deletedAt }
        revokedSessionCount auditLogId
      }
    }`,
    variables: { input: { userId, status, reason } },
  });
  return result.adminSetUserStatus;
}

export async function deleteAdminUser(
  userId: string,
  reason: string,
): Promise<AdminUserSecurityResult> {
  const result = await graphqlRequest<{
    adminDeleteUser: AdminUserSecurityResult;
  }>({
    query: `mutation AdminDeleteUser($input: AdminUserActionInput!) {
      adminDeleteUser(input: $input) {
        user { id email username displayName status role lastLoginAt createdAt updatedAt isDeleted deletedAt }
        revokedSessionCount auditLogId
      }
    }`,
    variables: { input: { userId, reason } },
  });
  return result.adminDeleteUser;
}

export async function revokeAdminUserSessions(
  userId: string,
  reason: string,
): Promise<AdminUserSecurityResult> {
  const result = await graphqlRequest<{
    adminRevokeUserSessions: AdminUserSecurityResult;
  }>({
    query: `mutation AdminRevokeUserSessions($input: AdminUserActionInput!) {
      adminRevokeUserSessions(input: $input) {
        user { id email username displayName status role lastLoginAt createdAt updatedAt isDeleted deletedAt }
        revokedSessionCount auditLogId
      }
    }`,
    variables: { input: { userId, reason } },
  });
  return result.adminRevokeUserSessions;
}

export async function fetchAdminPosts(
  input: AdminListInput,
): Promise<AdminConnection<AdminPost>> {
  const result = await graphqlRequest<{
    adminPosts: AdminConnection<AdminPost>;
  }>({
    query: `query AdminPosts($input: AdminContentInput) {
      adminPosts(input: $input) {
        nodes {
          id authorId authorUsername content visibility status likeCount
          commentCount createdAt isDeleted
        }
        ${PAGE_INFO_FIELDS}
      }
    }`,
    variables: { input },
  });
  return result.adminPosts;
}

export async function fetchAdminPostReports(
  input: AdminListInput,
): Promise<AdminConnection<AdminPostReport>> {
  const result = await graphqlRequest<{
    adminPostReports: AdminConnection<AdminPostReport>;
  }>({
    query: `query AdminPostReports($input: AdminContentInput) {
      adminPostReports(input: $input) {
        nodes {
          id postId reporterId reporterUsername reason status createdAt reviewedAt isDeleted
          postContent postAuthorUsername postStatus postVisibility postIsDeleted
        }
        ${PAGE_INFO_FIELDS}
      }
    }`,
    variables: { input },
  });
  return result.adminPostReports;
}

export async function moderateAdminPostReport(input: {
  reportId: string;
  status: string;
  reason: string;
}): Promise<string> {
  const result = await graphqlRequest<{ adminModeratePostReport: string }>({
    query: `mutation AdminModeratePostReport($input: AdminModerateReportInput!) {
      adminModeratePostReport(input: $input)
    }`,
    variables: { input },
  });
  return result.adminModeratePostReport;
}

export async function fetchAdminTranscriptions(
  input: AdminListInput,
): Promise<AdminConnection<AdminTranscription>> {
  const result = await graphqlRequest<{
    adminTranscriptions: AdminConnection<AdminTranscription>;
  }>({
    query: `query AdminTranscriptions($input: AdminMediaInput) {
      adminTranscriptions(input: $input) {
        nodes {
          id provider trackId title artist status progress attempts createdAt isDeleted
        }
        ${PAGE_INFO_FIELDS}
      }
    }`,
    variables: { input },
  });
  return result.adminTranscriptions;
}

export async function fetchAdminUploads(
  input: AdminListInput,
): Promise<AdminConnection<AdminUpload>> {
  const result = await graphqlRequest<{
    adminUploads: AdminConnection<AdminUpload>;
  }>({
    query: `query AdminUploads($input: AdminMediaInput) {
      adminUploads(input: $input) {
        nodes { id userId username fileName fileType fileSize status sourceType cleanupPending createdAt updatedAt isDeleted }
        ${PAGE_INFO_FIELDS}
      }
    }`,
    variables: { input },
  });
  return result.adminUploads;
}

export async function fetchAdminChordTranscriptions(
  input: AdminListInput,
): Promise<AdminConnection<AdminChordTranscription>> {
  const result = await graphqlRequest<{
    adminChordTranscriptions: AdminConnection<AdminChordTranscription>;
  }>({
    query: `query AdminChordTranscriptions($input: AdminMediaInput) {
      adminChordTranscriptions(input: $input) {
        nodes { id provider providerTrackId title artist duration cueCount engineVersion createdAt updatedAt }
        ${PAGE_INFO_FIELDS}
      }
    }`,
    variables: { input },
  });
  return result.adminChordTranscriptions;
}

export async function fetchAdminPlaylists(
  input: AdminListInput,
): Promise<AdminConnection<AdminPlaylist>> {
  const result = await graphqlRequest<{
    adminPlaylists: AdminConnection<AdminPlaylist>;
  }>({
    query: `query AdminPlaylists($input: AdminMusicInput) {
      adminPlaylists(input: $input) {
        nodes {
          id userId username name description visibility itemCount createdAt isDeleted
        }
        ${PAGE_INFO_FIELDS}
      }
    }`,
    variables: { input },
  });
  return result.adminPlaylists;
}

export async function fetchAdminCatalogTracks(
  input: AdminListInput,
): Promise<AdminConnection<AdminCatalogTrack>> {
  const result = await graphqlRequest<{
    adminCatalogTracks: AdminConnection<AdminCatalogTrack>;
  }>({
    query: `query AdminCatalogTracks($input: AdminMusicInput) {
      adminCatalogTracks(input: $input) {
        nodes { id provider providerTrackId title artists album genre durationMs playlistCount createdAt }
        ${PAGE_INFO_FIELDS}
      }
    }`,
    variables: { input },
  });
  return result.adminCatalogTracks;
}

export async function fetchAdminListeningHistory(
  input: AdminListInput,
): Promise<AdminConnection<AdminListeningHistory>> {
  const result = await graphqlRequest<{
    adminListeningHistory: AdminConnection<AdminListeningHistory>;
  }>({
    query: `query AdminListeningHistory($input: AdminMusicInput) {
      adminListeningHistory(input: $input) {
        nodes { id userId username provider providerTrackId title artists playCount lastPlayedAt createdAt }
        ${PAGE_INFO_FIELDS}
      }
    }`,
    variables: { input },
  });
  return result.adminListeningHistory;
}

export async function fetchAdminAuditLogs(
  input: AdminListInput,
): Promise<AdminConnection<AdminAuditLog>> {
  const result = await graphqlRequest<{
    adminAuditLogs: AdminConnection<AdminAuditLog>;
  }>({
    query: `query AdminAuditLogs($input: AdminAuditInput) {
      adminAuditLogs(input: $input) {
        nodes {
          id actorId actorUsername action entityType entityId metadata createdAt
        }
        ${PAGE_INFO_FIELDS}
      }
    }`,
    variables: { input },
  });
  return result.adminAuditLogs;
}
