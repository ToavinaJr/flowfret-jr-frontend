import { graphqlRequest } from "@/services/graphqlClient";
import type {
  AdminBackendStatus,
  AdminDashboardStatistics,
} from "@/types/admin";

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
