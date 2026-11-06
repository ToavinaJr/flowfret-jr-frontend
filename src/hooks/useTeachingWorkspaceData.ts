import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import {
  fetchTeachingLessons,
  fetchTeachingMaterialsForCourses,
  fetchTeachingWorkspace,
  type InstructorProfile,
  type TeachingCourse,
  type TeachingLesson,
  type TeachingMaterial,
} from "@/services/teachingApi";

type WorkspaceData = Awaited<ReturnType<typeof fetchTeachingWorkspace>>;

export function useTeachingWorkspaceData() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [myCourses, setMyCourses] = useState<TeachingCourse[]>([]);
  const [enrolled, setEnrolled] = useState<TeachingCourse[]>([]);
  const [enrollments, setEnrollments] = useState<
    WorkspaceData["myTeachingEnrollments"]
  >([]);
  const [teacherEnrollments, setTeacherEnrollments] = useState<
    WorkspaceData["myTeachingCourseEnrollments"]
  >([]);
  const [catalog, setCatalog] = useState<TeachingCourse[]>([]);
  const [lessons, setLessons] = useState<TeachingLesson[]>([]);
  const [materials, setMaterials] = useState<
    Record<string, TeachingMaterial[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [lessonCourseId, setLessonCourseId] = useState("");

  const refresh = useCallback(async () => {
    const from = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const to = new Date(from.getTime() + 45 * 24 * 60 * 60 * 1000);
    const [data, calendar] = await Promise.all([
      fetchTeachingWorkspace(),
      fetchTeachingLessons(from.toISOString(), to.toISOString()),
    ]);
    const activeStudentCourses = data.myEnrolledTeachingCourses.filter(
      (course) =>
        data.myTeachingEnrollments.some(
          (enrollment) =>
            enrollment.courseId === course.id && enrollment.status === "ACTIVE",
        ),
    );
    const coursesForMaterials = [
      ...new Map(
        [...data.myTeachingCourses, ...activeStudentCourses].map((course) => [
          course.id,
          course,
        ]),
      ).values(),
    ];
    const courseMaterials = await fetchTeachingMaterialsForCourses(
      coursesForMaterials.map((course) => course.id),
    );
    const materialMap: Record<string, TeachingMaterial[]> = {};
    for (const course of coursesForMaterials)
      materialMap[course.id] = courseMaterials.filter(
        (material) => material.courseId === course.id,
      );

    setProfile(data.myInstructorProfile);
    setMyCourses(data.myTeachingCourses);
    setEnrolled(data.myEnrolledTeachingCourses);
    setEnrollments(data.myTeachingEnrollments);
    setTeacherEnrollments(data.myTeachingCourseEnrollments);
    setCatalog(data.publishedTeachingCourses);
    setLessons(calendar);
    setMaterials(materialMap);
    const firstPublished = data.myTeachingCourses.find(
      (course) => course.status === "PUBLISHED",
    );
    if (firstPublished)
      setLessonCourseId((current) => current || firstPublished.id);
  }, []);

  useEffect(() => {
    void refresh()
      .catch((error: unknown) =>
        toast.error(
          error instanceof Error
            ? error.message
            : t("teaching.feedback.loadFailed"),
        ),
      )
      .finally(() => setLoading(false));
  }, [refresh, t]);

  return {
    profile,
    setProfile,
    myCourses,
    enrolled,
    enrollments,
    teacherEnrollments,
    catalog,
    lessons,
    materials,
    loading,
    lessonCourseId,
    setLessonCourseId,
    refresh,
  };
}
