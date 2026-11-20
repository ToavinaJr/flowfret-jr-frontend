import { GraduationCap, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';import type { TeachingPageController } from './useTeachingPageController';
import { TEACHING_CARD_CLASS as cardClass } from './teachingPage.constants';
export function TeachingCourseSetupPanel({ page }: { page: TeachingPageController }) {
  const {
    view, t, profile, statusLabel, busy, headline, setHeadline, biography,
    setBiography, experienceYears, setExperienceYears, saveTeacher, courseFormat,
    setCourseFormat, priceUnit, setPriceUnit, courseCapacity, setCourseCapacity,
    title, setTitle, price, setPrice, currency, setCurrency, duration, setDuration,
    description, setDescription, addCourse,
  } = page;

  return (
    <>
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
    </>
  );
}