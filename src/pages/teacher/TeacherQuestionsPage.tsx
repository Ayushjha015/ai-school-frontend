import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { createQuestion, deleteQuestion, updateQuestion } from '../../api/teacherService';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { PaginationFooter } from '../../components/common/PaginationFooter';
import { SectionCard } from '../../components/common/SectionCard';
import { TagBadge } from '../../components/common/TagBadge';
import { TagSelector } from '../../components/common/TagSelector';
import { useTagsQuery } from '../../hooks/useTagQueries';
import { useSubjectsQuery, useTeacherQuestionsQuery } from '../../hooks/useTeacherQueries';
import type { QuestionResponse } from '../../types/api';
import { IconLabel, appIcons } from '../../utils/appIcons';

const questionSchema = z.object({
  subjectId: z.string().min(1),
  questionText: z.string().min(5),
  topic: z.string().optional(),
  difficulty: z.string().optional(),
  optionA: z.string().min(1),
  optionB: z.string().min(1),
  optionC: z.string().min(1),
  optionD: z.string().min(1),
  correctOption: z.enum(['A', 'B', 'C', 'D']),
});

type QuestionForm = z.infer<typeof questionSchema>;

function questionToForm(question: QuestionResponse): QuestionForm {
  return {
    subjectId: question.subjectId,
    questionText: question.questionText,
    topic: question.topic || '',
    difficulty: question.difficulty || '',
    optionA: question.options[0]?.optionText || '',
    optionB: question.options[1]?.optionText || '',
    optionC: question.options[2]?.optionText || '',
    optionD: question.options[3]?.optionText || '',
    correctOption: (['A', 'B', 'C', 'D'][question.options.findIndex((option) => option.isCorrect)] || 'A') as 'A' | 'B' | 'C' | 'D',
  };
}

function buildOptions(values: QuestionForm) {
  const map = {
    A: values.optionA,
    B: values.optionB,
    C: values.optionC,
    D: values.optionD,
  };

  return Object.entries(map).map(([label, optionText]) => ({
    optionText,
    isCorrect: values.correctOption === label,
  }));
}

const EMPTY_FORM: QuestionForm = {
  subjectId: '',
  questionText: '',
  topic: '',
  difficulty: 'medium',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  correctOption: 'A',
};

export function TeacherQuestionsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [subjectId, setSubjectId] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [debouncedTopic, setDebouncedTopic] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<QuestionResponse | null>(null);
  const [isQuestionFormOpen, setIsQuestionFormOpen] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [initialTagIds, setInitialTagIds] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const subjectsQuery = useSubjectsQuery(1, 100);
  const tagsQuery = useTagsQuery();
  const questionsQuery = useTeacherQuestionsQuery({ subjectId: subjectId || undefined, topic: debouncedTopic || undefined, page, limit });
  const form = useForm<QuestionForm>({
    resolver: zodResolver(questionSchema),
    defaultValues: EMPTY_FORM,
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedTopic(topicInput.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [topicInput]);

  const saveMutation = useMutation({
    mutationFn: async (values: QuestionForm) => {
      const payload: {
        subjectId: string;
        questionText: string;
        topic: string | null;
        difficulty: string | null;
        options: Array<{ optionText: string; isCorrect: boolean }>;
        tagIds?: string[] | null;
      } = {
        subjectId: values.subjectId,
        questionText: values.questionText,
        topic: values.topic || null,
        difficulty: values.difficulty || null,
        options: buildOptions(values),
      };

      const normalizedSelectedTagIds = [...selectedTagIds].sort();
      const normalizedInitialTagIds = [...initialTagIds].sort();
      const tagsChanged = normalizedSelectedTagIds.join(',') !== normalizedInitialTagIds.join(',');

      if (editingQuestion) {
        if (tagsChanged) {
          payload.tagIds = selectedTagIds;
        }
        return updateQuestion(editingQuestion.id, payload);
      }

      payload.tagIds = selectedTagIds.length > 0 ? selectedTagIds : null;
      return createQuestion(payload);
    },
    onSuccess: async () => {
      toast.success(editingQuestion ? 'Question updated.' : 'Question created.');
      setEditingQuestion(null);
      setIsQuestionFormOpen(false);
      setSelectedTagIds([]);
      setInitialTagIds([]);
      form.reset(EMPTY_FORM);
      await queryClient.invalidateQueries({ queryKey: ['teacher', 'questions'] });
    },
    onError: () => toast.error('Unable to save question right now.'),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteQuestion,
    onSuccess: async () => {
      toast.success('Question deleted.');
      await queryClient.invalidateQueries({ queryKey: ['teacher', 'questions'] });
    },
    onError: () => toast.error('Unable to delete question right now.'),
  });

  const isInitialLoading = subjectsQuery.isLoading || tagsQuery.isLoading || (questionsQuery.isLoading && !questionsQuery.data);

  function openCreateQuestionForm() {
    setEditingQuestion(null);
    setSelectedTagIds([]);
    setInitialTagIds([]);
    form.reset(EMPTY_FORM);
    setIsQuestionFormOpen(true);
  }

  function openEditQuestionForm(question: QuestionResponse) {
    setEditingQuestion(question);
    const questionTagIds = question.tags.map((tag) => tag.id);
    setSelectedTagIds(questionTagIds);
    setInitialTagIds(questionTagIds);
    form.reset(questionToForm(question));
    setIsQuestionFormOpen(true);
  }

  function closeQuestionForm() {
    if (saveMutation.isPending) {
      return;
    }

    setIsQuestionFormOpen(false);
    setEditingQuestion(null);
    setSelectedTagIds([]);
    setInitialTagIds([]);
    form.reset(EMPTY_FORM);
  }

  if (isInitialLoading) {
    return <LoadingScreen label="Loading question bank..." />;
  }

  if (subjectsQuery.isError || tagsQuery.isError || questionsQuery.isError || !subjectsQuery.data || !tagsQuery.data || !questionsQuery.data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load the question bank.</div>;
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Question bank" eyebrow="Create, filter, and update questions">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <select
            value={subjectId}
            onChange={(event) => {
              setSubjectId(event.target.value);
              setPage(1);
            }}
            className="rounded-2xl border border-slate-200 px-4 py-3"
          >
            <option value="">All subjects</option>
            {subjectsQuery.data.items.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </select>
          <input
            value={topicInput}
            onChange={(event) => setTopicInput(event.target.value)}
            placeholder="Filter by topic"
            className="rounded-2xl border border-slate-200 px-4 py-3"
          />
          <button
            type="button"
            onClick={openCreateQuestionForm}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <IconLabel label="New question" />
          </button>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-sm text-slate-500">
          <span>{debouncedTopic ? `Showing results for "${debouncedTopic}"` : 'Showing all topics'}</span>
          {questionsQuery.isFetching ? <span className="font-medium text-slate-700">Updating questions...</span> : null}
        </div>
      </SectionCard>

      <SectionCard title="Questions" eyebrow="Library">
        {questionsQuery.data.items.length === 0 ? (
          <EmptyState title="No questions found" description="Adjust your filters or create a question to populate the bank." />
        ) : (
          <div className="space-y-4">
            {questionsQuery.data.items.map((question) => (
              <div key={question.id} className="rounded-3xl border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{question.difficulty || 'unspecified'} {question.topic ? `- ${question.topic}` : ''}</p>
                    <h2 className="mt-3 text-base font-semibold text-slate-900">{question.questionText}</h2>
                    {question.tags.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {question.tags.map((tag) => <TagBadge key={tag.id} tag={tag} compact />)}
                      </div>
                    ) : null}
                    <ol className="mt-4 space-y-2 text-sm text-slate-600">
                      {question.options.map((option, index) => (
                        <li key={`${question.id}-${index}`} className={option.isCorrect ? 'font-semibold text-emerald-700' : ''}>{option.optionText}</li>
                      ))}
                    </ol>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditQuestionForm(question)}
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                    >
                      <IconLabel label="Edit" icon={appIcons.Edit3} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(question.id)}
                      className="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700"
                    >
                      <IconLabel label="Delete" icon={appIcons.Trash2} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <PaginationFooter
          page={page}
          total={questionsQuery.data.total}
          size={questionsQuery.data.size}
          pages={questionsQuery.data.pages}
          limit={limit}
          onLimitChange={(nextLimit) => {
            setLimit(nextLimit);
            setPage(1);
          }}
          onPageChange={setPage}
        />
      </SectionCard>

      {isQuestionFormOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-3xl">
            <SectionCard
              title={editingQuestion ? 'Edit question' : 'Create question'}
              eyebrow="Question form"
              action={(
                <button
                  type="button"
                  onClick={closeQuestionForm}
                  disabled={saveMutation.isPending}
                  className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-60"
                >
                  <IconLabel label="Close" icon={appIcons.ChevronRight} />
                </button>
              )}
            >
              <form className="max-h-[calc(100vh-14rem)] space-y-4 overflow-y-auto pr-2" onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}>
              <select {...form.register('subjectId')} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
                <option value="">Select subject</option>
                {subjectsQuery.data.items.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
              <textarea {...form.register('questionText')} placeholder="Question text" rows={4} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
              <input {...form.register('topic')} placeholder="Topic (optional)" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
              <select {...form.register('difficulty')} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
                <option value="">Select difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <TagSelector
                tags={tagsQuery.data.items}
                selectedIds={selectedTagIds}
                onChange={setSelectedTagIds}
              />
              <input {...form.register('optionA')} placeholder="Option A" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
              <input {...form.register('optionB')} placeholder="Option B" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
              <input {...form.register('optionC')} placeholder="Option C" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
              <input {...form.register('optionD')} placeholder="Option D" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
              <select {...form.register('correctOption')} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
                <option value="A">Correct option: A</option>
                <option value="B">Correct option: B</option>
                <option value="C">Correct option: C</option>
                <option value="D">Correct option: D</option>
              </select>
              <button type="submit" disabled={saveMutation.isPending} className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60">
                <IconLabel label={saveMutation.isPending ? 'Saving...' : editingQuestion ? 'Update question' : 'Create question'} icon={editingQuestion ? appIcons.Save : appIcons.Plus} />
              </button>
              </form>
            </SectionCard>
          </div>
        </div>
      ) : null}
    </div>
  );
}
