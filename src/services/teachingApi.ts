import { graphqlRequest } from "@/services/graphqlClient";
import { GRAPHQL_URL } from "@/services/backend";
import { getAccessToken } from "@/services/authToken";

export interface TeachingMaterial {
  id: string; courseId: string; lessonId: string | null; title: string;
  fileName: string; fileType: string; fileSize: string; createdAt: string;
}

export async function fetchTeachingCourseMaterials(courseId: string) {
  const result = await graphqlRequest<{ teachingCourseMaterials: TeachingMaterial[] }>({
    query: `query CourseMaterials($courseId: String!) { teachingCourseMaterials(courseId: $courseId) { id courseId lessonId title fileName fileType fileSize createdAt } }`,
    variables: { courseId },
  });
  return result.teachingCourseMaterials;
}

export async function fetchTeachingLessonMaterials(lessonId: string) {
  const result = await graphqlRequest<{ teachingLessonMaterials: TeachingMaterial[] }>({
    query: `query LessonMaterials($lessonId: String!) { teachingLessonMaterials(lessonId: $lessonId) { id courseId lessonId title fileName fileType fileSize createdAt } }`,
    variables: { lessonId },
  });
  return result.teachingLessonMaterials;
}

export async function fetchTeachingMaterialsForCourses(courseIds: string[]) {
  if (!courseIds.length) return [] as TeachingMaterial[];
  const result = await graphqlRequest<{ teachingMaterialsForCourses: TeachingMaterial[] }>({
    query: `query TeachingMaterials($courseIds: [String!]!) { teachingMaterialsForCourses(courseIds: $courseIds) { id courseId lessonId title fileName fileType fileSize createdAt } }`,
    variables: { courseIds },
  });
  return result.teachingMaterialsForCourses;
}

export async function uploadTeachingMaterial(courseId: string, file: File, title: string, lessonId?: string) {
  const token = getAccessToken();
  if (!token) throw new Error("Authentication required.");
  const url = GRAPHQL_URL.replace(/\/graphql\/?$/, "/uploads/teaching-materials");
  if (url === GRAPHQL_URL) throw new Error("Invalid backend upload URL.");
  const form = new FormData(); form.append("courseId", courseId); form.append("title", title || file.name);
  if (lessonId) form.append("lessonId", lessonId); form.append("file", file);
  const response = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: form });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { message?: string | string[] } | null;
    throw new Error(Array.isArray(payload?.message) ? payload.message.join(" ") : payload?.message || `Upload failed (${response.status}).`);
  }
  return await response.json() as TeachingMaterial;
}

export async function downloadTeachingMaterial(material: TeachingMaterial) {
  const token = getAccessToken();
  if (!token) throw new Error("Authentication required.");
  const url = GRAPHQL_URL.replace(/\/graphql\/?$/, `/uploads/teaching-materials/${encodeURIComponent(material.id)}/content`);
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Download failed (${response.status}).`);
  const blob = await response.blob(); const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a"); anchor.href = objectUrl;
  if (material.fileType.startsWith("video/")) anchor.target = "_blank";
  else anchor.download = material.fileName;
  document.body.append(anchor); anchor.click(); anchor.remove(); window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

export async function deleteTeachingMaterial(id: string) {
  const result = await graphqlRequest<{ deleteTeachingMaterial: boolean }>({
    query: `mutation DeleteTeachingMaterial($id: String!) { deleteTeachingMaterial(id: $id) }`, variables: { id },
  });
  return result.deleteTeachingMaterial;
}

export interface TeachingCourse {
  id: string;
  instructorId: string;
  title: string;
  description: string | null;
  level: string | null;
  format: "INDIVIDUAL" | "GROUP";
  maxStudents: number;
  teachingMode: "IN_PERSON" | "ONLINE" | "HYBRID";
  priceAmount: number;
  priceCurrency: string;
  priceUnit: "PER_COURSE" | "PER_LESSON";
  durationMinutes: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

export interface InstructorProfile {
  id: string;
  userId: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  headline: string | null;
  biography: string | null;
  experienceYears: number | null;
  specialties: string[];
  languages: string[];
}

export interface TeachingEnrollment {
  id: string;
  courseId: string;
  studentId: string;
  status:
    "REQUESTED" | "INVITED" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED";
  courseTitle?: string;
  instructorUsername?: string;
}

export interface TeachingLesson {
  id: string;
  courseId: string;
  createdById: string;
  courseTitle: string;
  startsAt: string;
  endsAt: string;
  timeZone: string;
  teachingMode: "IN_PERSON" | "ONLINE" | "HYBRID";
  location: string | null;
  meetingUrl: string | null;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  cancellationNote: string | null;
  attendances: Array<{
    id: string;
    enrollmentId: string;
    status: "EXPECTED" | "PRESENT" | "ABSENT" | "EXCUSED";
    note: string | null;
    studentUsername?: string;
  }>;
}

type CourseInput = Omit<TeachingCourse, "id" | "instructorId" | "status">;

const COURSE_FIELDS =
  "id instructorId title description level format maxStudents teachingMode priceAmount priceCurrency priceUnit durationMinutes status";
const INSTRUCTOR_FIELDS =
  "id userId status headline biography experienceYears specialties languages";

export async function fetchTeachingWorkspace() {
  return graphqlRequest<{
    myInstructorProfile: InstructorProfile | null;
    myTeachingCourses: TeachingCourse[];
    myEnrolledTeachingCourses: TeachingCourse[];
    publishedTeachingCourses: TeachingCourse[];
    myTeachingEnrollments: TeachingEnrollment[];
  }>({
    query: `query TeachingWorkspace { myInstructorProfile { ${INSTRUCTOR_FIELDS} } myTeachingCourses { ${COURSE_FIELDS} } myEnrolledTeachingCourses { ${COURSE_FIELDS} } publishedTeachingCourses(take: 50) { ${COURSE_FIELDS} } myTeachingEnrollments { id courseId studentId status courseTitle instructorUsername } }`,
  });
}

export async function respondToTeachingInvitation(
  enrollmentId: string,
  accept: boolean,
) {
  const result = await graphqlRequest<{
    respondToTeachingCourseInvitation: TeachingEnrollment;
  }>({
    query: `mutation RespondToTeachingInvitation($enrollmentId: String!, $accept: Boolean!) { respondToTeachingCourseInvitation(enrollmentId: $enrollmentId, accept: $accept) { id courseId studentId status } }`,
    variables: { enrollmentId, accept },
  });
  return result.respondToTeachingCourseInvitation;
}

export async function saveInstructorProfile(input: {
  headline?: string;
  biography?: string;
  experienceYears?: number;
  specialties?: string[];
  languages?: string[];
}) {
  const result = await graphqlRequest<{
    upsertInstructorProfile: InstructorProfile;
  }>({
    query: `mutation SaveInstructorProfile($data: UpsertInstructorProfileInput!) { upsertInstructorProfile(data: $data) { ${INSTRUCTOR_FIELDS} } }`,
    variables: { data: input },
  });
  return result.upsertInstructorProfile;
}

export async function createTeachingCourse(input: CourseInput) {
  const result = await graphqlRequest<{ createTeachingCourse: TeachingCourse }>(
    {
      query: `mutation CreateTeachingCourse($data: CreateTeachingCourseInput!) { createTeachingCourse(data: $data) { ${COURSE_FIELDS} } }`,
      variables: { data: input },
    },
  );
  return result.createTeachingCourse;
}

export async function updateTeachingCourse(
  id: string,
  data: Partial<CourseInput> & { status?: TeachingCourse["status"] },
) {
  const result = await graphqlRequest<{ updateTeachingCourse: TeachingCourse }>(
    {
      query: `mutation UpdateTeachingCourse($id: String!, $data: UpdateTeachingCourseInput!) { updateTeachingCourse(id: $id, data: $data) { ${COURSE_FIELDS} } }`,
      variables: { id, data },
    },
  );
  return result.updateTeachingCourse;
}

export async function archiveTeachingCourse(id: string) {
  const result = await graphqlRequest<{
    archiveTeachingCourse: TeachingCourse;
  }>({
    query: `mutation ArchiveTeachingCourse($id: String!) { archiveTeachingCourse(id: $id) { ${COURSE_FIELDS} } }`,
    variables: { id },
  });
  return result.archiveTeachingCourse;
}

export async function requestTeachingEnrollment(courseId: string) {
  const result = await graphqlRequest<{
    requestTeachingCourseEnrollment: { id: string };
  }>({
    query: `mutation RequestTeachingEnrollment($courseId: String!) { requestTeachingCourseEnrollment(courseId: $courseId) { id } }`,
    variables: { courseId },
  });
  return result.requestTeachingCourseEnrollment;
}

const LESSON_FIELDS = `id courseId createdById courseTitle startsAt endsAt timeZone teachingMode location meetingUrl status cancellationNote attendances { id enrollmentId status note studentUsername }`;

export async function fetchTeachingLessons(from: string, to: string) {
  const result = await graphqlRequest<{ myTeachingLessons: TeachingLesson[] }>({
    query: `query MyTeachingLessons($from: DateTime!, $to: DateTime!) { myTeachingLessons(from: $from, to: $to) { ${LESSON_FIELDS} } }`,
    variables: { from, to },
  });
  return result.myTeachingLessons;
}

export interface TeachingLessonInput {
  startsAt: string;
  timeZone: string;
  teachingMode: "IN_PERSON" | "ONLINE";
  location?: string | null;
  meetingUrl?: string | null;
}

export async function scheduleTeachingLesson(
  courseId: string,
  data: TeachingLessonInput,
) {
  const result = await graphqlRequest<{
    scheduleTeachingLesson: TeachingLesson;
  }>({
    query: `mutation ScheduleTeachingLesson($courseId: String!, $data: TeachingLessonInput!) { scheduleTeachingLesson(courseId: $courseId, data: $data) { ${LESSON_FIELDS} } }`,
    variables: { courseId, data },
  });
  return result.scheduleTeachingLesson;
}

export async function rescheduleTeachingLesson(
  id: string,
  data: TeachingLessonInput,
) {
  const result = await graphqlRequest<{
    rescheduleTeachingLesson: TeachingLesson;
  }>({
    query: `mutation RescheduleTeachingLesson($id: String!, $data: TeachingLessonInput!) { rescheduleTeachingLesson(id: $id, data: $data) { ${LESSON_FIELDS} } }`,
    variables: { id, data },
  });
  return result.rescheduleTeachingLesson;
}

export async function cancelTeachingLesson(
  id: string,
  note: string | null = null,
) {
  const result = await graphqlRequest<{ cancelTeachingLesson: TeachingLesson }>(
    {
      query: `mutation CancelTeachingLesson($id: String!, $note: String) { cancelTeachingLesson(id: $id, note: $note) { ${LESSON_FIELDS} } }`,
      variables: { id, note },
    },
  );
  return result.cancelTeachingLesson;
}

export async function completeTeachingLesson(id: string) {
  const result = await graphqlRequest<{
    completeTeachingLesson: TeachingLesson;
  }>({
    query: `mutation CompleteTeachingLesson($id: String!) { completeTeachingLesson(id: $id) { ${LESSON_FIELDS} } }`,
    variables: { id },
  });
  return result.completeTeachingLesson;
}

export async function markTeachingLessonAttendance(
  lessonId: string,
  enrollmentId: string,
  status: "PRESENT" | "ABSENT" | "EXCUSED",
) {
  const result = await graphqlRequest<{ markLessonAttendance: TeachingLesson }>(
    {
      query: `mutation MarkLessonAttendance($lessonId: String!, $enrollmentId: String!, $data: LessonAttendanceInput!) { markLessonAttendance(lessonId: $lessonId, enrollmentId: $enrollmentId, data: $data) { ${LESSON_FIELDS} } }`,
      variables: { lessonId, enrollmentId, data: { status } },
    },
  );
  return result.markLessonAttendance;
}
