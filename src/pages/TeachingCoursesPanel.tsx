import { BookOpen, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';import type { TeachingPageController } from './useTeachingPageController';
import { TEACHING_CARD_CLASS as cardClass } from './teachingPage.constants';import { formatFileSize, formatMoney } from './teachingPage.utils';

export function TeachingCoursesPanel({ page }: { page: TeachingPageController }) {
  const {
    view, t, myCourses, locale, statusLabel, addMaterial, courseLevelMaterials,
    getMaterial, removeMaterial, busy, profile, setPublished, archive,
    visibleCatalog, myEnrollmentIds, enroll,
  } = page;

  return (
    <>
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
                        · {t("teaching.fields.availablePlaces", {
                          count: Math.max(course.maxStudents - course.reservedSeats, 0),
                          total: course.maxStudents,
                        })}{" "}
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
                        · {t("teaching.fields.availablePlaces", {
                          count: Math.max(course.maxStudents - course.reservedSeats, 0),
                          total: course.maxStudents,
                        })}{" "}
                        · {t("teaching.fields.minutes", { count: course.durationMinutes })}
                      </p>
                    </div>
                    <Button
                      disabled={
                        busy ||
                        myEnrollmentIds.has(course.id) ||
                        course.reservedSeats >= course.maxStudents
                      }
                      onClick={() => void enroll(course)}
                    >
                      {myEnrollmentIds.has(course.id)
                        ? t("teaching.actions.enrollmentSent")
                        : course.reservedSeats >= course.maxStudents
                          ? t("teaching.actions.courseFull")
                          : t("teaching.actions.requestSeat")}
                    </Button>
                  </article>
                ))}
              </div>
            )}
          </section>
    </>
  );
}