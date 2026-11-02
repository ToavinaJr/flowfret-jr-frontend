import { act, renderHook, waitFor } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "@/i18n";
import {
  fetchTeachingLessons,
  fetchTeachingMaterialsForCourses,
  fetchTeachingWorkspace,
} from "@/services/teachingApi";
import { useTeachingWorkspaceData } from "./useTeachingWorkspaceData";

vi.mock("@/services/teachingApi", () => ({
  fetchTeachingLessons: vi.fn(),
  fetchTeachingMaterialsForCourses: vi.fn(),
  fetchTeachingWorkspace: vi.fn(),
}));

const course = (id: string, status: "DRAFT" | "PUBLISHED" = "PUBLISHED") => ({
  id,
  instructorId: "teacher",
  title: id,
  description: null,
  level: null,
  format: "GROUP" as const,
  maxStudents: 8,
  teachingMode: "ONLINE" as const,
  priceAmount: 1000,
  priceCurrency: "EUR",
  priceUnit: "PER_LESSON" as const,
  durationMinutes: 45,
  status,
});

describe("useTeachingWorkspaceData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(fetchTeachingWorkspace).mockResolvedValue({
      myInstructorProfile: null,
      myTeachingCourses: [course("teacher-course")],
      myEnrolledTeachingCourses: [course("student-course")],
      publishedTeachingCourses: [course("catalog-course")],
      myTeachingEnrollments: [
        {
          id: "enrollment",
          courseId: "student-course",
          studentId: "me",
          status: "ACTIVE",
        },
      ],
    });
    vi.mocked(fetchTeachingLessons).mockResolvedValue([]);
    vi.mocked(fetchTeachingMaterialsForCourses).mockResolvedValue([
      {
        id: "material-1",
        courseId: "teacher-course",
        lessonId: null,
        title: "Teacher handout",
        fileName: "teacher.pdf",
        fileType: "application/pdf",
        fileSize: "12",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "material-2",
        courseId: "student-course",
        lessonId: null,
        title: "Student handout",
        fileName: "student.pdf",
        fileType: "application/pdf",
        fileSize: "12",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ]);
  });

  it("loads the workspace, selects its first published course and groups materials", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <I18nextProvider i18n={i18n.cloneInstance({ lng: "fr" })}>
        {children}
      </I18nextProvider>
    );
    const { result } = renderHook(() => useTeachingWorkspaceData(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.myCourses).toHaveLength(1);
    expect(result.current.enrolled).toHaveLength(1);
    expect(result.current.catalog).toHaveLength(1);
    expect(result.current.lessonCourseId).toBe("teacher-course");
    expect(result.current.materials).toEqual({
      "teacher-course": [expect.objectContaining({ id: "material-1" })],
      "student-course": [expect.objectContaining({ id: "material-2" })],
    });
    expect(fetchTeachingMaterialsForCourses).toHaveBeenCalledWith([
      "teacher-course",
      "student-course",
    ]);

    await act(async () => result.current.refresh());
    expect(fetchTeachingWorkspace).toHaveBeenCalledTimes(2);
  });
});
