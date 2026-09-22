import { graphqlRequest } from "@/services/graphqlClient";

export type ReportStatus = "OPEN" | "REVIEWED" | "DISMISSED" | "RESOLVED";

export interface ModerationReport {
  id: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
  reviewedAt: string | null;
  reporter: { id: string; username: string };
  post: {
    id: string;
    content: string | null;
    author: { id: string; username: string };
  };
}

export async function fetchModerationReports(): Promise<ModerationReport[]> {
  const result = await graphqlRequest<{ postReports: ModerationReport[] }>({
    query: `query ModerationReports { postReports(take: 100) { id reason status createdAt reviewedAt reporter { id username } post { id content author { id username } } } }`,
  });
  return result.postReports;
}

export async function setReportStatus(
  id: string,
  status: Exclude<ReportStatus, "OPEN">,
): Promise<void> {
  await graphqlRequest({
    query: `mutation ModerateReport($id: String!, $data: UpdatePostReportInput!) { updatePostReport(id: $id, data: $data) { id status reviewedAt } }`,
    variables: { id, data: { status } },
  });
}
