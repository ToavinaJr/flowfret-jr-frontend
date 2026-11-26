import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { graphqlRequest } from '@/services/graphqlClient';

type QuestionKind = 'IDENTIFY' | 'TRANSPOSE' | 'PLACE' | 'BARRE';
type QuestionDraft = { kind: QuestionKind; definition: unknown };
type AdminQuiz = { id: string; title: string; description: string | null; status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'; questions: { kind: string; definition: unknown }[] };

function defaultQuestion(kind: QuestionKind): QuestionDraft {
  const position = { frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0], baseFret: 1, barres: [] };
  if (kind === 'IDENTIFY') return { kind, definition: { kind: 'identify', position, options: [{ key: 'C', suffix: 'major' }, { key: 'D', suffix: 'minor' }], answerIndex: 0 } };
  if (kind === 'TRANSPOSE') return { kind, definition: { kind: 'transpose', subject: 'chord', source: { key: 'D', suffix: 'major' }, semitones: 2, options: [{ key: 'E', suffix: 'major' }, { key: 'F', suffix: 'major' }], answerIndex: 0 } };
  if (kind === 'BARRE') {
    const barre = { frets: [1, 3, 3, 2, 1, 1], fingers: [1, 3, 4, 2, 1, 1], baseFret: 1, barres: [1] };
    return { kind, definition: { kind: 'barre', chord: { key: 'F', suffix: 'major' }, rule: { required: [5, 9, 0], allowed: [5, 9, 0] }, example: barre } };
  }
  return { kind, definition: { kind: 'place', chord: { key: 'C', suffix: 'major' }, rule: { required: [0, 4, 7], allowed: [0, 4, 7] }, example: position } };
}

const fetchAdminQuizzes = () => graphqlRequest<{ adminQuizzes: AdminQuiz[] }>({ query: 'query AdminQuizzes { adminQuizzes }' }).then((result) => result.adminQuizzes);
const saveAdminQuiz = (input: object) => graphqlRequest<{ adminSaveQuiz: AdminQuiz }>({ query: 'mutation AdminSaveQuiz($input: AdminQuizInput!) { adminSaveQuiz(input: $input) }', variables: { input } }).then((result) => result.adminSaveQuiz);

export default function AdminQuizzesPage() {
  const { t } = useTranslation();
  const client = useQueryClient();
  const query = useQuery({ queryKey: ['admin-quizzes'], queryFn: fetchAdminQuizzes });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('DRAFT');
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [formError, setFormError] = useState('');
  const save = useMutation({ mutationFn: saveAdminQuiz, onSuccess: () => {
    void client.invalidateQueries({ queryKey: ['admin-quizzes'] });
    setSelectedId(null); setTitle(''); setDescription(''); setStatus('DRAFT'); setQuestions([]); setFormError('');
  } });

  function edit(quiz: AdminQuiz) {
    setSelectedId(quiz.id); setTitle(quiz.title); setDescription(quiz.description ?? ''); setStatus(quiz.status);
    setQuestions(quiz.questions.map((question) => ({ kind: question.kind as QuestionKind, definition: question.definition })));
    setFormError('');
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    try {
      const normalized = questions.map((question) => ({ ...question, definition: typeof question.definition === 'string' ? JSON.parse(question.definition) : question.definition }));
      save.mutate({ ...(selectedId ? { id: selectedId } : {}), title, description, status, questions: normalized });
    } catch { setFormError(t('admin.adminQuizzes.invalidQuestions')); }
  }

  function move(index: number, offset: -1 | 1) {
    setQuestions((current) => { const next = [...current]; [next[index], next[index + offset]] = [next[index + offset], next[index]]; return next; });
  }

  return <main className="space-y-6 p-4 sm:p-6">
    <div><h1 className="text-2xl font-bold">{t('admin.adminQuizzes.title')}</h1><p className="mt-1 text-sm text-muted-foreground">{t('admin.adminQuizzes.description')}</p></div>
    {query.error && <p role="alert" className="text-sm text-destructive">{t('admin.adminQuizzes.loadError')}</p>}
    <section className="rounded-xl border bg-card p-4 sm:p-6">
      <h2 className="text-lg font-semibold">{selectedId ? t('admin.adminQuizzes.edit') : t('admin.adminQuizzes.create')}</h2>
      <form className="mt-4 space-y-4" onSubmit={submit}>
        <label className="block space-y-1 text-sm"><span>{t('admin.adminQuizzes.name')}</span><input required maxLength={160} value={title} onChange={(event) => setTitle(event.target.value)} className="min-h-11 w-full rounded-md border bg-background px-3" /></label>
        <label className="block space-y-1 text-sm"><span>{t('admin.adminQuizzes.summary')}</span><textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={2} className="w-full rounded-md border bg-background p-3" /></label>
        <label className="block w-full space-y-1 text-sm"><span className="block">{t('admin.adminQuizzes.status')}</span><select value={status} onChange={(event) => setStatus(event.target.value as typeof status)} className="block min-h-11 w-full rounded-md border border-input bg-background px-3 text-foreground outline-none focus:ring-2 focus:ring-primary"><option value="DRAFT">{t('admin.adminQuizzes.statusOptions.DRAFT')}</option><option value="PUBLISHED">{t('admin.adminQuizzes.statusOptions.PUBLISHED')}</option><option value="ARCHIVED">{t('admin.adminQuizzes.statusOptions.ARCHIVED')}</option></select></label>
        <div className="space-y-3">
          <div><h3 className="text-sm font-semibold">{t('admin.adminQuizzes.questions')}</h3><p className="text-xs text-muted-foreground">{t('admin.adminQuizzes.questionsHelp')}</p></div>
          {questions.map((question, index) => <div key={index} className="space-y-2 rounded-lg border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-auto text-sm font-medium">{t('admin.adminQuizzes.questionNumber', { number: index + 1 })}</span>
              <label className="sr-only" htmlFor={`quiz-question-kind-${index}`}>{t('admin.adminQuizzes.questionKind')}</label>
              <select id={`quiz-question-kind-${index}`} value={question.kind} onChange={(event) => setQuestions((current) => current.map((item, row) => row === index ? defaultQuestion(event.target.value as QuestionKind) : item))} className="min-h-10 rounded-md border bg-background px-2 text-sm">
                <option value="IDENTIFY">{t('quiz.kinds.identify.title')}</option><option value="TRANSPOSE">{t('quiz.kinds.transpose.title')}</option><option value="PLACE">{t('quiz.kinds.place.title')}</option><option value="BARRE">{t('quiz.kinds.barre.title')}</option>
              </select>
              <Button type="button" variant="secondary" disabled={index === 0} aria-label={t('admin.adminQuizzes.moveUp')} onClick={() => move(index, -1)}>↑</Button>
              <Button type="button" variant="secondary" disabled={index === questions.length - 1} aria-label={t('admin.adminQuizzes.moveDown')} onClick={() => move(index, 1)}>↓</Button>
              <Button type="button" variant="secondary" aria-label={t('admin.adminQuizzes.removeQuestion')} onClick={() => setQuestions((current) => current.filter((_, row) => row !== index))}>×</Button>
            </div>
            <textarea aria-label={t('admin.adminQuizzes.questionDefinition', { number: index + 1 })} value={JSON.stringify(question.definition, null, 2)} onChange={(event) => setQuestions((current) => current.map((item, row) => row === index ? { ...item, definition: event.target.value } : item))} rows={9} spellCheck={false} className="w-full rounded-md border bg-background p-3 font-mono text-xs" />
          </div>)}
          <div className="flex flex-wrap gap-2">{(['IDENTIFY', 'TRANSPOSE', 'PLACE', 'BARRE'] as const).map((kind) => <Button key={kind} type="button" variant="secondary" onClick={() => setQuestions((current) => [...current, defaultQuestion(kind)])}>{t(`admin.adminQuizzes.add.${kind}`)}</Button>)}</div>
        </div>
        {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
        {save.error && <p role="alert" className="text-sm text-destructive">{t('admin.adminQuizzes.saveError')}</p>}
        <div className="flex gap-2"><Button type="submit" disabled={save.isPending}>{t('admin.adminQuizzes.save')}</Button>{selectedId && <Button type="button" variant="secondary" onClick={() => setSelectedId(null)}>{t('admin.adminQuizzes.cancel')}</Button>}</div>
      </form>
    </section>
    <section className="space-y-3"><h2 className="text-lg font-semibold">{t('admin.adminQuizzes.existing')}</h2>{query.isLoading ? <p role="status">{t('admin.adminQuizzes.loading')}</p> : <ul className="divide-y rounded-xl border bg-card">{(query.data ?? []).map((quiz) => <li key={quiz.id} className="flex items-center gap-3 p-4"><div className="min-w-0 flex-1"><p className="truncate font-medium">{quiz.title}</p><p className="text-xs text-muted-foreground">{t(`admin.adminQuizzes.statusOptions.${quiz.status}`)} · {quiz.questions.length}</p></div><Button type="button" variant="secondary" onClick={() => edit(quiz)}>{t('admin.adminQuizzes.edit')}</Button></li>)}</ul>}</section>
  </main>;
}
