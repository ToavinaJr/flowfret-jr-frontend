import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Trash2 } from 'lucide-react';
import type { TeachingPageController } from './useTeachingPageController';
import { TEACHING_CARD_CLASS as cardClass } from './teachingPage.constants';
import {
  currentTimeZone,
  formatFileSize,
  formatLessonDate,
  toLocalInputValue,
} from './teachingPage.utils';

export function TeachingCalendarPanel({ page }: { page: TeachingPageController }) {
  const {
    view, t, locale, profile, myCourses, addLesson, lessonCourseId,
    setLessonCourseId, lessonStartsAt, setLessonStartsAt, lessonMode,
    setLessonMode, lessonLocation, setLessonLocation, lessonMeetingUrl,
    setLessonMeetingUrl, repeatWeekly, setRepeatWeekly, repeatOccurrences,
    setRepeatOccurrences, busy, selectedLessonCourse, lessons, user, materials,
    statusLabel, moveLesson, cancelLesson, completeLesson, setAttendance,
    addMaterial, getMaterial, removeMaterial,
  } = page;

  return (<section hidden={view !== "calendar"}>
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
          </section>  );
}
