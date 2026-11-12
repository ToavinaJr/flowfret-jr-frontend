import { useState } from 'react';
import { AdminCardsSkeleton } from '@/components/skeletons/AdminCardsSkeleton';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { PAGE_SHELL, PAGE_TITLE } from '@/constants/navigation';
import { fetchContactMessages, updateContactMessageStatus, type ContactMessage } from '@/services/contactApi';

const PAGE_SIZE = 25;
const STATUSES: ContactMessage['status'][] = ['NEW', 'IN_PROGRESS', 'RESOLVED'];

export default function AdminContactPage() {
  const { t, i18n } = useTranslation();
  const client = useQueryClient();
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<ContactMessage['status'] | ''>('');
  const messages = useQuery({
    queryKey: ['admin', 'contact-messages', page, status],
    queryFn: () => fetchContactMessages({
      take: PAGE_SIZE,
      skip: page * PAGE_SIZE,
      ...(status ? { status } : {}),
    }),
  });
  const update = useMutation({
    mutationFn: ({ id, nextStatus }: { id: string; nextStatus: ContactMessage['status'] }) =>
      updateContactMessageStatus(id, nextStatus),
    onSuccess: () => client.invalidateQueries({ queryKey: ['admin', 'contact-messages'] }),
  });
  const totalPages = Math.max(1, Math.ceil((messages.data?.totalCount ?? 0) / PAGE_SIZE));

  return (
    <section className={`${PAGE_SHELL} space-y-5`}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={PAGE_TITLE}>{t('admin.contact.title')}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{t('admin.contact.description')}</p>
        </div>
        <label className="text-sm">
          {t('admin.contact.filterStatus')}
          <select value={status} onChange={(event) => { setStatus(event.target.value as ContactMessage['status'] | ''); setPage(0); }} className="mt-1 block min-h-10 rounded-md border border-input bg-background px-3">
            <option value="">{t('admin.contact.allStatuses')}</option>
            {STATUSES.map((value) => <option key={value} value={value}>{t(`admin.contact.status.${value}`)}</option>)}
          </select>
        </label>
      </header>

      {update.isError && <p role="alert" className="text-sm text-destructive">{t('admin.contact.updateFailed')}</p>}

      <section className="overflow-hidden rounded-xl border border-border bg-card">
        {messages.isLoading ? (
          <div className="p-4"><AdminCardsSkeleton /></div>
        ) : messages.isError ? (
          <p role="alert" className="p-6 text-sm text-destructive">{t('admin.contact.loadFailed')}</p>
        ) : !messages.data?.nodes.length ? (
          <p className="p-8 text-center text-sm text-muted-foreground">{t('admin.contact.empty')}</p>
        ) : (
          <>
            <div className="divide-y divide-border lg:hidden">
              {messages.data.nodes.map((message) => (
                <ContactMessageCard key={message.id} message={message} locale={i18n.language} onStatusChange={(nextStatus) => update.mutate({ id: message.id, nextStatus })} pending={update.isPending} />
              ))}
            </div>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full table-fixed text-left text-sm">
                <thead className="bg-secondary/60 text-xs text-muted-foreground">
                  <tr>
                    <th scope="col" className="w-48 px-4 py-3">{t('admin.contact.sender')}</th>
                    <th scope="col" className="w-56 px-4 py-3">{t('admin.contact.subject')}</th>
                    <th scope="col" className="px-4 py-3">{t('admin.contact.message')}</th>
                    <th scope="col" className="w-44 px-4 py-3">{t('admin.contact.received')}</th>
                    <th scope="col" className="w-44 px-4 py-3">{t('admin.contact.status.label')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {messages.data.nodes.map((message) => (
                    <tr key={message.id} className="align-top">
                      <td className="px-4 py-3"><p className="font-medium">{message.name}</p><a href={`mailto:${message.email}`} className="break-all text-xs text-primary hover:underline">{message.email}</a></td>
                      <td className="break-words px-4 py-3 font-medium">{message.subject}</td>
                      <td className="whitespace-pre-wrap break-words px-4 py-3 text-muted-foreground">{message.message}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(message.createdAt, i18n.language)}</td>
                      <td className="px-4 py-3"><StatusSelect message={message} onChange={(nextStatus) => update.mutate({ id: message.id, nextStatus })} disabled={update.isPending} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <footer className="flex items-center justify-between gap-3 border-t border-border p-3">
          <span className="text-xs text-muted-foreground">{t('admin.pageIndicator', { page: page + 1, total: totalPages })}</span>
          <div className="flex gap-2">
            <button type="button" aria-label={t('admin.previousPage')} disabled={page === 0 || messages.isFetching} onClick={() => setPage((current) => Math.max(0, current - 1))} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-border disabled:opacity-40"><ChevronLeft aria-hidden="true" className="h-4 w-4" /></button>
            <button type="button" aria-label={t('admin.nextPage')} disabled={page + 1 >= totalPages || messages.isFetching} onClick={() => setPage((current) => current + 1)} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border border-border disabled:opacity-40"><ChevronRight aria-hidden="true" className="h-4 w-4" /></button>
          </div>
        </footer>
      </section>
    </section>
  );
}

function ContactMessageCard({ message, locale, onStatusChange, pending }: { message: ContactMessage; locale: string; onStatusChange: (status: ContactMessage['status']) => void; pending: boolean }) {
  const { t } = useTranslation();
  return (
    <article className="space-y-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="font-medium">{message.name}</p><a href={`mailto:${message.email}`} className="break-all text-sm text-primary">{message.email}</a></div>
        <time className="shrink-0 text-xs text-muted-foreground">{formatDate(message.createdAt, locale)}</time>
      </div>
      <h2 className="font-medium">{message.subject}</h2>
      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">{message.message}</p>
      <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">{t('admin.contact.status.label')}</span>
        <StatusSelect message={message} onChange={onStatusChange} disabled={pending} />
      </div>
    </article>
  );
}

function StatusSelect({ message, onChange, disabled }: { message: ContactMessage; onChange: (status: ContactMessage['status']) => void; disabled: boolean }) {
  const { t } = useTranslation();
  return (
    <label className="block">
      <span className="sr-only">{t('admin.contact.status.forMessage', { subject: message.subject })}</span>
      <select value={message.status} disabled={disabled} onChange={(event) => onChange(event.target.value as ContactMessage['status'])} className="min-h-10 max-w-full rounded-md border border-input bg-background px-2 text-sm disabled:opacity-60">
        {STATUSES.map((value) => <option key={value} value={value}>{t(`admin.contact.status.${value}`)}</option>)}
      </select>
    </label>
  );
}

function formatDate(value: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));
}
