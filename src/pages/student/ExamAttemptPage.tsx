import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getAttemptDetail, markTabSwitch, submitAttempt } from '../../api/studentService';
import { EmptyState } from '../../components/common/EmptyState';
import { SectionCard } from '../../components/common/SectionCard';
import { loadAttemptSession, saveAttemptSession } from '../../utils/attemptSession';
import { resolveAttemptDeadline } from '../../utils/examTimer';

function formatSeconds(seconds: number) {
  const safe = Math.max(0, seconds);
  const mins = Math.floor(safe / 60);
  const rem = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

export function ExamAttemptPage() {
  const [searchParams] = useSearchParams();
  const attemptId = searchParams.get('attemptId') ?? '';
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const initialSnapshot = useMemo(() => (attemptId ? loadAttemptSession(attemptId) : null), [attemptId]);
  const [answers, setAnswers] = useState<Record<string, string | null>>(initialSnapshot?.answers ?? {});
  const [activeIndex, setActiveIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const autoSubmittedRef = useRef(false);
  const warnedFallbackRef = useRef(false);

  const attemptDetailQuery = useQuery({
    queryKey: ['student', 'attempt', attemptId],
    queryFn: () => getAttemptDetail(attemptId),
    enabled: Boolean(attemptId),
    refetchInterval: 20_000,
  });

  const tabSwitchMutation = useMutation({
    mutationFn: () => markTabSwitch(attemptId),
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const payload = (initialSnapshot?.questions ?? []).map((question) => ({
        questionId: question.id,
        selectedOptionId: answers[question.id] ?? null,
      }));
      return submitAttempt(attemptId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['student', 'results'] });
      await queryClient.invalidateQueries({ queryKey: ['student', 'summary'] });
      await queryClient.invalidateQueries({ queryKey: ['student', 'exams'] });
      toast.success('Exam submitted successfully.');
      navigate(`/student/results/${attemptId}`, { replace: true });
    },
    onError: () => {
      toast.error('Submission failed. Please try again.');
    },
  });

  useEffect(() => {
    if (!initialSnapshot || !attemptId) {
      return;
    }

    const resolution = resolveAttemptDeadline({
      startedAt: initialSnapshot.startedAt,
      timeLimitMinutes: initialSnapshot.timeLimitMinutes,
      clientStartedAtMs: initialSnapshot.clientStartedAtMs,
      resolvedDeadlineMs: initialSnapshot.resolvedDeadlineMs,
    });

    if (resolution.deadlineMs !== initialSnapshot.resolvedDeadlineMs) {
      saveAttemptSession({
        ...initialSnapshot,
        answers,
        resolvedDeadlineMs: resolution.deadlineMs ?? undefined,
      });
    }

    if (!resolution.usedServerStart && initialSnapshot.timeLimitMinutes && !warnedFallbackRef.current) {
      warnedFallbackRef.current = true;
      console.warn('Exam timer fell back to client start time because the server timestamp was invalid or outside the allowed skew window.');
    }

    if (resolution.deadlineMs === null) {
      setSecondsLeft(null);
      return;
    }

    const update = () => {
      const remainingMs = resolution.deadlineMs! - Date.now();
      const next = Math.max(0, Math.ceil(remainingMs / 1000));
      setSecondsLeft(next);

      if (remainingMs <= 0 && !autoSubmittedRef.current) {
        autoSubmittedRef.current = true;
        void submitMutation.mutateAsync();
      }
    };

    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [answers, attemptId, initialSnapshot, submitMutation]);

  useEffect(() => {
    if (attemptDetailQuery.data?.status?.toLowerCase().includes('submit')) {
      navigate(`/student/results/${attemptId}`, { replace: true });
    }
  }, [attemptDetailQuery.data?.status, attemptId, navigate]);

  useEffect(() => {
    if (!initialSnapshot) {
      return;
    }

    const restoredAnswers = attemptDetailQuery.data?.answers?.reduce<Record<string, string | null>>((acc, answer) => {
      acc[answer.questionId] = answer.selectedOptionId ?? null;
      return acc;
    }, {}) ?? {};

    setAnswers((current) => ({ ...restoredAnswers, ...current }));
  }, [attemptDetailQuery.data, initialSnapshot]);

  useEffect(() => {
    if (!initialSnapshot) {
      return;
    }

    saveAttemptSession({
      ...initialSnapshot,
      answers,
      resolvedDeadlineMs: initialSnapshot.resolvedDeadlineMs,
    });
  }, [answers, initialSnapshot]);

  useEffect(() => {
    if (!attemptId) {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        tabSwitchMutation.mutate();
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };

    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
      toast.error('Back navigation is disabled during an active exam.');
    };

    window.history.pushState(null, '', window.location.href);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [attemptId, tabSwitchMutation]);

  if (!attemptId || !initialSnapshot) {
    return (
      <EmptyState
        title="Attempt session not found"
        description="Start the exam from its instruction page so the question payload can be loaded safely."
        actionLabel="Back to exam list"
        actionTo="/student/exams"
      />
    );
  }

  const questions = initialSnapshot.questions;
  const currentQuestion = questions[activeIndex];
  const answeredCount = questions.filter((question) => answers[question.id]).length;

  if (!currentQuestion) {
    return <EmptyState title="No questions found" description="The attempt was created, but no question payload is available in this session." />;
  }

  async function handleSubmit() {
    const confirmed = window.confirm('Are you sure you want to submit this exam?');
    if (!confirmed) {
      return;
    }

    await submitMutation.mutateAsync();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.32fr_0.68fr]">
      <SectionCard title="Exam progress" eyebrow="Live attempt">
        <div className="space-y-6">
          <div className="rounded-3xl bg-slate-950 p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Timer</p>
            <p className="mt-3 text-4xl font-semibold">{secondsLeft === null ? 'No limit' : formatSeconds(secondsLeft)}</p>
            <p className="mt-3 text-sm text-slate-300">Answered {answeredCount} of {questions.length} questions</p>
            <p className="mt-1 text-sm text-slate-300">Tab switches tracked: {attemptDetailQuery.data?.tabSwitchCount ?? 0}</p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Question navigator</p>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {questions.map((question, index) => {
                const answered = Boolean(answers[question.id]);
                const active = index === activeIndex;
                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`rounded-2xl px-0 py-3 text-sm font-semibold transition ${
                      active
                        ? 'bg-slate-950 text-white'
                        : answered
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
            className="w-full rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitMutation.isPending ? 'Submitting...' : 'Submit exam'}
          </button>
        </div>
      </SectionCard>

      <SectionCard title={`Question ${activeIndex + 1}`} eyebrow={`Attempt ${attemptId.slice(0, 8)}`}>
        <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">{currentQuestion.topic || 'Untagged topic'}</p>
            <p className="text-sm font-medium text-slate-600">{currentQuestion.marks} marks</p>
          </div>
          <h2 className="mt-5 text-2xl font-semibold leading-tight text-slate-900">{currentQuestion.questionText}</h2>

          <div className="mt-6 space-y-3">
            {currentQuestion.options.map((option) => {
              const selected = answers[currentQuestion.id] === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setAnswers((current) => ({ ...current, [currentQuestion.id]: option.id ?? null }))}
                  className={`flex w-full items-start gap-3 rounded-3xl border px-4 py-4 text-left transition ${
                    selected
                      ? 'border-emerald-400/80 bg-slate-900 text-slate-50 shadow-[0_0_0_1px_rgba(52,211,153,0.16)]'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className={`mt-0.5 h-5 w-5 rounded-full border ${selected ? 'border-emerald-400 bg-emerald-400' : 'border-slate-300'}`} />
                  <span className={`text-sm leading-6 ${selected ? 'text-slate-100' : 'text-slate-700'}`}>{option.optionText}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap justify-between gap-3">
            <button
              type="button"
              onClick={() => setActiveIndex((current) => Math.max(0, current - 1))}
              disabled={activeIndex === 0}
              className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous question
            </button>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAnswers((current) => ({ ...current, [currentQuestion.id]: null }))}
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              >
                Clear answer
              </button>
              <button
                type="button"
                onClick={() => setActiveIndex((current) => Math.min(questions.length - 1, current + 1))}
                disabled={activeIndex === questions.length - 1}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next question
              </button>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
