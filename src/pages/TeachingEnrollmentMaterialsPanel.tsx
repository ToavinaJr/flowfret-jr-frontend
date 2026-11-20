import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeachingEnrollmentsPanel } from '@/components/teaching/TeachingEnrollmentsPanel';import type { TeachingPageController } from './useTeachingPageController';
import { TEACHING_CARD_CLASS as cardClass } from './teachingPage.constants';import { formatFileSize } from './teachingPage.utils';

export function TeachingEnrollmentMaterialsPanel({ page }: { page: TeachingPageController }) {
  const {
    view, busy, myCourses, user, enrollments, teacherEnrollments,
    answerInvitation, inviteStudent, changeEnrollmentStatus, t, activeEnrolled,
    courseLevelMaterials, locale, getMaterial,
  } = page;

  return (
    <>
      <section hidden={view !== "enrollments"}>
            <TeachingEnrollmentsPanel
              busy={busy}
              courses={myCourses}
              currentUserId={user?.id}
              studentEnrollments={enrollments}
              teacherEnrollments={teacherEnrollments}
              onInvitationResponse={answerInvitation}
              onInvite={inviteStudent}
              onStatusChange={changeEnrollmentStatus}
            />
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
    </>
  );
}