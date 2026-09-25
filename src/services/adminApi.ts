import { graphqlRequest } from "@/services/graphqlClient";
import type {
  AdminAuditLog,
  AdminBackendStatus,
  AdminConnection,
  AdminDashboardStatistics,
  AdminListInput,
  AdminPlaylist,
  AdminPost,
  AdminTranscription,
  AdminUser,
} from "@/types/admin";

const PAGE_INFO_FIELDS = "pageInfo { hasNextPage hasPreviousPage endCursor } totalCount";

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
