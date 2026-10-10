import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, X } from 'lucide-react';
import { getLyricsOverride, saveLyricsOverride } from '@/services/lyricsApi';
import type { AdminLyricsReport } from '@/types/admin';

const MAX_LYRICS_LENGTH = 20_000;

export default function AdminLyricsEditor({ report }: { report: AdminLyricsReport }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const save = useMutation({
    mutationFn: () =>
      saveLyricsOverride({
        provider: report.provider,
        trackId: report.trackId,
        title: report.title,
        artist: report.artist,
        plainLyrics: content,
      }),
    onSuccess: () => {
      setSaved(true);
      setSaveError(false);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'lyrics-reports'] });
    },
    onError: () => setSaveError(true),
  });

  async function openEditor() {
    setOpen(true);
    setLoadError(false);
    setSaved(false);
    setLoading(true);
    try {
      const lyrics = await getLyricsOverride(
        report.provider,
        report.trackId,
        report.title,
        report.artist,
      );
      setContent(lyrics?.plainLyrics ?? '');
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => void openEditor()} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <Pencil aria-hidden="true" className="h-4 w-4" />{t('admin.resources.lyricsReports.editLyrics')}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby={`lyrics-editor-title-${report.id}`} className="w-full max-w-3xl rounded-xl border border-border bg-card p-4 shadow-xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={`lyrics-editor-title-${report.id}`} className="text-lg font-semibold">{t('admin.resources.lyricsReports.editorTitle')}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{report.title} — {report.artist}</p>
                <p className="mt-1 text-sm text-muted-foreground">{report.reason}</p>
                {report.proposedLyrics ? (
                  <div className="mt-3 rounded-lg border border-border bg-background p-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-xs font-medium text-muted-foreground">{t('admin.resources.lyricsReports.userProposal')}</span>
                      <button
                        type="button"
                        onClick={() => { setContent(report.proposedLyrics ?? ''); setSaved(false); setSaveError(false); }}
                        className="min-h-8 rounded-md border border-border px-2 text-xs font-medium hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        {t('admin.resources.lyricsReports.useProposal')}
                      </button>
                    </div>
                    <p className="max-h-32 overflow-y-auto whitespace-pre-wrap font-mono text-xs text-foreground">{report.proposedLyrics}</p>
                  </div>
                ) : null}
              </div>
              <button type="button" aria-label={t('common.close')} onClick={() => setOpen(false)} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><X aria-hidden="true" className="h-4 w-4" /></button>
            </div>
            {loading ? <p className="py-8 text-sm text-muted-foreground">{t('admin.resources.lyricsReports.loadingLyrics')}</p> : loadError ? <p role="alert" className="py-8 text-sm text-destructive">{t('admin.resources.lyricsReports.loadLyricsFailed')}</p> : (
              <>
                <label htmlFor={`lyrics-content-${report.id}`} className="sr-only">{t('admin.resources.lyricsReports.lyricsLabel')}</label>
                <textarea id={`lyrics-content-${report.id}`} value={content} onChange={(event) => { setContent(event.target.value); setSaved(false); setSaveError(false); }} maxLength={MAX_LYRICS_LENGTH} spellCheck={false} className="mt-5 min-h-72 w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm leading-6 text-foreground outline-none focus:ring-2 focus:ring-primary sm:min-h-96" />
                <div className="mt-2 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-3">
                    {saved ? <span role="status" className="text-green-600">{t('admin.resources.lyricsReports.lyricsSaved')}</span> : null}
                    {saveError ? <span role="alert" className="text-destructive">{t('admin.resources.lyricsReports.saveLyricsFailed')}</span> : null}
                  </div>
                  <button type="button" disabled={save.isPending} onClick={() => save.mutate()} className="min-h-10 rounded-md bg-primary px-4 font-medium text-primary-foreground disabled:opacity-50">{save.isPending ? t('common.saving') : t('common.save')}</button>
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
