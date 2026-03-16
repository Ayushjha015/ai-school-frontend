import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import type { QuestionResponse } from '../../types/api';
import { createExam, deleteExam, endExam, publishExam } from '../../api/teacherService';
import { EmptyState } from '../../components/common/EmptyState';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { SectionCard } from '../../components/common/SectionCard';
import { StatCard } from '../../components/common/StatCard';
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
import { formatDuration, formatPercentage, formatRelativeWindow } from '../../utils/formatters';
import { localDateTimeToUtcIso } from '../../utils/localDateTime';
import { getStatusAccent, getStatusTone } from '../../utils/statusStyles';

const examFilters = ['all', 'draft', 'published', 'ended'] as const;

export function TeacherExamsPage() {
  const [status, setStatus] = useState<(typeof examFilters)[number]>('all');
  const { data, isLoading, isError } = useTeacherExamsQuery({ status: status === 'all' ? undefined : status, page: 1, limit: 50 });

  if (isLoading) return <LoadingScreen label="Loading exams..." />;
  if (isError || !data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load your exams.</div>;

  return (
    <div className="space-y-6">
      <SectionCard title="Exams" eyebrow="Drafts, publishing, and review" action={<Link to="/teacher/exams/new" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">Create exam</Link>}>
        <div className="flex flex-wrap gap-3">
          {examFilters.map((item) => (
            <button key={item} type="button" onClick={() => setStatus(item)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${status === item ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700'}`}>
              {item}
            </button>
          ))}
        </div>
      </SectionCard>
      {data.items.length === 0 ? (
        <EmptyState title="No exams found" description="Create a new exam draft or switch the status filter." actionLabel="Build exam" actionTo="/teacher/exams/new" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {data.items.map((exam) => (
            <Link key={exam.id} to={`/teacher/exams/${exam.id}`} className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg">
              <div className="flex items-center justify-between gap-3">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getStatusTone(exam.status)}`}>{exam.status}</span>
                <span className="text-xs font-medium text-slate-500">{exam.questionCount ?? 0} questions</span>
              </div>
              <h2 className="mt-4 text-lg font-semibold text-slate-900">{exam.title}</h2>
              <p className="mt-2 text-sm text-slate-600">{formatRelativeWindow(exam.startTime, exam.endTime)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

type ExamBuilderForm = {
  title: string;
  subjectId: string;
  topic: string;
  timeLimitMinutes: number;
  startTime: string;
  endTime: string;
};

export function CreateExamPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const subjectsQuery = useSubjectsQuery(1, 100);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Record<string, number>>({});
  const [questionCatalog, setQuestionCatalog] = useState<Record<string, QuestionResponse>>({});
  const [step, setStep] = useState(1);
  const [subjectFilter, setSubjectFilter] = useState('');
  const [topicInput, setTopicInput] = useState('');
  const [debouncedTopic, setDebouncedTopic] = useState('');
  const [sortByCreatedAt, setSortByCreatedAt] = useState<'desc' | 'asc'>('desc');
  const questionsQuery = useTeacherQuestionsQuery({
    subjectId: subjectFilter || undefined,
    topic: debouncedTopic || undefined,
    sortByCreatedAt,
    page: 1,
    limit: 50,
  });
  const form = useForm<ExamBuilderForm>({ defaultValues: { title: '', subjectId: '', topic: '', timeLimitMinutes: 30, startTime: '', endTime: '' } });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedTopic(topicInput.trim());
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [topicInput]);

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
    onSuccess: async (exam) => {
      toast.success('Exam draft created.');
      await queryClient.invalidateQueries({ queryKey: ['teacher', 'exams'] });
      navigate(`/teacher/exams/${exam.id}`);
    },
    onError: () => toast.error('Unable to create exam draft right now.'),
  });

  const questionItems = questionsQuery.data?.items ?? [];

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

  if (subjectsQuery.isLoading || questionsQuery.isLoading) return <LoadingScreen label="Loading exam builder..." />;
  if (subjectsQuery.isError || questionsQuery.isError || !subjectsQuery.data || !questionsQuery.data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load the exam builder.</div>;

  function submitDraft() {
    const startTime = form.getValues('startTime');
    const endTime = form.getValues('endTime');
    const formattedStartTime = startTime ? localDateTimeToUtcIso(startTime) : null;
    const formattedEndTime = endTime ? localDateTimeToUtcIso(endTime) : null;

    if (startTime && !formattedStartTime) {
      toast.error('Please choose a valid start time.');
      return;
    }

    if (endTime && !formattedEndTime) {
      toast.error('Please choose a valid end time.');
      return;
    }

    createMutation.mutate({
      title: form.getValues('title'),
      subjectId: form.getValues('subjectId'),
      topic: form.getValues('topic') || null,
      timeLimitMinutes: Number(form.getValues('timeLimitMinutes')) || null,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      questions: Object.entries(selectedQuestionIds).map(([questionId, marks]) => ({ questionId, marks })),
    });
  }

  return (
    <div className="space-y-6">
      <SectionCard title="Create exam" eyebrow={`Step ${step} of 3`}>
        <div className="flex flex-wrap gap-3">{[1, 2, 3].map((item) => <button key={item} type="button" onClick={() => setStep(item)} className={`rounded-full px-4 py-2 text-sm font-semibold ${step === item ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700'}`}>Step {item}</button>)}</div>
      </SectionCard>
      {step === 1 ? (
        <SectionCard title="Exam details" eyebrow="Configuration">
          <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(() => setStep(2))}>
            <input {...form.register('title')} placeholder="Exam title" className="rounded-2xl border border-slate-200 px-4 py-3" />
            <select {...form.register('subjectId')} onChange={(event) => { form.setValue('subjectId', event.target.value); setSubjectFilter(event.target.value); }} className="rounded-2xl border border-slate-200 px-4 py-3">
              <option value="">Select subject</option>
              {subjectsQuery.data.items.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
            <input {...form.register('topic')} placeholder="Topic (optional)" className="rounded-2xl border border-slate-200 px-4 py-3" />
            <input type="number" {...form.register('timeLimitMinutes', { valueAsNumber: true })} placeholder="Time limit in minutes" className="rounded-2xl border border-slate-200 px-4 py-3" />
            <input type="datetime-local" {...form.register('startTime')} className="rounded-2xl border border-slate-200 px-4 py-3" />
            <input type="datetime-local" {...form.register('endTime')} className="rounded-2xl border border-slate-200 px-4 py-3" />
            <button type="submit" className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 lg:col-span-2">Continue to question selection</button>
          </form>
        </SectionCard>
      ) : null}
      {step === 2 ? (
        <SectionCard title="Select questions" eyebrow="Question bank">
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr]">
              <input
                value={topicInput}
                onChange={(event) => setTopicInput(event.target.value)}
                placeholder="Filter questions by topic"
                className="rounded-2xl border border-slate-200 px-4 py-3"
              />
              <select
                value={sortByCreatedAt}
                onChange={(event) => setSortByCreatedAt(event.target.value as 'desc' | 'asc')}
                className="rounded-2xl border border-slate-200 px-4 py-3"
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
            </div>
            <div className="grid gap-2 text-sm text-slate-600 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <span>{debouncedTopic ? `Showing topics matching "${debouncedTopic}"` : 'Showing all topics'}</span>
              <span className="sm:text-right">{selectedQuestions.length} question{selectedQuestions.length === 1 ? '' : 's'} selected</span>
            </div>
          </div>
          {visibleQuestions.length === 0 ? <EmptyState title="No questions available" description="Adjust the topic filter or create a question to populate the bank." actionLabel="Open question bank" actionTo="/teacher/questions" /> : (
            <div className="space-y-4">
              {visibleQuestions.map((question) => {
                const isSelected = Boolean(selectedQuestionIds[question.id]);
                return (
                  <div key={question.id} className={`rounded-3xl border p-5 transition ${isSelected ? 'border-emerald-400/70 bg-slate-900 shadow-[0_0_0_1px_rgba(52,211,153,0.16)]' : 'border-slate-200 bg-white'}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`}>{question.topic || 'Question'}</p>
                        <h2 className={`mt-3 text-base font-semibold ${isSelected ? 'text-slate-50' : 'text-slate-900'}`}>{question.questionText}</h2>
                      </div>
                      <div className="flex items-center gap-3">
                        <input type="number" min={1} value={selectedQuestionIds[question.id] ?? 1} onChange={(event) => setSelectedQuestionIds((current) => ({ ...current, [question.id]: Number(event.target.value) || 1 }))} className={`w-20 rounded-2xl border px-3 py-2 ${isSelected ? 'border-emerald-300/40 bg-slate-950 text-slate-50' : 'border-slate-200'}`} disabled={!isSelected} />
                        <button type="button" onClick={() => setSelectedQuestionIds((current) => { const next = { ...current }; if (next[question.id]) { delete next[question.id]; } else { next[question.id] = 1; } return next; })} className={`rounded-full px-4 py-2 text-sm font-semibold ${isSelected ? 'bg-slate-950 text-white' : 'border border-slate-300 text-slate-700'}`}>{isSelected ? 'Selected' : 'Add'}</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between"><button type="button" onClick={() => setStep(1)} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">Back</button><button type="button" onClick={() => setStep(3)} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">Review</button></div>
        </SectionCard>
      ) : null}
      {step === 3 ? (
        <SectionCard title="Review and save" eyebrow="Draft creation">
          <div className="space-y-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-600">Title</p><p className="mt-2 text-lg font-semibold text-slate-900">{form.getValues('title')}</p><p className="mt-4 text-sm text-slate-600">Selected questions: {selectedQuestions.length}</p></div>
            <div className="space-y-3">{selectedQuestions.map((question) => <div key={question.id} className="rounded-3xl border border-slate-200 bg-white p-4"><p className="text-sm font-semibold text-slate-900">{question.questionText}</p><p className="mt-1 text-sm text-slate-600">Marks: {selectedQuestionIds[question.id]}</p></div>)}</div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <button type="button" onClick={() => setStep(2)} className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700">Back</button>
              <button type="button" onClick={submitDraft} disabled={createMutation.isPending || selectedQuestions.length === 0} className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:opacity-60">{createMutation.isPending ? 'Saving draft...' : 'Save as draft'}</button>
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
  return <div className="space-y-6"><SectionCard title={exam.title} eyebrow="Exam detail" action={<Link to={`/teacher/exams/${exam.id}/analytics`} className="text-sm font-semibold text-slate-700 hover:text-slate-950">View analytics</Link>}><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><StatCard label="Status" value={exam.status} helper="Current exam lifecycle stage." accent={getStatusAccent(exam.status)} /><StatCard label="Approval" value={exam.approvalStatus} helper="Backend approval status." accent={getStatusAccent(exam.approvalStatus)} /><StatCard label="Questions" value={exam.questions.length} helper="Questions included in this exam." accent="amber" /><StatCard label="Window" value={formatRelativeWindow(exam.startTime, exam.endTime)} helper="Configured exam availability." accent="slate" /></div></SectionCard><div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]"><SectionCard title="Question review" eyebrow="Exam content"><div className="space-y-4">{exam.questions.map((question, index) => <div key={question.id} className="rounded-3xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-slate-900">Question {index + 1}</p><p className="text-sm text-slate-600">{question.marks} marks</p></div><p className="mt-3 text-sm text-slate-700">{question.questionText}</p></div>)}</div></SectionCard><SectionCard title="Actions" eyebrow="Publish / end / cleanup">{exam.status === 'draft' ? <div className="space-y-4"><div><p className="mb-2 text-sm font-medium text-slate-700">Assign groups before publishing</p><div className="space-y-2">{groupsQuery.data.items.map((group) => { const checked = selectedGroupIds.includes(group.id); return <label key={group.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700"><input type="checkbox" checked={checked} onChange={() => setSelectedGroupIds((current) => checked ? current.filter((id) => id !== group.id) : [...current, group.id])} />{group.name}</label>; })}</div></div><button type="button" onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending || selectedGroupIds.length === 0} className="w-full rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{publishMutation.isPending ? 'Publishing...' : 'Publish exam'}</button><button type="button" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending} className="w-full rounded-full border border-rose-300 px-5 py-3 text-sm font-semibold text-rose-700 disabled:opacity-60">{deleteMutation.isPending ? 'Deleting...' : 'Delete draft'}</button></div> : null}{exam.status === 'published' ? <button type="button" onClick={() => endMutation.mutate()} disabled={endMutation.isPending} className="w-full rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">{endMutation.isPending ? 'Ending...' : 'End exam'}</button> : null}{exam.status === 'ended' ? <p className="rounded-3xl border border-slate-200 bg-slate-50/70 p-4 text-sm text-slate-600">This exam has ended. Use the analytics page to inspect results and leaderboard performance.</p> : null}</SectionCard></div></div>;
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
  if (isLoading) return <LoadingScreen label="Loading group analytics..." />;
  if (isError || !data) return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">We could not load group performance analytics.</div>;
  return <div className="space-y-6"><SectionCard title={data.groupName} eyebrow="Group performance"><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"><StatCard label="At-risk threshold" value={data.atRiskThreshold} helper="Configured threshold for flagging students." accent="amber" /><StatCard label="Trend points" value={data.examTrend.length} helper="Exam performance snapshots in this group." accent="blue" /><StatCard label="At-risk students" value={data.atRiskStudents.length} helper="Students currently below threshold." accent="rose" /></div></SectionCard><div className="grid gap-6 xl:grid-cols-2"><SectionCard title="Weakest topics" eyebrow="Learning gaps"><TopicBarList title="Weakest topics" items={data.weakestTopics} emptyLabel="No weakest-topic data available yet." /></SectionCard><SectionCard title="At-risk students" eyebrow="Needs attention">{data.atRiskStudents.length === 0 ? <EmptyState title="No at-risk students" description="This group is currently above the configured threshold." /> : <div className="space-y-3">{data.atRiskStudents.map((student) => <div key={student.studentId} className="rounded-3xl border border-slate-200 bg-white p-4"><p className="text-base font-semibold text-slate-900">{student.studentName}</p><p className="mt-1 text-sm text-slate-600">Average percentage: {formatPercentage(student.avgPercentage)}</p></div>)}</div>}</SectionCard></div></div>;
}

