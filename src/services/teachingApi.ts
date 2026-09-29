import { graphqlRequest } from "@/services/graphqlClient";

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

type CourseInput = Omit<TeachingCourse, "id" | "instructorId" | "status">;

const COURSE_FIELDS = "id instructorId title description level format maxStudents teachingMode priceAmount priceCurrency priceUnit durationMinutes status";
const INSTRUCTOR_FIELDS = "id userId status headline biography experienceYears specialties languages";

export async function fetchTeachingWorkspace() {
  return graphqlRequest<{
    myInstructorProfile: InstructorProfile | null;
    myTeachingCourses: TeachingCourse[];
    myEnrolledTeachingCourses: TeachingCourse[];
    publishedTeachingCourses: TeachingCourse[];
  }>({
    query: `query TeachingWorkspace { myInstructorProfile { ${INSTRUCTOR_FIELDS} } myTeachingCourses { ${COURSE_FIELDS} } myEnrolledTeachingCourses { ${COURSE_FIELDS} } publishedTeachingCourses(take: 50) { ${COURSE_FIELDS} } }`,
  });
}

export async function saveInstructorProfile(input: {
  headline?: string;
  biography?: string;
  experienceYears?: number;
  specialties?: string[];
  languages?: string[];
}) {
  const result = await graphqlRequest<{ upsertInstructorProfile: InstructorProfile }>({
    query: `mutation SaveInstructorProfile($data: UpsertInstructorProfileInput!) { upsertInstructorProfile(data: $data) { ${INSTRUCTOR_FIELDS} } }`,
    variables: { data: input },
  });
  return result.upsertInstructorProfile;
}

export async function createTeachingCourse(input: CourseInput) {
  const result = await graphqlRequest<{ createTeachingCourse: TeachingCourse }>({
    query: `mutation CreateTeachingCourse($data: CreateTeachingCourseInput!) { createTeachingCourse(data: $data) { ${COURSE_FIELDS} } }`,
    variables: { data: input },
  });
  return result.createTeachingCourse;
}

export async function updateTeachingCourse(id: string, data: Partial<CourseInput> & { status?: TeachingCourse["status"] }) {
  const result = await graphqlRequest<{ updateTeachingCourse: TeachingCourse }>({
    query: `mutation UpdateTeachingCourse($id: String!, $data: UpdateTeachingCourseInput!) { updateTeachingCourse(id: $id, data: $data) { ${COURSE_FIELDS} } }`,
    variables: { id, data },
  });
  return result.updateTeachingCourse;
}

export async function archiveTeachingCourse(id: string) {
  const result = await graphqlRequest<{ archiveTeachingCourse: TeachingCourse }>({
    query: `mutation ArchiveTeachingCourse($id: String!) { archiveTeachingCourse(id: $id) { ${COURSE_FIELDS} } }`,
    variables: { id },
  });
  return result.archiveTeachingCourse;
}

export async function requestTeachingEnrollment(courseId: string) {
  const result = await graphqlRequest<{ requestTeachingCourseEnrollment: { id: string } }>({
    query: `mutation RequestTeachingEnrollment($courseId: String!) { requestTeachingCourseEnrollment(courseId: $courseId) { id } }`,
    variables: { courseId },
  });
  return result.requestTeachingCourseEnrollment;
}
