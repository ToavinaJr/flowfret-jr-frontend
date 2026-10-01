import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BookOpen, Download, GraduationCap, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PAGE_SHELL, PAGE_TITLE } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { TeachingWorkspaceSkeleton } from "@/components/skeletons/AppSkeletons";
import { AdminResourceTabs } from "@/admin/AdminResourceTabs";

const TEACHING_VIEWS = [
  { value: "courses", labelKey: "teaching.views.courses" },
  { value: "calendar", labelKey: "teaching.views.calendar" },
  { value: "enrollments", labelKey: "teaching.views.enrollments" },
  { value: "materials", labelKey: "teaching.views.materials" },
  { value: "catalog", labelKey: "teaching.views.catalog" },
];
import {
  archiveTeachingCourse,
  deleteTeachingMaterial,
  downloadTeachingMaterial,
  cancelTeachingLesson,
  completeTeachingLesson,
  createTeachingCourse,
  fetchTeachingLessons,
  fetchTeachingMaterialsForCourses,
  fetchTeachingWorkspace,
  markTeachingLessonAttendance,
  requestTeachingEnrollment,
  rescheduleTeachingLesson,
  scheduleTeachingLesson,
  scheduleTeachingLessonSeries,
  respondToTeachingInvitation,
  saveInstructorProfile,
  updateTeachingCourse,
  uploadTeachingMaterial,
  type InstructorProfile,
  type TeachingCourse,
  type TeachingLesson,
  type TeachingLessonInput,
  type TeachingMaterial,
} from "@/services/teachingApi";

const cardClass = "rounded-xl border border-border bg-card p-4 sm:p-5";

export default function TeachingPage() {
  const { t, i18n } = useTranslation();
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedView = searchParams.get("view");
  const view = TEACHING_VIEWS.some((tab) => tab.value === requestedView)
    ? requestedView!
    : "courses";
  const [profile, setProfile] = useState<InstructorProfile | null>(null);
  const [myCourses, setMyCourses] = useState<TeachingCourse[]>([]);
  const [enrolled, setEnrolled] = useState<TeachingCourse[]>([]);
  const [enrollments, setEnrollments] = useState<
    Awaited<ReturnType<typeof fetchTeachingWorkspace>>["myTeachingEnrollments"]
  >([]);
  const [catalog, setCatalog] = useState<TeachingCourse[]>([]);
  const [lessons, setLessons] = useState<TeachingLesson[]>([]);
  const [materials, setMaterials] = useState<
    Record<string, TeachingMaterial[]>
  >({});
  const [loading, setLoading] = useState(true);
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
  const [lessonCourseId, setLessonCourseId] = useState("");
  const [lessonStartsAt, setLessonStartsAt] = useState(() =>
    toLocalInputValue(new Date(Date.now() + 60 * 60 * 1000)),
  );
  const [lessonMode, setLessonMode] = useState<"IN_PERSON" | "ONLINE">(
    "IN_PERSON",
  );
  const [lessonLocation, setLessonLocation] = useState("");
  const [lessonMeetingUrl, setLessonMeetingUrl] = useState("");

  const refresh = useCallback(async () => {
    const data = await fetchTeachingWorkspace();
    const from = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const to = new Date(from.getTime() + 45 * 24 * 60 * 60 * 1000);
    const calendar = await fetchTeachingLessons(
      from.toISOString(),
      to.toISOString(),
    );
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
    setCatalog(data.publishedTeachingCourses);
    setLessons(calendar);
    setMaterials(materialMap);
    if (!lessonCourseId) {
      const firstPublished = data.myTeachingCourses.find(
        (course) => course.status === "PUBLISHED",
      );
      if (firstPublished) setLessonCourseId(firstPublished.id);
    }
    setHeadline(data.myInstructorProfile?.headline ?? "");
    setBiography(data.myInstructorProfile?.biography ?? "");
    setExperienceYears(String(data.myInstructorProfile?.experienceYears ?? 0));
  }, [lessonCourseId]);

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

  return (
    <div className={PAGE_SHELL}>
      <h1 className={PAGE_TITLE}>{t("teaching.pageTitle")}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {t("teaching.pageDescription")}
      </p>
      <div className="mb-6">
        <AdminResourceTabs
          basePath="/teaching"
          active={view}
          tabs={TEACHING_VIEWS}
          navigationLabelKey="teaching.viewNavigation"
        />
      </div>
      {loading ? (
        <TeachingWorkspaceSkeleton />
      ) : (
        <div className="space-y-8">
          <section hidden={view !== "courses"} className={cardClass}>
            <div className="mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">{t("teaching.fields.instructorProfile")}</h2>
            </div>
            {profile && (
              <p className="mb-3 text-sm text-muted-foreground">
                {t("teaching.fields.statusLabel")}{" "}
                <strong>
                  {statusLabel(profile.status)}
                </strong>
              </p>
            )}
            <form className="grid gap-3 sm:grid-cols-2" onSubmit={saveTeacher}>
              <Input
                value={headline}
                onChange={(event) => setHeadline(event.target.value)}
                maxLength={160}
                placeholder={t("teaching.fields.shortIntroduction")}
                aria-label={t("teaching.fields.shortIntroduction")}
              />
              <Input
                type="number"
                min="0"
                max="60"
                value={experienceYears}
                onChange={(event) => setExperienceYears(event.target.value)}
                aria-label={t("teaching.fields.experienceYears")}
                placeholder={t("teaching.fields.experienceYears")}
              />
              <textarea
                className="min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm sm:col-span-2"
                value={biography}
                onChange={(event) => setBiography(event.target.value)}
                maxLength={3000}
                placeholder={t("teaching.fields.instructorBiographyPlaceholder")}
                aria-label={t("teaching.fields.instructorBiography")}
              />
              <Button disabled={busy} className="sm:col-span-2">
                {t("teaching.actions.saveProfile")}
              </Button>
            </form>
          </section>

          <section hidden={view !== "courses"} className={cardClass}>
            <div className="mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">
                {t("teaching.fields.createPaidCourse")}
              </h2>
            </div>
            <form className="grid gap-3 sm:grid-cols-2" onSubmit={addCourse}>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={courseFormat}
                onChange={(event) =>
                  setCourseFormat(event.target.value as "INDIVIDUAL" | "GROUP")
                }
                aria-label={t("teaching.fields.courseFormat")}
              >
                <option value="INDIVIDUAL">{t("teaching.fields.individualCourse")}</option>
                <option value="GROUP">{t("teaching.fields.groupCourse")}</option>
              </select>
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                value={priceUnit}
                onChange={(event) =>
                  setPriceUnit(
                    event.target.value as "PER_LESSON" | "PER_COURSE",
                  )
                }
                aria-label={t("teaching.fields.pricingMode")}
              >
                <option value="PER_LESSON">{t("teaching.fields.pricePerLesson")}</option>
                <option value="PER_COURSE">{t("teaching.fields.fullCoursePrice")}</option>
              </select>
              {courseFormat === "GROUP" && (
                <Input
                  required
                  type="number"
                  min="2"
                  max="100"
                  value={courseCapacity}
                  onChange={(event) => setCourseCapacity(event.target.value)}
                  placeholder={t("teaching.fields.maximumStudents")}
                  aria-label={t("teaching.fields.maximumStudents")}
                />
              )}
              <Input
                required
                minLength={3}
                maxLength={160}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={t("teaching.fields.courseTitle")}
                aria-label={t("teaching.fields.courseTitle")}
              />
              <Input
                required
                type="number"
                min="0.01"
                step="0.01"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                placeholder={
                  priceUnit === "PER_COURSE"
                    ? t("teaching.fields.fullCoursePrice")
                    : t("teaching.fields.pricePerLesson")
                }
                aria-label={
                  priceUnit === "PER_COURSE"
                    ? t("teaching.fields.fullCoursePrice")
                    : t("teaching.fields.pricePerLesson")
                }
              />
              <Input
                required
                minLength={3}
                maxLength={3}
                value={currency}
                onChange={(event) => setCurrency(event.target.value)}
                placeholder={t("teaching.fields.currencyPlaceholder")}
                aria-label={t("teaching.fields.currency")}
              />
              <Input
                required
                type="number"
                min="15"
                max="480"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                placeholder={t("teaching.fields.durationMinutes")}
                aria-label={t("teaching.fields.durationMinutes")}
              />
              <textarea
                className="min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm sm:col-span-2"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                maxLength={5000}
                placeholder={t("teaching.fields.courseDescription")}
                aria-label={t("teaching.fields.courseDescription")}
              />
              <Button disabled={busy || !profile} className="sm:col-span-2">
                {profile
                  ? t("teaching.actions.createDraft")
                  : t("teaching.feedback.createCourseNeedsProfile")}
              </Button>
            </form>
          </section>

          <section hidden={view !== "calendar"}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-semibold">
                {t("teaching.fields.calendarTitle")}
              </h2>
              <span className="text-xs text-muted-foreground">
                {currentTimeZone()}
              </span>
            </div>
            {profile?.status === "APPROVED" &&
              myCourses.some((course) => course.status === "PUBLISHED") && (
                <form
                  onSubmit={addLesson}
                  className={`${cardClass} mb-4 grid gap-3 sm:grid-cols-2`}
                >
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    required
                    value={lessonCourseId}
                    onChange={(event) => {
                      setLessonCourseId(event.target.value);
                      const next = myCourses.find(
                        (course) => course.id === event.target.value,
                      );
                      if (next?.teachingMode === "ONLINE")
                        setLessonMode("ONLINE");
                      if (next?.teachingMode === "IN_PERSON")
                        setLessonMode("IN_PERSON");
                    }}
                    aria-label={t("teaching.fields.courseToSchedule")}
                  >
                    {myCourses
                      .filter((course) => course.status === "PUBLISHED")
                      .map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                  </select>
                  <Input
                    required
                    type="datetime-local"
                    value={lessonStartsAt}
                    onChange={(event) => setLessonStartsAt(event.target.value)}
                    aria-label={t("teaching.fields.lessonDateTime")}
                  />
                  <select
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    value={lessonMode}
                    onChange={(event) =>
                      setLessonMode(
                        event.target.value as "IN_PERSON" | "ONLINE",
                      )
                    }
                    aria-label={t("teaching.fields.lessonMode")}
                  >
                    {selectedLessonCourse()?.teachingMode !== "ONLINE" && (
                      <option value="IN_PERSON">{t("teaching.fields.inPerson")}</option>
                    )}
                    {selectedLessonCourse()?.teachingMode !== "IN_PERSON" && (
                      <option value="ONLINE">{t("teaching.fields.online")}</option>
                    )}
                  </select>
                  {lessonMode === "IN_PERSON" ? (
                    <Input
                      required
                      value={lessonLocation}
                      onChange={(event) =>
                        setLessonLocation(event.target.value)
                      }
                      maxLength={500}
                      placeholder={t("teaching.fields.location")}
                      aria-label={t("teaching.fields.location")}
                    />
                  ) : (
                    <Input
                      required
                      type="url"
                      value={lessonMeetingUrl}
                      onChange={(event) =>
                        setLessonMeetingUrl(event.target.value)
                      }
                      placeholder={t("teaching.fields.meetingUrlPlaceholder")}
                      aria-label={t("teaching.fields.meetingUrl")}
                    />
                  )}
                  <label className="flex items-center gap-2 text-sm sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={repeatWeekly}
                      onChange={(event) =>
                        setRepeatWeekly(event.target.checked)
                      }
                    />
                    {t("teaching.fields.repeatWeekly")}
                  </label>
                  {repeatWeekly && (
                    <label className="flex items-center gap-2 text-sm">
                      {t("teaching.fields.numberOfLessons")}
                      <Input
                        required
                        type="number"
                        min="2"
                        max="24"
                        value={repeatOccurrences}
                        onChange={(event) =>
                          setRepeatOccurrences(event.target.value)
                        }
                        aria-label={t("teaching.fields.weeklyLessonCount")}
                      />
                    </label>
                  )}
                  <p className="text-xs text-muted-foreground sm:col-span-2">
                    {t("teaching.fields.lessonDurationTimezone")}
                  </p>
                  <Button disabled={busy} className="sm:col-span-2">
                    {t("teaching.actions.scheduleLesson")}
                  </Button>
                </form>
              )}
            {lessons.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("teaching.empty.noRecentLessons")}
              </p>
            ) : (
              <div className="space-y-3">
                {lessons.map((lesson) => {
                  const isTeacher = lesson.createdById === user?.id;
                  const lessonMaterials = (
                    materials[lesson.courseId] ?? []
                  ).filter(
                    (material) =>
                      material.lessonId === lesson.id ||
                      material.lessonId === null,
                  );
                  return (
                    <article key={lesson.id} className={cardClass}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-medium">{lesson.courseTitle}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatLessonDate(lesson.startsAt, lesson.timeZone, locale)}{" "}
                            ·{" "}
                            {lesson.teachingMode === "ONLINE"
                              ? t("teaching.fields.online")
                              : t("teaching.fields.inPerson")}{" "}
                            · {statusLabel(lesson.status)}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {lesson.location ||
                              (lesson.meetingUrl ? (
                                <a
                                  href={lesson.meetingUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary underline"
                                >
                                  {t("teaching.actions.joinMeeting")}
                                </a>
                              ) : (
                                ""
                              ))}
                          </p>
                        </div>
                        {isTeacher && lesson.status === "SCHEDULED" && (
                          <div className="flex flex-wrap gap-2">
                            <form
                              className="flex gap-2"
                              onSubmit={(event) => {
                                event.preventDefault();
                                const value = new FormData(
                                  event.currentTarget,
                                ).get("newStart");
                                if (typeof value === "string" && value)
                                  void moveLesson(lesson, value);
                              }}
                            >
                              <Input
                                name="newStart"
                                type="datetime-local"
                                required
                                defaultValue={toLocalInputValue(
                                  new Date(lesson.startsAt),
                                )}
                                aria-label={t("teaching.fields.newSchedule")}
                                className="w-auto"
                              />
                              <Button variant="outline" disabled={busy}>
                                {t("teaching.actions.reschedule")}
                              </Button>
                            </form>
                            <Button
                              variant="ghost"
                              disabled={busy}
                              onClick={() => void cancelLesson(lesson)}
                            >
                              {t("teaching.actions.cancelLesson")}
                            </Button>
                            {new Date(lesson.endsAt).getTime() <=
                              Date.now() && (
                              <Button
                                disabled={busy}
                                onClick={() => void completeLesson(lesson)}
                              >
                                {t("teaching.actions.completeLesson")}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="mt-4 border-t border-border pt-3">
                        <p className="mb-2 text-sm font-medium">
                          {t("teaching.fields.lessonMaterials")}
                        </p>
                        {lessonMaterials.length === 0 ? (
                          <p className="text-xs text-muted-foreground">
                            {t("teaching.empty.noLessonMaterials")}
                          </p>
                        ) : (
                          <ul className="space-y-2">
                            {lessonMaterials.map((material) => (
                              <li
                                key={material.id}
                                className="flex flex-wrap items-center justify-between gap-2 text-sm"
                              >
                                <span>
                                  {material.title} ·{" "}
                                  {formatFileSize(material.fileSize, t("teaching.feedback.unknownFileSize"), t("teaching.fields.mebibytes"), locale)}
                                </span>
                                <span className="flex gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => void getMaterial(material)}
                                  >
                                    <Download className="mr-1 h-4 w-4" />
                                    {t("teaching.actions.download")}
                                  </Button>
                                  {isTeacher && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      disabled={busy}
                                      aria-label={t("teaching.actions.deleteMaterial", { title: material.title })}
                                      onClick={() =>
                                        void removeMaterial(material)
                                      }
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                        {isTeacher && (
                          <form
                            className="mt-3 flex flex-wrap gap-2"
                            onSubmit={(event) =>
                              void addMaterial(
                                lesson.courseId,
                                event,
                                lesson.id,
                              )
                            }
                          >
                            <Input
                              name="title"
                              maxLength={160}
                              placeholder={t("teaching.fields.materialTitle")}
                              className="min-w-40 flex-1"
                            />
                            <Input
                              name="file"
                              type="file"
                              required
                              accept=".pdf,image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                              className="min-w-52 flex-1"
                            />
                            <Button size="sm" disabled={busy}>
                              {t("teaching.actions.attachToLesson")}
                            </Button>
                          </form>
                        )}
                      </div>
                      {isTeacher && lesson.attendances.length > 0 && (
                        <div className="mt-4 border-t border-border pt-3">
                          <p className="mb-2 text-sm font-medium">{t("teaching.fields.attendance")}</p>
                          <div className="space-y-2">
                            {lesson.attendances.map((attendance) => (
                              <div
                                key={attendance.id}
                                className="flex flex-wrap items-center justify-between gap-2 text-sm"
                              >
                                <span>
                                  {attendance.studentUsername || t("teaching.fields.studentFallback")}
                                </span>
                                {lesson.status === "COMPLETED" ? (
                                  <select
                                    disabled={busy}
                                    value={attendance.status}
                                    onChange={(event) =>
                                      void setAttendance(
                                        lesson,
                                        attendance.enrollmentId,
                                        event.target.value as
                                          "PRESENT" | "ABSENT" | "EXCUSED",
                                      )
                                    }
                                    className="h-9 rounded-md border border-input bg-background px-2"
                                    aria-label={t("teaching.fields.attendanceFor", { student: attendance.studentUsername || t("teaching.fields.studentFallback") })}
                                  >
                                    <option value="EXPECTED" disabled>
                                      {t("teaching.status.expected")}
                                    </option>
                                    <option value="PRESENT">{statusLabel("PRESENT")}</option>
                                    <option value="ABSENT">{statusLabel("ABSENT")}</option>
                                    <option value="EXCUSED">{statusLabel("EXCUSED")}</option>
                                  </select>
                                ) : (
                                  <span className="text-muted-foreground">
                                    {t("teaching.status.waiting")}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <section hidden={view !== "enrollments"}>
            <h2 className="mb-3 font-semibold">{t("teaching.fields.myRequestsAndInvitations")}</h2>
            {enrollments.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("teaching.empty.noRequests")}
              </p>
            ) : (
              <div className="grid gap-3">
                {enrollments.map((enrollment) => (
                  <article
                    key={enrollment.id}
                    className={`${cardClass} flex flex-wrap items-center justify-between gap-3`}
                  >
                    <div>
                      <h3 className="font-medium">
                        {enrollment.courseTitle || t("teaching.fields.courseFallback")}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {t("teaching.fields.instructorLabel")}{" "}
                        {enrollment.instructorUsername || t("teaching.fields.platformName")} ·{" "}
                        {statusLabel(enrollment.status)}
                      </p>
                    </div>
                    {enrollment.status === "INVITED" && (
                      <div className="flex gap-2">
                        <Button
                          disabled={busy}
                          onClick={() =>
                            void answerInvitation(enrollment.id, true)
                          }
                        >
                          {t("teaching.actions.acceptInvitation")}
                        </Button>
                        <Button
                          variant="outline"
                          disabled={busy}
                          onClick={() =>
                            void answerInvitation(enrollment.id, false)
                          }
                        >
                          {t("teaching.actions.declineInvitation")}
                        </Button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section hidden={view !== "materials"}>
            <h2 className="mb-3 font-semibold">{t("teaching.fields.myCourseMaterials")}</h2>
            {activeEnrolled.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("teaching.empty.materialsAfterEnrollment")}
              </p>
            ) : (
              <div className="grid gap-3">
                {activeEnrolled.map((course) => (
                  <article key={course.id} className={cardClass}>
                    <h3 className="font-medium">{course.title}</h3>
                    {courseLevelMaterials(course.id).length === 0 ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {t("teaching.empty.noSharedMaterials")}
                      </p>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {courseLevelMaterials(course.id).map((material) => (
                          <li
                            key={material.id}
                            className="flex flex-wrap items-center justify-between gap-2 text-sm"
                          >
                            <span>
                              {material.title}{" "}
                              <span className="text-muted-foreground">
                                · {formatFileSize(material.fileSize, t("teaching.feedback.unknownFileSize"), t("teaching.fields.mebibytes"), locale)}
                              </span>
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void getMaterial(material)}
                            >
                              <Download className="mr-1 h-4 w-4" />
                              {t("teaching.actions.download")}
                            </Button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>

          <section hidden={view !== "courses"}>
            <h2 className="mb-3 font-semibold">{t("teaching.fields.myCourses")}</h2>
            {myCourses.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("teaching.empty.noCreatedCourses")}</p>
            ) : (
              <div className="grid gap-3">
                {myCourses.map((course) => (
                  <article
                    key={course.id}
                    className={`${cardClass} flex flex-wrap items-center justify-between gap-3`}
                  >
                    <div>
                      <h3 className="font-medium">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatMoney(course.priceAmount, course.priceCurrency, locale)}{" "}
                        {course.priceUnit === "PER_COURSE"
                          ? t("teaching.fields.fullCourse")
                          : t("teaching.fields.perLesson")}{" "}
                        ·{" "}
                        {course.format === "GROUP"
                          ? t("teaching.fields.groupPlaces", { count: course.maxStudents })
                          : t("teaching.fields.individualCourse")}{" "}
                        · {t("teaching.fields.minutes", { count: course.durationMinutes })} · {statusLabel(course.status)}
                      </p>
                    </div>
                    <form
                      onSubmit={(event) => void addMaterial(course.id, event)}
                      className="w-full space-y-2 border-t border-border pt-3"
                    >
                      <p className="text-sm font-medium">
                        {t("teaching.fields.teachingMaterials")}
                      </p>
                      {courseLevelMaterials(course.id).map((material) => (
                        <div
                          key={material.id}
                          className="flex flex-wrap items-center justify-between gap-2 text-sm"
                        >
                            <span>
                              {material.title} ·{" "}
                              {formatFileSize(material.fileSize, t("teaching.feedback.unknownFileSize"), t("teaching.fields.mebibytes"), locale)}
                          </span>
                          <span className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => void getMaterial(material)}
                            >
                              <Download className="mr-1 h-4 w-4" />
                              {t("teaching.actions.open")}
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              disabled={busy}
                              aria-label={t("teaching.actions.deleteMaterial", { title: material.title })}
                              onClick={() => void removeMaterial(material)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </span>
                        </div>
                      ))}
                      <div className="flex flex-wrap gap-2">
                        <Input
                          name="title"
                          maxLength={160}
                          placeholder={t("teaching.fields.documentTitle")}
                          className="min-w-48 flex-1"
                        />
                        <Input
                          name="file"
                          type="file"
                          required
                          accept=".pdf,image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                          className="min-w-56 flex-1"
                        />
                        <Button disabled={busy}>{t("teaching.actions.addDocument")}</Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("teaching.fields.materialUploadRules")}
                      </p>
                    </form>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        disabled={
                          busy ||
                          (profile?.status !== "APPROVED" &&
                            course.status !== "PUBLISHED")
                        }
                        onClick={() => void setPublished(course)}
                      >
                        {course.status === "PUBLISHED"
                          ? t("teaching.actions.unpublish")
                          : t("teaching.actions.publish")}
                      </Button>
                      <Button
                        variant="destructive"
                        disabled={busy}
                        onClick={() => void archive(course)}
                      >
                        {t("teaching.actions.archive")}
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section hidden={view !== "catalog"}>
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">{t("teaching.fields.availableCourses")}</h2>
            </div>
            {visibleCatalog.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("teaching.empty.noPublishedCourses")}
              </p>
            ) : (
              <div className="grid gap-3">
                {visibleCatalog.map((course) => (
                  <article
                    key={course.id}
                    className={`${cardClass} flex flex-wrap items-center justify-between gap-3`}
                  >
                    <div>
                      <h3 className="font-medium">{course.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {course.description || t("teaching.fields.courseFallback")} ·{" "}
                        {formatMoney(course.priceAmount, course.priceCurrency, locale)}{" "}
                        ·{" "}
                        {course.priceUnit === "PER_COURSE"
                          ? t("teaching.fields.fullCourse")
                          : t("teaching.fields.perLesson")}{" "}
                        ·{" "}
                        {course.format === "GROUP"
                          ? t("teaching.fields.groupPlaces", { count: course.maxStudents })
                          : t("teaching.fields.individualCourse")}{" "}
                        · {t("teaching.fields.minutes", { count: course.durationMinutes })}
                      </p>
                    </div>
                    <Button
                      disabled={busy || myEnrollmentIds.has(course.id)}
                      onClick={() => void enroll(course)}
                    >
                      {myEnrollmentIds.has(course.id)
                        ? t("teaching.actions.enrollmentSent")
                        : t("teaching.actions.requestSeat")}
                    </Button>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
      <p className="mt-6 text-xs text-muted-foreground">
        {t("teaching.fields.accountNotice", { username: user?.username })}
      </p>
    </div>
  );
}

function currentTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
}

function toLocalInputValue(date: Date) {
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return shifted.toISOString().slice(0, 16);
}

function formatLessonDate(value: string, timeZone: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(value));
}

function lessonInput(
  startsAt: string,
  teachingMode: "IN_PERSON" | "ONLINE",
  location: string,
  meetingUrl: string,
): TeachingLessonInput {
  return {
    startsAt: new Date(startsAt).toISOString(),
    timeZone: currentTimeZone(),
    teachingMode,
    location: teachingMode === "IN_PERSON" ? location : null,
    meetingUrl: teachingMode === "ONLINE" ? meetingUrl : null,
  };
}

function formatMoney(minorAmount: number, currencyCode: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
  }).format(minorAmount / 100);
}

function formatFileSize(
  value: string,
  unknownSizeLabel: string,
  unitLabel: string,
  locale: string,
) {
  const bytes = Number(value);
  if (!Number.isFinite(bytes) || bytes < 0) return unknownSizeLabel;
  return (
    new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(
      bytes / (1024 * 1024),
    ) + ` ${unitLabel}`
  );
}
