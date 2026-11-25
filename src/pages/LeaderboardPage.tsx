import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PAGE_SHELL, PAGE_TITLE } from '@/constants/navigation';
import { fetchQuizLeaderboard, type LeaderboardPeriod } from '@/services/quizzesApi';

const periods: LeaderboardPeriod[] = ['ALL_TIME', 'WEEK', 'DAY'];

export default function LeaderboardPage() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<LeaderboardPeriod>('ALL_TIME');
  const query = useQuery({ queryKey: ['quiz-leaderboard', period], queryFn: () => fetchQuizLeaderboard(period) });
  return <main className={PAGE_SHELL}>
    <h1 className={PAGE_TITLE}>{t('leaderboard.title')}</h1>
    <div className="my-5 flex gap-2" role="tablist" aria-label={t('leaderboard.title')}>
      {periods.map((item) => <button key={item} type="button" role="tab" aria-selected={period === item} onClick={() => setPeriod(item)} className={`rounded-full border px-4 py-2 text-sm ${period === item ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}`}>{t(`leaderboard.periods.${item}`)}</button>)}
    </div>
    {query.isLoading ? <p role="status">{t('leaderboard.loading')}</p> : query.error ? <p role="alert">{t('leaderboard.error')}</p> : !query.data?.length ? <p className="rounded-xl border p-5 text-muted-foreground">{t('leaderboard.empty')}</p> : <ol className="divide-y rounded-xl border bg-card">
      {query.data.map((member) => <li key={member.username} className="flex items-center gap-4 p-4">
        <span className="w-8 text-center font-semibold tabular-nums">{member.rank}</span>
        {member.avatarUrl ? <img src={member.avatarUrl} alt="" className="h-10 w-10 rounded-full object-cover" /> : <span aria-hidden="true" className="grid h-10 w-10 place-items-center rounded-full bg-muted font-semibold">{member.username.slice(0, 1).toUpperCase()}</span>}
        <span className="min-w-0 flex-1 truncate font-medium">{member.username}</span>
        <span className="text-right text-sm"><strong className="block">{t('leaderboard.points', { count: member.points })}</strong><span className="text-muted-foreground">{t('leaderboard.completed', { count: member.completedQuizzes })}</span></span>
      </li>)}
    </ol>}
  </main>;
}
