import { AdminResourceTabs } from '@/admin/AdminResourceTabs';
import { PAGE_SHELL, PAGE_TITLE } from '@/constants/navigation';
import { TeachingWorkspaceSkeleton } from '@/components/skeletons/TeachingWorkspaceSkeleton';
import { TeachingCalendarPanel } from './TeachingCalendarPanel';
import { TeachingCourseSetupPanel } from './TeachingCourseSetupPanel';
import { TeachingCoursesPanel } from './TeachingCoursesPanel';
import { TeachingEnrollmentMaterialsPanel } from './TeachingEnrollmentMaterialsPanel';
import { TEACHING_VIEWS } from './teachingPage.constants';
import { useTeachingPageController } from './useTeachingPageController';

export default function TeachingPage() {
  const page = useTeachingPageController();
  const { t, view, loading, user } = page;

  return (
    <div className={PAGE_SHELL}>
      <h1 className={PAGE_TITLE}>{t('teaching.pageTitle')}</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        {t('teaching.pageDescription')}
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
          <TeachingCourseSetupPanel page={page} />
          <TeachingCalendarPanel page={page} />
          <TeachingEnrollmentMaterialsPanel page={page} />
          <TeachingCoursesPanel page={page} />
        </div>
      )}
      <p className="mt-6 text-xs text-muted-foreground">
        {t('teaching.fields.accountNotice', { username: user?.username })}
      </p>
    </div>
  );
}