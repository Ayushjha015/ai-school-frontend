import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { Difficulty, GeneratedQuestionPreview, QuestionResponse } from '../../types/api';
import { createExam, deleteExam, endExam, generateQuestions, publishExam, saveGeneratedQuestions } from '../../api/teacherService';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { PaginationFooter } from '../../components/common/PaginationFooter';
import { SectionCard } from '../../components/common/SectionCard';
import { StatCard } from '../../components/common/StatCard';
import { TagBadge } from '../../components/common/TagBadge';
import { TopicBarList } from '../../components/common/TopicBarList';
import {
  useExamOverviewQuery,
  useGroupPerformanceQuery,
  useSubjectsQuery,
  useTeacherExamLeaderboardQuery,
  useTeacherExamQuery,
  useTeacherExamsQuery,
  useTeacherGroupsQuery,
  useTeacherQuestionsQuery,
} from '../../hooks/useTeacherQueries';
import { formatDateTime, formatDuration, formatPercentage, formatRelativeWindow } from '../../utils/formatters';
import { localDateTimeToOffsetIso } from '../../utils/localDateTime';
import { getStatusAccent, getStatusTone } from '../../utils/statusStyles';
import { IconLabel, appIcons } from '../../utils/appIcons';

const examFilters = ['all', 'draft', 'published', 'ended'] as const;
const examPageSizeOptions = [10, 20, 50] as const;

function formatExamListLabel(value: string) {
  return value
    .split('_')
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}

export function TeacherExamsPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<(typeof examFilters)[number]>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState<(typeof examPageSizeOptions)[number]>(10);
  const [search, setSearch] = useState('');
  const { data, isLoading, isError } = useTeacherExamsQuery({ status: status === 'all' ? undefined : status, page, limit });
  const searchTerm = search.trim().toLowerCase();
  const visibleExams = useMemo(() => {
    if (!data) {
      return [];
    }

    if (!searchTerm) {
      return data.items;
    }

    return data.items.filter((exam) => {
      return [exam.title, exam.status, exam.approvalStatus]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(searchTerm));
    });
  }, [data, searchTerm]);

  if (isLoading) return <LoadingScreen label="Loading exams..." />;
  if (isError || !data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load your exams.</div>;

  return (
    <div className="space-y-6">
      <SectionCard
        title="Exams"
        eyebrow="Drafts, publishing, and review"
        action={<Link to="/teacher/exams/new" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-slate-50 dark:text-slate-950 dark:hover:bg-white"><IconLabel label="Create exam" /></Link>}
      >
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search by title, status, or approval..."
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-300 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
          />
          <div className="flex rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-950/70">
            {examFilters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setStatus(item);
                  setPage(1);
                }}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${status === item ? 'bg-slate-950 text-white shadow-sm dark:bg-slate-50 dark:text-slate-950' : 'text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-100'}`}
              >
                {formatExamListLabel(item)}
              </button>
            ))}
          </div>
        </div>

        {visibleExams.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title={data.items.length === 0 ? 'No exams found' : 'No matching exams'}
              description={data.items.length === 0 ? 'Create a new exam draft or switch the status filter.' : 'Clear the search or try a different status filter.'}
              actionLabel={data.items.length === 0 ? 'Build exam' : undefined}
              actionTo={data.items.length === 0 ? '/teacher/exams/new' : undefined}
            />
          </div>
        ) : (
          <>
          <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-950/70">
            <div className="overflow-x-auto">
              <table className="min-w-[860px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:bg-slate-900/80 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-4">S.No</th>
                    <th className="px-5 py-4">Title</th>
                    <th className="px-5 py-4">Question count</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Approval status</th>
                    <th className="px-5 py-4">Created at</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {visibleExams.map((exam, index) => (
                    <tr
                      key={exam.id}
                      tabIndex={0}
                      onClick={() => navigate(`/teacher/exams/${exam.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          navigate(`/teacher/exams/${exam.id}`);
                        }
                      }}
                      className="cursor-pointer text-slate-700 transition hover:bg-slate-50 focus:bg-slate-50 focus:outline-none dark:text-slate-300 dark:hover:bg-slate-900/70 dark:focus:bg-slate-900/70"
                    >
                      <td className="px-5 py-4 text-xs font-semibold text-slate-400">{(page - 1) * limit + index + 1}</td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-slate-900 dark:text-slate-100">{exam.title}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatRelativeWindow(exam.startTime, exam.endTime)}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold">{exam.questionCount ?? 0}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getStatusTone(exam.status)}`}>{formatExamListLabel(exam.status)}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getStatusTone(exam.approvalStatus)}`}>{formatExamListLabel(exam.approvalStatus)}</span>
                      </td>
                      <td className="px-5 py-4 text-slate-600 dark:text-slate-400">{formatDateTime(exam.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <PaginationFooter
            page={page}
            total={data.total}
            size={data.size}
            pages={data.pages}
            limit={limit}
            options={examPageSizeOptions}
            onLimitChange={(nextLimit) => {
              setLimit(nextLimit as (typeof examPageSizeOptions)[number]);
              setPage(1);
            }}
            onPageChange={setPage}
          />
          </>
        )}
      </SectionCard>
    </div>
  );
}

type ExamBuilderForm = {
  title: string;
  subjectId: string;
  topic: string;
  timeLimitMinutes?: number;
  startTime: string;
  endTime: string;
};

type ExamAIForm = {
  topic: string;
  difficulty: Difficulty;
  count: number;
  customInstructions?: string;
};

type DateRangeField = 'start' | 'end';

const dateLabelFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const monthLabelFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric',
});

function formatDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function formatDisplayDate(value: string, fallback: string) {
  const date = parseDateInput(value);
  return date ? dateLabelFormatter.format(date) : fallback;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function startOfWeek(date: Date) {
  const day = date.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  return addDays(date, mondayOffset);
}

function getCalendarDays(monthDate: Date) {
  const firstOfMonth = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const leadingDays = (firstOfMonth.getDay() + 6) % 7;
  const start = addDays(firstOfMonth, -leadingDays);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

export function CreateExamPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const subjectsQuery = useSubjectsQuery(1, 100);
  const groupsQuery = useTeacherGroupsQuery(1, 100);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Record<string, number>>({});
  const [questionCatalog, setQuestionCatalog] = useState<Record<string, QuestionResponse>>({});
  const [step, setStep] = useState(1);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [debouncedTopic, setDebouncedTopic] = useState('');
  const [sortByCreatedAt, setSortByCreatedAt] = useState<'desc' | 'asc'>('desc');
  const [questionBankPage, setQuestionBankPage] = useState(1);
  const [questionBankLimit, setQuestionBankLimit] = useState(10);
  const [savedDraftExamId, setSavedDraftExamId] = useState<string | null>(null);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [questionSource, setQuestionSource] = useState<'bank' | 'ai'>('bank');
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestionPreview[]>([]);
  const [selectedGeneratedIndexes, setSelectedGeneratedIndexes] = useState<number[]>([]);
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [activeDateField, setActiveDateField] = useState<DateRangeField>('start');
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const datePickerRef = useRef<HTMLDivElement | null>(null);
  const questionsQuery = useTeacherQuestionsQuery({
    subjectId: subjectFilter || undefined,
    topic: debouncedTopic || undefined,
    sortByCreatedAt,
    page: questionBankPage,
    limit: questionBankLimit,
  });
  const form = useForm<ExamBuilderForm>({ defaultValues: { title: '', subjectId: '', topic: '', timeLimitMinutes: undefined, startTime: '', endTime: '' } });
  const aiForm = useForm<ExamAIForm>({ defaultValues: { topic: '', difficulty: 'medium', count: 5, customInstructions: '' } });
  const titleField = form.register('title', { required: 'Enter an exam title.' });
  const subjectField = form.register('subjectId', { required: 'Select a subject.' });
  const timeLimitField = form.register('timeLimitMinutes', {
    valueAsNumber: true,
    required: 'Enter the exam time limit.',
    validate: (value) => (typeof value === 'number' && Number.isFinite(value) && value > 0 ? true : 'Enter a valid time limit in minutes.'),
  });
  const startTimeField = form.register('startTime', { required: 'Select a start date.' });
  const endTimeField = form.register('endTime', {
    required: 'Select an end date.',
    validate: (value) => {
      if (!value) {
        return 'Select an end date.';
      }

      const startTime = form.getValues('startTime');
      if (!startTime) {
        return true;
      }

      return value >= startTime ? true : 'End date must be the same as or after the start date.';
    },
  });
  const { errors } = form.formState;
  const startDateValue = form.watch('startTime');
  const endDateValue = form.watch('endTime');

  function dateToStartDateTime(date: string) {
    return date ? `${date}T00:00` : '';
  }

  function dateToEndDateTime(date: string) {
    return date ? `${date}T23:59` : '';
  }

  function setDateRange(startDate: string, endDate: string) {
    form.setValue('startTime', startDate, { shouldDirty: true, shouldValidate: true });
    form.setValue('endTime', endDate, { shouldDirty: true, shouldValidate: true });
    const nextMonth = parseDateInput(startDate);
    if (nextMonth) {
      setCalendarMonth(nextMonth);
    }
    setDatePickerOpen(false);
  }

  function handleDateSelect(date: Date) {
    const selectedDate = formatDateInput(date);

    if (activeDateField === 'start') {
      form.setValue('startTime', selectedDate, { shouldDirty: true, shouldValidate: true });
      if (endDateValue && selectedDate > endDateValue) {
        form.setValue('endTime', selectedDate, { shouldDirty: true, shouldValidate: true });
      }
      setActiveDateField('end');
      return;
    }

    form.setValue('endTime', selectedDate, { shouldDirty: true, shouldValidate: true });
    if (startDateValue && selectedDate < startDateValue) {
      form.setValue('startTime', selectedDate, { shouldDirty: true, shouldValidate: true });
    }
    setDatePickerOpen(false);
  }

  function openDatePicker(field: DateRangeField) {
    const date = parseDateInput(field === 'start' ? startDateValue : endDateValue);
    setActiveDateField(field);
    if (date) {
      setCalendarMonth(date);
    }
    setDatePickerOpen(true);
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedTopic(topicInput.trim());
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [topicInput]);

  useEffect(() => {
    if (!datePickerOpen) {
      return;
    }

    function handleOutsideClick(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setDatePickerOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [datePickerOpen]);

  useEffect(() => {
    if (!questionsQuery.data) {
      return;
    }

    setQuestionCatalog((current) => {
      const next = { ...current };
      questionsQuery.data.items.forEach((question) => {
        next[question.id] = question;
      });
      return next;
    });
  }, [questionsQuery.data]);

  const createMutation = useMutation({
    mutationFn: createExam,
    onError: () => toast.error('Unable to create exam draft right now.'),
  });
  const publishMutation = useMutation({
    mutationFn: ({ examId, groupIds }: { examId: string; groupIds: string[] }) => publishExam(examId, groupIds),
    onError: () => toast.error('Unable to publish exam right now.'),
  });
  const generateMutation = useMutation({
    mutationFn: generateQuestions,
    onSuccess: (response) => {
      setGeneratedQuestions(response.questions);
      setSelectedGeneratedIndexes(response.questions.map((_, index) => index));
      toast.success(`Generated ${response.generatedCount} questions.`);
    },
    onError: () => toast.error('Unable to generate questions right now.'),
  });
  const saveGeneratedMutation = useMutation({
    mutationFn: (questions: GeneratedQuestionPreview[]) =>
      saveGeneratedQuestions({
        subjectId: form.getValues('subjectId'),
        questions: questions.map((question) => ({
          questionText: question.questionText,
          topic: question.topic || null,
          difficulty: question.difficulty || null,
          options: question.options,
          tagIds: question.tags.length > 0 ? question.tags.map((tag) => tag.id) : null,
        })),
      }),
    onError: () => toast.error('Unable to save generated questions.'),
  });

  const questionItems = questionsQuery.data?.items ?? [];
  const selectedGeneratedQuestions = useMemo(() => {
    return generatedQuestions.filter((_, index) => selectedGeneratedIndexes.includes(index));
  }, [generatedQuestions, selectedGeneratedIndexes]);
  const areAllGeneratedQuestionsSelected = generatedQuestions.length > 0 && selectedGeneratedIndexes.length === generatedQuestions.length;
  const selectedSubject = subjectsQuery.data?.items.find((subject) => subject.id === form.getValues('subjectId'));

  const visibleQuestions = useMemo(() => {
    return [...questionItems].sort((left, right) => {
      const leftTime = Date.parse(left.createdAt);
      const rightTime = Date.parse(right.createdAt);
      const fallback = 0;
      const delta = (Number.isFinite(leftTime) ? leftTime : fallback) - (Number.isFinite(rightTime) ? rightTime : fallback);
      return sortByCreatedAt === 'desc' ? -delta : delta;
    });
  }, [questionItems, sortByCreatedAt]);

  const selectedQuestions = useMemo(() => {
    return Object.keys(selectedQuestionIds)
      .map((questionId) => questionCatalog[questionId])
      .filter(Boolean);
  }, [questionCatalog, selectedQuestionIds]);
  const publishGroups = groupsQuery.data?.items ?? [];
  const calendarDays = useMemo(() => getCalendarDays(calendarMonth), [calendarMonth]);
  const todayInput = formatDateInput(new Date());
  const quickDateRanges = useMemo(() => {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    const thisWeekStart = startOfWeek(today);
    const nextWeekStart = addDays(thisWeekStart, 7);

    return [
      { label: 'Today', detail: dateLabelFormatter.format(today), start: today, end: today },
      { label: 'Tomorrow', detail: dateLabelFormatter.format(tomorrow), start: tomorrow, end: tomorrow },
      { label: 'This week', detail: dateLabelFormatter.format(addDays(thisWeekStart, 6)), start: today, end: addDays(thisWeekStart, 6) },
      { label: 'Next week', detail: dateLabelFormatter.format(addDays(nextWeekStart, 6)), start: nextWeekStart, end: addDays(nextWeekStart, 6) },
      { label: '2 weeks', detail: dateLabelFormatter.format(addDays(today, 13)), start: today, end: addDays(today, 13) },
      { label: '4 weeks', detail: dateLabelFormatter.format(addDays(today, 27)), start: today, end: addDays(today, 27) },
    ];
  }, []);

  if (subjectsQuery.isLoading || questionsQuery.isLoading || (step === 3 && groupsQuery.isLoading)) return <LoadingScreen label="Loading exam builder..." />;
  if (subjectsQuery.isError || questionsQuery.isError || !subjectsQuery.data || !questionsQuery.data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load the exam builder.</div>;
  if (step === 3 && (groupsQuery.isError || !groupsQuery.data)) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load your classes for publishing.</div>;

  async function ensureDraftExists() {
    if (savedDraftExamId) {
      return savedDraftExamId;
    }

    const startTime = form.getValues('startTime');
    const endTime = form.getValues('endTime');
    const formattedStartTime = startTime ? localDateTimeToOffsetIso(dateToStartDateTime(startTime)) : null;
    const formattedEndTime = endTime ? localDateTimeToOffsetIso(dateToEndDateTime(endTime)) : null;

    if (startTime && !formattedStartTime) {
      toast.error('Please choose a valid start date.');
      return null;
    }

    if (endTime && !formattedEndTime) {
      toast.error('Please choose a valid end date.');
      return null;
    }

    const exam = await createMutation.mutateAsync({
      title: form.getValues('title'),
      subjectId: form.getValues('subjectId'),
      topic: form.getValues('topic') || null,
      timeLimitMinutes: Number(form.getValues('timeLimitMinutes')) || null,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      questions: Object.entries(selectedQuestionIds).map(([questionId, marks]) => ({ questionId, marks })),
    });
    setSavedDraftExamId(exam.id);
    await queryClient.invalidateQueries({ queryKey: ['teacher', 'exams'] });
    return exam.id;
  }

  async function handleSaveAndBack() {
    const examId = await ensureDraftExists();
    if (!examId) {
      return;
    }

    toast.success('Exam saved.');
    navigate('/teacher/exams');
  }

  async function handlePublishExam() {
    const examId = await ensureDraftExists();
    if (!examId || selectedGroupIds.length === 0) {
      return;
    }

    await publishMutation.mutateAsync({ examId, groupIds: selectedGroupIds });
    toast.success('Exam published successfully.');
    await queryClient.invalidateQueries({ queryKey: ['teacher', 'exam', examId] });
    await queryClient.invalidateQueries({ queryKey: ['teacher', 'exams'] });
    navigate(`/teacher/exams/${examId}`);
  }

  async function handleUseGeneratedQuestions() {
    if (selectedGeneratedQuestions.length === 0) {
      toast.error('Select at least one generated question to use.');
      return false;
    }

    const saved = await saveGeneratedMutation.mutateAsync(selectedGeneratedQuestions);
    const now = new Date().toISOString();
    const subjectId = form.getValues('subjectId');

    setQuestionCatalog((current) => {
      const next = { ...current };
      selectedGeneratedQuestions.forEach((question, index) => {
        const questionId = saved.questionIds[index];
        if (!questionId) {
          return;
        }

        next[questionId] = {
          id: questionId,
          subjectId,
          createdBy: '',
          questionText: question.questionText,
          topic: question.topic || null,
          difficulty: question.difficulty || null,
          options: question.options,
          tags: question.tags,
          createdAt: now,
        };
      });
      return next;
    });

    setSelectedQuestionIds((current) => {
      const next = { ...current };
      saved.questionIds.forEach((questionId) => {
        if (questionId) {
          next[questionId] = next[questionId] ?? 1;
        }
      });
      return next;
    });

    setGeneratedQuestions([]);
    setSelectedGeneratedIndexes([]);
    await queryClient.invalidateQueries({ queryKey: ['teacher', 'questions'] });
    toast.success(`Added ${saved.savedCount} AI question${saved.savedCount === 1 ? '' : 's'} to this exam.`);
    return true;
  }

  function handleGeneratedSelectionToggle() {
    setSelectedGeneratedIndexes(areAllGeneratedQuestionsSelected ? [] : generatedQuestions.map((_, index) => index));
  }

  async function handleSaveAndProceed() {
    if (questionSource === 'ai') {
      if (selectedGeneratedQuestions.length > 0) {
        const saved = await handleUseGeneratedQuestions();
        if (saved) {
          setStep(3);
        }
        return;
      }

      if (selectedQuestions.length > 0) {
        setStep(3);
        return;
      }

      toast.error('Select at least one generated question to save and proceed.');
      return;
    }

    if (selectedQuestions.length > 0) {
      setStep(3);
      return;
    }

    toast.error('Select at least one question to save and proceed.');
  }

  function handleStepChange(nextStep: number) {
    if (savedDraftExamId) {
      if (nextStep === 3 || nextStep === 4) {
        setStep(nextStep);
      }
      return;
    }

    setStep(nextStep);
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Create exam" eyebrow={`Step ${step} of 4`}>
        <div className="flex flex-wrap gap-3">{[1, 2, 3, 4].map((item) => <button key={item} type="button" onClick={() => handleStepChange(item)} disabled={savedDraftExamId ? item < 3 : item === 4} className={`rounded-full px-4 py-2 text-sm font-semibold ${step === item ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700'} disabled:cursor-not-allowed disabled:opacity-60`}>Step {item}</button>)}</div>
      </SectionCard>
      {step === 1 ? (
        <SectionCard title="Exam details" eyebrow="Configuration">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(() => {
            aiForm.setValue('topic', form.getValues('topic'));
            setStep(2);
          }, () => toast.error('Please complete the required exam details before continuing.'))}>
            <label className="space-y-2">
              <input
                {...titleField}
                placeholder="Exam title"
                className={`w-full rounded-2xl border px-4 py-3 ${errors.title ? 'border-rose-300' : 'border-slate-200'}`}
              />
              {errors.title ? <span className="text-sm text-rose-600">{errors.title.message}</span> : null}
            </label>
            <label className="space-y-2">
              <select
                {...subjectField}
                onChange={(event) => {
                  subjectField.onChange(event);
                  setSubjectFilter(event.target.value);
                  setQuestionBankPage(1);
                }}
                className={`w-full rounded-2xl border px-4 py-3 ${errors.subjectId ? 'border-rose-300' : 'border-slate-200'}`}
              >
                <option value="">Select subject</option>
                {subjectsQuery.data.items.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
              {errors.subjectId ? <span className="text-sm text-rose-600">{errors.subjectId.message}</span> : null}
            </label>
            <input {...form.register('topic')} placeholder="Topic (optional)" className="rounded-2xl border border-slate-200 px-4 py-3" />
            <label className="space-y-2">
              <input
                type="number"
                {...timeLimitField}
                min={1}
                placeholder="Enter exam time limit (minutes)"
                className={`w-full rounded-2xl border px-4 py-3 ${errors.timeLimitMinutes ? 'border-rose-300' : 'border-slate-200'}`}
              />
              {errors.timeLimitMinutes ? <span className="text-sm text-rose-600">{errors.timeLimitMinutes.message}</span> : null}
            </label>
            <div ref={datePickerRef} className="relative md:col-span-2">
              <input type="hidden" {...startTimeField} />
              <input type="hidden" {...endTimeField} />
              <div className="mb-2 flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Exam date window</span>
                <span className="h-px flex-1 bg-slate-200/80 dark:bg-slate-700/80" />
              </div>
              <div className="grid gap-2 md:grid-cols-2">
                <button
                  type="button"
                  onClick={() => openDatePicker('start')}
                  className={`rounded-2xl border px-4 py-2.5 text-left transition ${
                    errors.startTime
                      ? 'border-rose-300'
                      : activeDateField === 'start' && datePickerOpen
                        ? 'border-emerald-400 bg-slate-950 text-white shadow-lg shadow-emerald-500/10 dark:bg-slate-900'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-emerald-400'
                  }`}
                >
                  <span className={`block text-[11px] font-semibold uppercase tracking-[0.16em] ${activeDateField === 'start' && datePickerOpen ? 'text-emerald-200' : 'text-slate-400'}`}>Start date</span>
                  <span className="mt-0.5 block text-sm font-semibold">{formatDisplayDate(startDateValue, 'Select start date')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => openDatePicker('end')}
                  className={`rounded-2xl border px-4 py-2.5 text-left transition ${
                    errors.endTime
                      ? 'border-rose-300'
                      : activeDateField === 'end' && datePickerOpen
                        ? 'border-emerald-400 bg-slate-950 text-white shadow-lg shadow-emerald-500/10 dark:bg-slate-900'
                        : 'border-slate-200 bg-white text-slate-800 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-emerald-400'
                  }`}
                >
                  <span className={`block text-[11px] font-semibold uppercase tracking-[0.16em] ${activeDateField === 'end' && datePickerOpen ? 'text-emerald-200' : 'text-slate-400'}`}>End date</span>
                  <span className="mt-0.5 block text-sm font-semibold">{formatDisplayDate(endDateValue, 'Select end date')}</span>
                </button>
              </div>
              {errors.startTime ? <span className="text-sm text-rose-600">{errors.startTime.message}</span> : null}
              {errors.endTime ? <span className="text-sm text-rose-600">{errors.endTime.message}</span> : null}
              {datePickerOpen ? (
                <div className="absolute bottom-full left-0 z-50 mb-2 w-full max-w-[760px] overflow-hidden rounded-2xl border border-slate-200 bg-white opacity-100 shadow-2xl shadow-slate-900/20 dark:border-slate-700 dark:bg-[#0b1220] dark:shadow-black/40">
                  <div className="grid max-h-[min(70vh,520px)] overflow-auto md:grid-cols-[200px_minmax(0,1fr)]">
                    <div className="border-b border-slate-200 bg-slate-50 p-2 md:border-b-0 md:border-r dark:border-slate-700 dark:bg-[#111827]">
                      <div className="mb-1.5 flex items-center justify-between rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-700 dark:bg-[#0b1220] dark:text-slate-200">
                        <span>{activeDateField === 'start' ? 'Picking start' : 'Picking end'}</span>
                        <button type="button" onClick={() => setDatePickerOpen(false)} className="rounded-full px-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-100" aria-label="Close date picker">x</button>
                      </div>
                      <div className="space-y-0.5">
                        {quickDateRanges.map((range) => (
                          <button
                            key={range.label}
                            type="button"
                            onClick={() => setDateRange(formatDateInput(range.start), formatDateInput(range.end))}
                            className="grid w-full grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-white hover:shadow-sm dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            <span className="font-medium">{range.label}</span>
                            <span className="text-xs text-slate-400 dark:text-slate-500">{range.detail}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="min-w-0 p-3">
                      <div className="mb-3 flex items-center justify-between">
                        <button type="button" onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900" aria-label="Previous month">{'<'}</button>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{monthLabelFormatter.format(calendarMonth)}</p>
                          <button type="button" onClick={() => setCalendarMonth(new Date())} className="mt-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">Today</button>
                        </div>
                        <button type="button" onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} className="rounded-full border border-slate-200 px-3 py-1 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900" aria-label="Next month">{'>'}</button>
                      </div>
                      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => <span key={day}>{day}</span>)}
                      </div>
                      <div className="mt-2 grid grid-cols-7 gap-1">
                        {calendarDays.map((day) => {
                          const dateValue = formatDateInput(day);
                          const isOutsideMonth = day.getMonth() !== calendarMonth.getMonth();
                          const isStart = dateValue === startDateValue;
                          const isEnd = dateValue === endDateValue;
                          const isInRange = Boolean(startDateValue && endDateValue && dateValue > startDateValue && dateValue < endDateValue);
                          const isToday = dateValue === todayInput;
                          return (
                            <button
                              key={dateValue}
                              type="button"
                              onClick={() => handleDateSelect(day)}
                              className={`h-9 rounded-lg text-sm font-semibold transition ${
                                isStart || isEnd
                                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                  : isInRange
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200'
                                    : isToday
                                      ? 'border border-emerald-300 text-emerald-700 dark:border-emerald-500/70 dark:text-emerald-300'
                                      : isOutsideMonth
                                        ? 'text-slate-300 hover:bg-slate-50 dark:text-slate-700 dark:hover:bg-slate-900'
                                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900'
                              }`}
                            >
                              {day.getDate()}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <button type="submit" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 lg:col-span-2"><IconLabel label="Continue to question selection" icon={appIcons.ChevronRight} /></button>
          </form>
        </SectionCard>
      ) : null}
      {step === 2 ? (
        <SectionCard title="Select questions" eyebrow={questionSource === 'bank' ? 'Question bank' : 'AI generate'}>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex rounded-full bg-slate-100 p-1">
              {(['bank', 'ai'] as const).map((source) => (
                <button
                  key={source}
                  type="button"
                  onClick={() => setQuestionSource(source)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${questionSource === source ? 'bg-slate-950 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {source === 'bank' ? 'Question Bank' : 'AI Generate'}
                </button>
              ))}
            </div>
            <span className="text-sm text-slate-600">{selectedQuestions.length} question{selectedQuestions.length === 1 ? '' : 's'} selected</span>
          </div>

          {questionSource === 'bank' ? (
            <>
              <div className="mb-5 space-y-4">
                <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
                  <input
                    value={topicInput}
                    onChange={(event) => {
                      setTopicInput(event.target.value);
                      setQuestionBankPage(1);
                    }}
                    placeholder="Filter questions by topic"
                    className="rounded-2xl border border-slate-200 px-4 py-3"
                  />
                  <select
                    value={sortByCreatedAt}
                    onChange={(event) => {
                      setSortByCreatedAt(event.target.value as 'desc' | 'asc');
                      setQuestionBankPage(1);
                    }}
                    className="rounded-2xl border border-slate-200 px-4 py-3"
                  >
                    <option value="desc">Newest first</option>
                    <option value="asc">Oldest first</option>
                  </select>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 pt-2 text-sm text-slate-600 dark:text-slate-400">
                  <span className="min-w-0 font-medium">{debouncedTopic ? `Showing topics matching "${debouncedTopic}"` : 'Showing all topics'}</span>
                  <span className="shrink-0 font-medium">
                    Page {questionsQuery.data.page} of {questionsQuery.data.pages || 1}
                  </span>
                </div>
              </div>
              {visibleQuestions.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-8 text-center shadow-sm">
                  <h3 className="text-lg font-semibold text-slate-900">No questions available</h3>
                  <p className="mt-2 text-sm text-slate-600">Adjust the topic filter or generate AI questions for this exam.</p>
                  <button type="button" onClick={() => setQuestionSource('ai')} className="mt-5 inline-flex rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700">
                    <IconLabel label="Generate with AI" icon={appIcons.Sparkles} />
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {visibleQuestions.map((question, index) => {
                    const isSelected = Boolean(selectedQuestionIds[question.id]);
                    const questionNumber = (questionBankPage - 1) * questionsQuery.data.size + index + 1;
                    return (
                      <div key={question.id} className={`rounded-[22px] border bg-white p-5 transition ${isSelected ? 'border-emerald-400 shadow-[0_0_0_1px_rgba(52,211,153,0.18)]' : 'border-slate-200'}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 flex-1 gap-4">
                            <div className="mt-9 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-base font-bold text-violet-600">
                              {questionNumber}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-500">
                                {question.difficulty || 'generated'}{question.topic ? ` - ${question.topic}` : ''}
                              </p>
                              <h2 className="mt-4 text-base font-bold leading-6 text-slate-950">{question.questionText}</h2>
                              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-violet-500">{question.tags.length > 0 ? 'Tagged question' : 'Question bank'}</p>
                              <ol className="mt-4 space-y-3 text-sm text-slate-500">
                                {question.options.map((option, optionIndex) => (
                                  <li
                                    key={`${question.id}-${optionIndex}`}
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
                              {question.tags.length > 0 ? (
                                <div className="mt-4 flex flex-wrap gap-2">
                                  {question.tags.map((tag) => <TagBadge key={tag.id} tag={tag} compact />)}
                                </div>
                              ) : null}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-3">
                            <input
                              type="number"
                              min={0}
                              value={selectedQuestionIds[question.id] ?? 1}
                              onChange={(event) => {
                                const nextValue = Number(event.target.value);
                                setSelectedQuestionIds((current) => ({
                                  ...current,
                                  [question.id]: Number.isFinite(nextValue) ? Math.max(0, nextValue) : 0,
                                }));
                              }}
                              className="w-20 rounded-2xl border border-slate-200 px-3 py-2 text-slate-950"
                              disabled={!isSelected}
                            />
                            <button type="button" onClick={() => setSelectedQuestionIds((current) => { const next = { ...current }; if (next[question.id]) { delete next[question.id]; } else { next[question.id] = 1; } return next; })} className={`rounded-full px-4 py-2 text-sm font-semibold ${isSelected ? 'bg-slate-950 text-white' : 'border border-slate-300 text-slate-700'}`}>{isSelected ? 'Selected' : 'Add'}</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <PaginationFooter
                page={questionBankPage}
                total={questionsQuery.data.total}
                size={questionsQuery.data.size}
                pages={questionsQuery.data.pages}
                limit={questionBankLimit}
                options={examPageSizeOptions}
                onLimitChange={(nextLimit) => {
                  setQuestionBankLimit(nextLimit);
                  setQuestionBankPage(1);
                }}
                onPageChange={setQuestionBankPage}
              />
            </>
          ) : (
            <div className="space-y-5">
              <form
                className="grid gap-4 lg:grid-cols-2"
                onSubmit={aiForm.handleSubmit((values) => generateMutation.mutate({
                  subjectId: form.getValues('subjectId'),
                  topic: values.topic,
                  difficulty: values.difficulty,
                  count: Number(values.count),
                  customInstructions: values.customInstructions || null,
                }))}
              >
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Subject: <span className="font-semibold text-slate-900">{selectedSubject?.name ?? 'Selected exam subject'}</span>
                </div>
                <input {...aiForm.register('topic')} placeholder="Topic for generated questions" className="rounded-2xl border border-slate-200 px-4 py-3" />
                <select {...aiForm.register('difficulty')} className="rounded-2xl border border-slate-200 px-4 py-3">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <input type="number" min={1} max={20} {...aiForm.register('count', { valueAsNumber: true })} className="rounded-2xl border border-slate-200 px-4 py-3" />
                <textarea {...aiForm.register('customInstructions')} placeholder="Manual instructions for the generator" rows={4} className="rounded-2xl border border-slate-200 px-4 py-3 lg:col-span-2" />
                <button type="submit" disabled={generateMutation.isPending} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60 lg:col-span-2"><IconLabel label={generateMutation.isPending ? 'Generating...' : 'Generate preview'} icon={appIcons.Sparkles} /></button>
              </form>

              {generatedQuestions.length === 0 ? (
                <EmptyState title="No AI preview yet" description="Generate questions here, then use the selected ones in this exam." />
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-600">{selectedGeneratedQuestions.length} generated question{selectedGeneratedQuestions.length === 1 ? '' : 's'} selected</p>
                    <button
                      type="button"
                      onClick={handleGeneratedSelectionToggle}
                      className={`rounded-full px-5 py-3 text-sm font-semibold text-white transition ${areAllGeneratedQuestionsSelected ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                    >
                      <IconLabel label={areAllGeneratedQuestionsSelected ? 'Deselect all' : 'Select all'} icon={areAllGeneratedQuestionsSelected ? appIcons.Trash2 : appIcons.CheckCircle2} />
                    </button>
                  </div>
                  {generatedQuestions.map((question, index) => {
                    const selected = selectedGeneratedIndexes.includes(index);
                    return (
                      <div key={`${question.questionText}-${index}`} className={`rounded-[22px] border bg-white p-5 transition ${selected ? 'border-emerald-400 shadow-[0_0_0_1px_rgba(52,211,153,0.18)]' : 'border-slate-200'}`}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex min-w-0 flex-1 gap-4">
                            <div className="mt-9 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-base font-bold text-violet-600">
                              {index + 1}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-500">
                                {question.difficulty || 'generated'}{question.topic ? ` - ${question.topic}` : ''}
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
                            onChange={() => setSelectedGeneratedIndexes((current) => selected ? current.filter((item) => item !== index) : [...current, index])}
                            className="mt-1 h-5 w-5 accent-emerald-500"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between"><button type="button" onClick={() => setStep(1)} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"><IconLabel label="Back" icon={appIcons.ChevronRight} className="[&>svg]:rotate-180" /></button><button type="button" onClick={handleSaveAndProceed} disabled={saveGeneratedMutation.isPending} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"><IconLabel label={saveGeneratedMutation.isPending ? 'Saving...' : 'Save and proceed'} icon={appIcons.Save} /></button></div>
        </SectionCard>
      ) : null}
      {step === 3 ? (
        <SectionCard title="Choose classes" eyebrow="Step 3">
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Select at least one class for this exam</label>
              <select
                value=""
                onChange={(event) => {
                  const groupId = event.target.value;
                  if (!groupId) {
                    return;
                  }
                  setSelectedGroupIds((current) => (current.includes(groupId) ? current : [...current, groupId]));
                }}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"
              >
                <option value="">Select class</option>
                {publishGroups.map((group) => <option key={group.id} value={group.id}>{group.name}</option>)}
              </select>
            </div>
            {selectedGroupIds.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedGroupIds.map((groupId) => {
                  const group = publishGroups.find((item) => item.id === groupId);
                  return (
                    <button
                      key={groupId}
                      type="button"
                      onClick={() => setSelectedGroupIds((current) => current.filter((item) => item !== groupId))}
                      className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-200"
                    >
                      {group?.name ?? 'Selected class'} ×
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-3 text-sm text-slate-500">No classes selected yet.</p>
            )}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => setStep(2)} disabled={createMutation.isPending || publishMutation.isPending} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 disabled:opacity-60"><IconLabel label="Back" icon={appIcons.ChevronRight} className="[&>svg]:rotate-180" /></button>
              <button type="button" onClick={() => setStep(4)} disabled={selectedGroupIds.length === 0 || createMutation.isPending || publishMutation.isPending} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"><IconLabel label="Proceed to overview" icon={appIcons.ChevronRight} /></button>
            </div>
          </div>
        </SectionCard>
      ) : null}
      {step === 4 ? (
        <SectionCard title="Review and publish" eyebrow="Draft creation">
          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-600">Title</p><p className="mt-2 text-lg font-semibold text-slate-900">{form.getValues('title')}</p><p className="mt-4 text-sm text-slate-600">Selected questions: {selectedQuestions.length}</p><p className="mt-2 text-sm text-slate-600">Selected classes: {selectedGroupIds.map((groupId) => publishGroups.find((group) => group.id === groupId)?.name).filter(Boolean).join(', ') || 'None'}</p></div>
            <div className="space-y-3">{selectedQuestions.map((question) => <div key={question.id} className="rounded-3xl border border-slate-200 bg-white p-4"><p className="text-sm font-semibold text-slate-900">{question.questionText}</p><p className="mt-1 text-sm text-slate-600">Marks: {selectedQuestionIds[question.id]}</p></div>)}</div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => setStep(3)} disabled={createMutation.isPending || publishMutation.isPending} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 disabled:opacity-60"><IconLabel label="Back" icon={appIcons.ChevronRight} className="[&>svg]:rotate-180" /></button>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button type="button" onClick={handleSaveAndBack} disabled={createMutation.isPending || publishMutation.isPending || selectedQuestions.length === 0} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:opacity-60"><IconLabel label={createMutation.isPending ? 'Saving...' : 'Save and back'} icon={appIcons.Save} /></button>
                <button type="button" onClick={handlePublishExam} disabled={createMutation.isPending || publishMutation.isPending || selectedQuestions.length === 0 || selectedGroupIds.length === 0} className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60"><IconLabel label={createMutation.isPending ? 'Saving draft...' : publishMutation.isPending ? 'Publishing...' : 'Publish exam'} icon={appIcons.Send} /></button>
              </div>
            </div>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
}

export function TeacherExamDetailPage() {
  const { examId = '' } = useParams();
  const queryClient = useQueryClient();
  const examQuery = useTeacherExamQuery(examId);
  const groupsQuery = useTeacherGroupsQuery(1, 100);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const publishMutation = useMutation({ mutationFn: () => publishExam(examId, selectedGroupIds), onSuccess: async () => { toast.success('Exam published successfully.'); await queryClient.invalidateQueries({ queryKey: ['teacher', 'exam', examId] }); await queryClient.invalidateQueries({ queryKey: ['teacher', 'exams'] }); }, onError: () => toast.error('Unable to publish exam right now.') });
  const endMutation = useMutation({ mutationFn: () => endExam(examId), onSuccess: async () => { toast.success('Exam ended.'); await queryClient.invalidateQueries({ queryKey: ['teacher', 'exam', examId] }); await queryClient.invalidateQueries({ queryKey: ['teacher', 'exams'] }); }, onError: () => toast.error('Unable to end exam right now.') });
  const deleteMutation = useMutation({ mutationFn: () => deleteExam(examId), onSuccess: async () => { toast.success('Draft exam deleted.'); await queryClient.invalidateQueries({ queryKey: ['teacher', 'exams'] }); }, onError: () => toast.error('Unable to delete exam right now.') });
  if (examQuery.isLoading || groupsQuery.isLoading) return <LoadingScreen label="Loading exam detail..." />;
  if (examQuery.isError || groupsQuery.isError || !examQuery.data || !groupsQuery.data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load this exam detail page.</div>;
  const exam = examQuery.data;
  return <div className="space-y-6"><SectionCard title={exam.title} eyebrow="Exam detail" action={<Link to={`/teacher/exams/${exam.id}/analytics`} className="text-sm font-semibold text-slate-700 hover:text-slate-950">View analytics</Link>}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><StatCard label="Status" value={exam.status} helper="Current exam lifecycle stage." accent={getStatusAccent(exam.status)} /><StatCard label="Approval" value={exam.approvalStatus} helper="Backend approval status." accent={getStatusAccent(exam.approvalStatus)} /><StatCard label="Questions" value={exam.questions.length} helper="Questions included in this exam." accent="amber" /><StatCard label="Window" value={formatRelativeWindow(exam.startTime, exam.endTime)} helper="Configured exam availability." accent="slate" /></div></SectionCard><div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"><SectionCard title="Question review" eyebrow="Exam content"><div className="space-y-4">{exam.questions.map((question, index) => <div key={question.id} className="rounded-3xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-900">Question {index + 1}</p><p className="text-sm text-slate-600">{question.marks} marks</p></div><p className="mt-3 text-sm text-slate-700">{question.questionText}</p></div>)}</div></SectionCard><SectionCard title="Actions" eyebrow="Publish / end / cleanup">{exam.status === 'draft' ? <div className="space-y-4"><div><p className="mb-2 text-sm font-medium text-slate-700">Assign classes before publishing</p><div className="space-y-2">{groupsQuery.data.items.map((group) => { const checked = selectedGroupIds.includes(group.id); return <label key={group.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"><input type="checkbox" checked={checked} onChange={() => setSelectedGroupIds((current) => checked ? current.filter((id) => id !== group.id) : [...current, group.id])} />{group.name}</label>; })}</div></div><button type="button" onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending || selectedGroupIds.length === 0} className="w-full rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{publishMutation.isPending ? 'Publishing...' : 'Publish exam'}</button><button type="button" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} className="w-full rounded-full border border-rose-300 px-5 py-3 text-sm font-semibold text-rose-700 disabled:opacity-60">{deleteMutation.isPending ? 'Deleting...' : 'Delete draft'}</button></div> : null}{exam.status === 'published' ? <button type="button" onClick={() => endMutation.mutate()} disabled={endMutation.isPending} className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{endMutation.isPending ? 'Ending...' : 'End exam'}</button> : null}{exam.status === 'ended' ? <p className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600">This exam has ended. Use the analytics page to inspect results and leaderboard performance.</p> : null}</SectionCard></div></div>;
}

export function TeacherExamAnalyticsPage() {
  const { examId = '' } = useParams();
  const overviewQuery = useExamOverviewQuery(examId);
  const leaderboardQuery = useTeacherExamLeaderboardQuery(examId);
  if (overviewQuery.isLoading || leaderboardQuery.isLoading) return <LoadingScreen label="Loading exam analytics..." />;
  if (overviewQuery.isError || leaderboardQuery.isError || !overviewQuery.data || !leaderboardQuery.data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load exam analytics.</div>;
  const overview = overviewQuery.data;
  const leaderboard = leaderboardQuery.data;
  return <div className="space-y-6"><SectionCard title={overview.examTitle} eyebrow="Exam analytics"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><StatCard label="Assigned" value={overview.totalAssigned} helper="Students assigned to the exam." accent="emerald" /><StatCard label="Attempted" value={overview.totalAttempted} helper="Students who submitted." accent="blue" /><StatCard label="Missed" value={overview.totalMissed} helper="Assigned but not attempted." accent="rose" /><StatCard label="Pass rate" value={formatPercentage(overview.passRate)} helper="Overall passing percentage." accent="emerald" /></div></SectionCard><div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]"><SectionCard title="Topic breakdown" eyebrow="Accuracy by topic"><TopicBarList title="Topics" items={overview.topicBreakdown} emptyLabel="No topic analytics available for this exam yet." /></SectionCard><SectionCard title="Leaderboard" eyebrow="Ranked attempts"><div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white"><table className="min-w-[720px] divide-y divide-slate-200 text-left text-sm text-slate-700"><thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-500"><tr><th className="px-4 py-4">Rank</th><th className="px-4 py-4">Student</th><th className="px-4 py-4">Score</th><th className="px-4 py-4">Percentage</th><th className="px-4 py-4">Time</th><th className="px-4 py-4">Tab switches</th></tr></thead><tbody className="divide-y divide-slate-100">{leaderboard.entries.map((entry) => <tr key={`${entry.studentId}-${entry.rank}`}><td className="px-4 py-4 font-semibold text-slate-900">#{entry.rank}</td><td className="px-4 py-4">{entry.studentName}</td><td className="px-4 py-4">{entry.score}</td><td className="px-4 py-4">{formatPercentage(entry.percentage)}</td><td className="px-4 py-4">{formatDuration(entry.timeTakenSeconds)}</td><td className="px-4 py-4">{entry.tabSwitchCount}</td></tr>)}</tbody></table></div></SectionCard></div></div>;
}

export function TeacherGroupAnalyticsPage() {
  const { groupId = '' } = useParams();
  const { data, isLoading, isError } = useGroupPerformanceQuery(groupId);
  if (isLoading) return <LoadingScreen label="Loading class analytics..." />;
  if (isError || !data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load class performance analytics.</div>;
  return <div className="space-y-6"><SectionCard title={data.groupName} eyebrow="Class performance"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><StatCard label="At-risk threshold" value={data.atRiskThreshold} helper="Configured threshold for flagging students." accent="amber" /><StatCard label="Trend points" value={data.examTrend.length} helper="Exam performance snapshots in this class." accent="blue" /><StatCard label="At-risk students" value={data.atRiskStudents.length} helper="Students currently below threshold." accent="rose" /></div></SectionCard><div className="grid gap-6 xl:grid-cols-2"><SectionCard title="Weakest topics" eyebrow="Learning gaps"><TopicBarList title="Weakest topics" items={data.weakestTopics} emptyLabel="No weakest-topic data available yet." /></SectionCard><SectionCard title="At-risk students" eyebrow="Needs attention">{data.atRiskStudents.length === 0 ? <EmptyState title="No at-risk students" description="This class is currently above the configured threshold." /> : <div className="space-y-3">{data.atRiskStudents.map((student) => <div key={student.studentId} className="rounded-3xl border border-slate-200 bg-white p-4"><p className="text-base font-semibold text-slate-900">{student.studentName}</p><p className="mt-1 text-sm text-slate-600">Average percentage: {formatPercentage(student.avgPercentage)}</p></div>)}</div>}</SectionCard></div></div>;
}
