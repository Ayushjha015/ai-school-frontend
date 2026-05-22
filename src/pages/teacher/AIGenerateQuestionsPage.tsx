import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { generateQuestions, saveGeneratedQuestions } from '../../api/teacherService';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { SectionCard } from '../../components/common/SectionCard';
import { useSubjectsQuery } from '../../hooks/useTeacherQueries';
import type { GeneratedQuestionPreview } from '../../types/api';
import { IconLabel, appIcons } from '../../utils/appIcons';

type AIForm = {
  subjectId: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  count: number;
  customInstructions?: string;
};

function getPreviewFingerprint(questions: GeneratedQuestionPreview[]) {
  return JSON.stringify(questions);
}

export function AIGenerateQuestionsPage() {
  const queryClient = useQueryClient();
  const subjectsQuery = useSubjectsQuery(1, 100);
  const [generated, setGenerated] = useState<GeneratedQuestionPreview[]>([]);
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);
  const [savedFingerprint, setSavedFingerprint] = useState<string | null>(null);
  const form = useForm<AIForm>({ defaultValues: { subjectId: '', topic: '', difficulty: 'medium', count: 5, customInstructions: '' } });

  const currentFingerprint = useMemo(() => getPreviewFingerprint(generated), [generated]);
  const alreadySavedCurrentPreview = generated.length > 0 && savedFingerprint === currentFingerprint;

  const generateMutation = useMutation({
    mutationFn: generateQuestions,
    onSuccess: (response) => {
      setGenerated(response.questions);
      setSelectedIndexes(response.questions.map((_, index) => index));
      setSavedFingerprint(null);
      toast.success(`Generated ${response.generatedCount} questions.`);
    },
    onError: () => toast.error('Unable to generate questions right now.'),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: { subjectId: string; questions: GeneratedQuestionPreview[] }) =>
      saveGeneratedQuestions({
        subjectId: payload.subjectId,
        questions: payload.questions.map((question) => ({
          questionText: question.questionText,
          topic: question.topic || null,
          difficulty: question.difficulty || null,
          options: question.options,
          tagIds: question.tags.length > 0 ? question.tags.map((tag) => tag.id) : null,
        })),
      }),
    onSuccess: async () => {
      setSavedFingerprint(currentFingerprint);
      toast.success('Selected questions saved to the bank.');
      await queryClient.invalidateQueries({ queryKey: ['teacher', 'questions'] });
    },
    onError: () => toast.error('Unable to save generated questions.'),
  });

  if (subjectsQuery.isLoading) return <LoadingScreen label="Loading AI question generator..." />;
  if (subjectsQuery.isError || !subjectsQuery.data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load the AI generator.</div>;

  const selectedQuestions = generated.filter((_, index) => selectedIndexes.includes(index));

  return (
    <div className="space-y-6">
      <SectionCard title="AI question generator" eyebrow="Preview before save">
        <form className="grid gap-4 lg:grid-cols-2" onSubmit={form.handleSubmit((values) => generateMutation.mutate({ ...values, count: Number(values.count), customInstructions: values.customInstructions || null }))}>
          <select {...form.register('subjectId')} className="rounded-2xl border border-slate-200 px-4 py-3"><option value="">Select subject</option>{subjectsQuery.data.items.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}</select>
          <input {...form.register('topic')} placeholder="Topic" className="rounded-2xl border border-slate-200 px-4 py-3" />
          <select {...form.register('difficulty')} className="rounded-2xl border border-slate-200 px-4 py-3"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
          <input type="number" min={1} max={20} {...form.register('count', { valueAsNumber: true })} className="rounded-2xl border border-slate-200 px-4 py-3" />
          <textarea {...form.register('customInstructions')} placeholder="Optional instructions for the generator" rows={4} className="rounded-2xl border border-slate-200 px-4 py-3 lg:col-span-2" />
          <button type="submit" disabled={generateMutation.isPending} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 lg:col-span-2"><IconLabel label={generateMutation.isPending ? 'Generating...' : 'Generate preview'} icon={appIcons.Sparkles} /></button>
        </form>
      </SectionCard>

      <SectionCard
        title="Generated preview"
        eyebrow="Select what to save"
        action={generated.length > 0 ? (
          <button
            type="button"
            onClick={() => saveMutation.mutate({ subjectId: form.getValues('subjectId'), questions: selectedQuestions })}
            disabled={saveMutation.isPending || selectedQuestions.length === 0 || alreadySavedCurrentPreview}
            className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <IconLabel label={saveMutation.isPending ? 'Saving...' : alreadySavedCurrentPreview ? 'Saved' : `Save ${selectedQuestions.length} selected`} icon={alreadySavedCurrentPreview ? appIcons.CheckCircle2 : appIcons.Save} />
          </button>
        ) : null}
      >
        {generated.length === 0 ? (
          <EmptyState title="No preview yet" description="Generate AI questions to preview and selectively save them." />
        ) : (
          <div className="space-y-4">
            {generated.map((question, index) => {
              const selected = selectedIndexes.includes(index);

              return (
                <div
                  key={`${question.questionText}-${index}`}
                  className={`rounded-[22px] border bg-white p-5 transition ${
                    selected
                      ? 'border-emerald-400 shadow-[0_0_0_1px_rgba(52,211,153,0.18)]'
                      : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 flex-1 gap-4">
                      <div className="mt-9 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-base font-bold text-violet-600">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-500">
                          {question.difficulty || 'generated'}
                          {question.topic ? ` - ${question.topic}` : ''}
                        </p>
                        <h2 className="mt-4 text-base font-bold leading-6 text-slate-950">{question.questionText}</h2>
                        <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-violet-500">Auto-tagged by AI</p>
                        <ol className="mt-4 space-y-3 text-sm text-slate-500">
                          {question.options.map((option, optionIndex) => (
                            <li
                              key={`${index}-${optionIndex}`}
                              className={`flex min-h-9 items-center gap-3 px-3 py-2 transition ${
                                option.isCorrect ? 'bg-emerald-50 text-emerald-500' : ''
                              }`}
                            >
                              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${option.isCorrect ? 'border-emerald-400' : 'border-slate-900'}`}>
                                {option.isCorrect ? <span className="h-2 w-2 rounded-full bg-emerald-400" /> : null}
                              </span>
                              <span className="min-w-0 flex-1">{option.optionText}</span>
                              {option.isCorrect ? <span className="shrink-0 rounded-md bg-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-500">Correct answer</span> : null}
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => setSelectedIndexes((current) => selected ? current.filter((item) => item !== index) : [...current, index])}
                      className="mt-1 h-5 w-5 accent-emerald-500"
                      disabled={alreadySavedCurrentPreview}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
