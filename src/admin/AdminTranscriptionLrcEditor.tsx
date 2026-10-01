import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Pencil, X } from 'lucide-react';
import { getAdminTranscriptionLrc, saveAdminTranscriptionLrc } from '@/services/transcriptionsApi';
import type { AdminTranscription } from '@/types/admin';

const MAX_LRC_LENGTH = 12_000;

export default function AdminTranscriptionLrcEditor({ transcription }: { transcription: AdminTranscription }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [loadError, setLoadError] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const save = useMutation({
    mutationFn: () => saveAdminTranscriptionLrc(transcription.id, content),
    onSuccess: () => {
      setSaved(true);
      setSaveError(false);
      void queryClient.invalidateQueries({ queryKey: ['admin', 'transcriptions'] });
    },
    onError: () => setSaveError(true),
  });

  async function openEditor() {
    setOpen(true);
    setLoadError(false);
    setSaved(false);
    setLoading(true);
    try { setContent(await getAdminTranscriptionLrc(transcription.id)); }
    catch { setLoadError(true); }
    finally { setLoading(false); }
  }

  return (
    <>
      <button type="button" onClick={() => void openEditor()} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-foreground hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <Pencil aria-hidden="true" className="h-4 w-4" />{t('admin.resources.transcriptions.editLrc')}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-6" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby={`lrc-editor-title-${transcription.id}`} className="w-full max-w-3xl rounded-xl border border-border bg-card p-4 shadow-xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id={`lrc-editor-title-${transcription.id}`} className="text-lg font-semibold">{t('admin.resources.transcriptions.editorTitle')}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{transcription.title || transcription.trackId}</p>
              </div>
              <button type="button" aria-label={t('common.close')} onClick={() => setOpen(false)} className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-md hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><X aria-hidden="true" className="h-4 w-4" /></button>
            </div>
            {loading ? <p className="py-8 text-sm text-muted-foreground">{t('admin.resources.transcriptions.loadingLrc')}</p> : loadError ? <p role="alert" className="py-8 text-sm text-destructive">{t('admin.resources.transcriptions.loadLrcFailed')}</p> : (
              <>
                <label htmlFor={`lrc-content-${transcription.id}`} className="sr-only">{t('admin.resources.transcriptions.lrcLabel')}</label>
                <textarea id={`lrc-content-${transcription.id}`} value={content} onChange={(event) => { setContent(event.target.value); setSaved(false); setSaveError(false); }} maxLength={MAX_LRC_LENGTH} spellCheck={false} className="mt-5 min-h-72 w-full resize-y rounded-lg border border-border bg-background p-3 font-mono text-sm leading-6 text-foreground outline-none focus:ring-2 focus:ring-primary sm:min-h-96" />
                <div className="mt-2 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-muted-foreground">{t('admin.resources.transcriptions.lrcCharacters', { count: content.length, max: MAX_LRC_LENGTH })}</span>
                  <div className="flex flex-wrap items-center gap-3">
                    {saved ? <span role="status" className="text-green-600">{t('admin.resources.transcriptions.lrcSaved')}</span> : null}
                    {saveError ? <span role="alert" className="text-destructive">{t('admin.resources.transcriptions.saveLrcFailed')}</span> : null}
                    <button type="button" disabled={save.isPending} onClick={() => save.mutate()} className="min-h-10 rounded-md bg-primary px-4 font-medium text-primary-foreground disabled:opacity-50">{save.isPending ? t('common.saving') : t('common.save')}</button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
