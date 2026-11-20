import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { useTeachingWorkspaceData } from '@/hooks/useTeachingWorkspaceData';
import { TEACHING_VIEWS } from './teachingPage.constants';
import { currentTimeZone, lessonInput, toLocalInputValue } from './teachingPage.utils';
import {
  archiveTeachingCourse,
  deleteTeachingMaterial,
  downloadTeachingMaterial,
  cancelTeachingLesson,
  completeTeachingLesson,
  createTeachingCourse,
  inviteStudentToTeachingCourse,
  markTeachingLessonAttendance,
  requestTeachingEnrollment,
  rescheduleTeachingLesson,
  scheduleTeachingLesson,
  scheduleTeachingLessonSeries,
  respondToTeachingInvitation,
  saveInstructorProfile,
  updateTeachingCourse,
  updateTeachingEnrollment,
  uploadTeachingMaterial,
  type TeachingCourse,
  type TeachingEnrollment,
  type TeachingLesson,
  type TeachingMaterial,
} from '@/services/teachingApi';

export function useTeachingPageController() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedView = searchParams.get("view");
  const view = TEACHING_VIEWS.some((tab) => tab.value === requestedView)
    ? requestedView!
    : "courses";
  const {
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
  } = useTeachingWorkspaceData();
  const [busy, setBusy] = useState(false);
  const [headline, setHeadline] = useState("");
  const [biography, setBiography] = useState("");
  const [experienceYears, setExperienceYears] = useState("0");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("EUR");
  const [duration, setDuration] = useState("45");
  const [courseFormat, setCourseFormat] = useState<"INDIVIDUAL" | "GROUP">(
    "INDIVIDUAL",
  );
  const [courseCapacity, setCourseCapacity] = useState("6");
  const [priceUnit, setPriceUnit] = useState<"PER_LESSON" | "PER_COURSE">(
    "PER_LESSON",
  );
  const [repeatWeekly, setRepeatWeekly] = useState(false);
  const [repeatOccurrences, setRepeatOccurrences] = useState("4");
  const [lessonStartsAt, setLessonStartsAt] = useState(() =>
    toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)),
  );
  const [lessonMode, setLessonMode] = useState<"IN_PERSON" | "ONLINE">(
    "IN_PERSON",
  );
  const [lessonLocation, setLessonLocation] = useState("");
  const [lessonMeetingUrl, setLessonMeetingUrl] = useState("");

  useEffect(() => {
    setHeadline(profile?.headline ?? "");
    setBiography(profile?.biography ?? "");
    setExperienceYears(String(profile?.experienceYears ?? 0));
  }, [profile]);

  async function saveTeacher(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      setProfile(
        await saveInstructorProfile({
          headline,
          biography,
          experienceYears: Number(experienceYears),
        }),
      );
      toast.success(
        t("teaching.feedback.profileSaved"),
      );
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("teaching.feedback.saveFailed"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function addCourse(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    try {
      await createTeachingCourse({
        title,
        description,
        level: t("teaching.fields.allLevels"),
        format: courseFormat,
        maxStudents: courseFormat === "INDIVIDUAL" ? 1 : Number(courseCapacity),
        teachingMode: "HYBRID",
        priceAmount: Math.round(Number(price) * 100),
        priceCurrency: currency.toUpperCase(),
        priceUnit,
        durationMinutes: Number(duration),
      });
      setTitle("");
      setDescription("");
      setPrice("");
      await refresh();
      toast.success(t("teaching.feedback.courseDraftCreated"));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("teaching.feedback.courseCreateFailed"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function setPublished(course: TeachingCourse) {
    setBusy(true);
    try {
      await updateTeachingCourse(course.id, {
        status: course.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED",
      });
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("teaching.feedback.updateFailed"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function archive(course: TeachingCourse) {
    setBusy(true);
    try {
      await archiveTeachingCourse(course.id);
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("teaching.feedback.archiveFailed"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function enroll(course: TeachingCourse) {
    setBusy(true);
    try {
      await requestTeachingEnrollment(course.id);
      await refresh();
      toast.success(t("teaching.feedback.enrollmentRequested"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("teaching.feedback.requestFailed"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function answerInvitation(enrollmentId: string, accept: boolean) {
    setBusy(true);
    try {
      await respondToTeachingInvitation(enrollmentId, accept);
      await refresh();
      toast.success(
        accept
          ? t("teaching.feedback.invitationAccepted")
          : t("teaching.feedback.invitationDeclined"),
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("teaching.feedback.invitationFailed"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function changeEnrollmentStatus(
    enrollment: TeachingEnrollment,
    status: TeachingEnrollment["status"],
  ) {
    setBusy(true);
    try {
      await updateTeachingEnrollment(enrollment.id, status);
      await refresh();
      toast.success(t("teaching.feedback.enrollmentUpdated"));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("teaching.feedback.enrollmentUpdateFailed"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function inviteStudent(courseId: string, studentId: string) {
    setBusy(true);
    try {
      await inviteStudentToTeachingCourse(courseId, studentId);
      await refresh();
      toast.success(t("teaching.feedback.studentInvited"));
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("teaching.feedback.invitationFailed"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function addLesson(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const course = myCourses.find((row) => row.id === lessonCourseId);
    if (!course) return;
    setBusy(true);
    try {
      const input = lessonInput(
        lessonStartsAt,
        lessonMode,
        lessonLocation,
        lessonMeetingUrl,
      );
      if (repeatWeekly) {
        await scheduleTeachingLessonSeries(
          course.id,
          input,
          Number(repeatOccurrences),
        );
      } else {
        await scheduleTeachingLesson(course.id, input);
      }
      await refresh();
      toast.success(
        repeatWeekly
          ? t("teaching.feedback.lessonSeriesScheduled")
          : t("teaching.feedback.lessonScheduled"),
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("teaching.feedback.scheduleFailed"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function moveLesson(lesson: TeachingLesson, startsAt: string) {
    setBusy(true);
    try {
      await rescheduleTeachingLesson(lesson.id, {
        startsAt: new Date(startsAt).toISOString(),
        timeZone: currentTimeZone(),
        teachingMode: lesson.teachingMode === "ONLINE" ? "ONLINE" : "IN_PERSON",
        location: lesson.location,
        meetingUrl: lesson.meetingUrl,
      });
      await refresh();
      toast.success(t("teaching.feedback.lessonRescheduled"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("teaching.feedback.rescheduleFailed"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function cancelLesson(lesson: TeachingLesson) {
    setBusy(true);
    try {
      await cancelTeachingLesson(lesson.id);
      await refresh();
      toast.success(t("teaching.feedback.lessonCanceled"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("teaching.feedback.cancelFailed"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function completeLesson(lesson: TeachingLesson) {
    setBusy(true);
    try {
      await completeTeachingLesson(lesson.id);
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("teaching.feedback.completeFailed"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function setAttendance(
    lesson: TeachingLesson,
    enrollmentId: string,
    status: "PRESENT" | "ABSENT" | "EXCUSED",
  ) {
    setBusy(true);
    try {
      await markTeachingLessonAttendance(lesson.id, enrollmentId, status);
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t("teaching.feedback.attendanceFailed"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function addMaterial(
    courseId: string,
    event: React.FormEvent<HTMLFormElement>,
    lessonId?: string,
  ) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const file = form.get("file");
    if (!(file instanceof File) || !file.size) return;
    setBusy(true);
    try {
      await uploadTeachingMaterial(
        courseId,
        file,
        String(form.get("title") || file.name),
        lessonId,
      );
      toast.success(t("teaching.feedback.materialAdded"));
      await refresh();
      formElement.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("teaching.feedback.uploadFailed"));
    } finally {
      setBusy(false);
    }
  }

  async function removeMaterial(material: TeachingMaterial) {
    setBusy(true);
    try {
      await deleteTeachingMaterial(material.id);
      toast.success(t("teaching.feedback.materialDeleted"));
      await refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("teaching.feedback.deleteFailed"),
      );
    } finally {
      setBusy(false);
    }
  }

  async function getMaterial(material: TeachingMaterial) {
    try {
      await downloadTeachingMaterial(material);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t("teaching.feedback.downloadFailed"),
      );
    }
  }

  const myEnrollmentIds = new Set(enrolled.map((course) => course.id));
  const activeEnrolled = enrolled.filter((course) =>
    enrollments.some(
      (enrollment) =>
        enrollment.courseId === course.id && enrollment.status === "ACTIVE",
    ),
  );
  const selectedLessonCourse = () =>
    myCourses.find((course) => course.id === lessonCourseId);
  const visibleCatalog = catalog.filter(
    (course) => course.instructorId !== profile?.id,
  );
  const courseLevelMaterials = (courseId: string) =>
    (materials[courseId] ?? []).filter(
      (material) => material.lessonId === null,
    );
  const statusLabel = (status: string) =>
    t(`teaching.status.${status.toLowerCase()}`, { defaultValue: status });
  return {
    t, locale, user, view, profile, setProfile, myCourses, enrolled, enrollments,
    teacherEnrollments, catalog, lessons, materials, loading, lessonCourseId,
    setLessonCourseId, refresh, busy, headline, setHeadline, biography,
    setBiography, experienceYears, setExperienceYears, title, setTitle,
    description, setDescription, price, setPrice, currency, setCurrency,
    duration, setDuration, courseFormat, setCourseFormat, courseCapacity,
    setCourseCapacity, priceUnit, setPriceUnit, repeatWeekly, setRepeatWeekly,
    repeatOccurrences, setRepeatOccurrences, lessonStartsAt, setLessonStartsAt,
    lessonMode, setLessonMode, lessonLocation, setLessonLocation,
    lessonMeetingUrl, setLessonMeetingUrl, saveTeacher, addCourse, setPublished,
    archive, enroll, answerInvitation, changeEnrollmentStatus, inviteStudent,
    addLesson, moveLesson, cancelLesson, completeLesson, setAttendance,
    addMaterial, removeMaterial, getMaterial, myEnrollmentIds, activeEnrolled,
    selectedLessonCourse, visibleCatalog, courseLevelMaterials, statusLabel,
  };
}

export type TeachingPageController = ReturnType<
  typeof useTeachingPageController
>;
