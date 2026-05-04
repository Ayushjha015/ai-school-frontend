import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { startExamAttempt } from '../../api/studentService';
import { LoadingScreen } from '../../components/common/LoadingScreen';
import { SectionCard } from '../../components/common/SectionCard';
import { useStudentExamDetailsQuery } from '../../hooks/useStudentQueries';
import { saveAttemptSession } from '../../utils/attemptSession';
import { formatDateTime } from '../../utils/formatters';
import { getStudentExamAvailability, getStudentExamStatusLabel, getStudentExamStatusTone } from '../../utils/studentExamStatus';
import { IconLabel, appIcons } from '../../utils/appIcons';

export function ExamInstructionsPage() {
  const { examId = '' } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useStudentExamDetailsQuery(examId);

  const examStatus = getStudentExamAvailability(data);
  const canStartExam = examStatus === 'live';

  const startMutation = useMutation({
    mutationFn: () => startExamAttempt(examId),
    onSuccess: (attempt) => {
      saveAttemptSession({
        attemptId: attempt.attemptId,
        examId: attempt.examId,
        startedAt: attempt.startedAt,
        clientStartedAtMs: Date.now(),
        timeLimitMinutes: attempt.timeLimitMinutes,
        questions: attempt.questions,
        answers: {},
      });
      toast.success('Exam started. Good luck!');
      navigate(`/student/exams/${examId}/attempt?attemptId=${attempt.attemptId}`);
    },
    onError: () => {
      toast.error('Unable to start this exam right now.');
    },
  });

  if (isLoading) {
    return <LoadingScreen label="Loading exam instructions..." />;
  }

  if (isError || !data) {
    return <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-8 text-rose-700">This exam could not be loaded.</div>;
  }

  const statusMessage = {
    live: 'This exam is currently live. When you start, your timer begins immediately.',
    upcoming: 'This exam is scheduled for later. Review the details here and come back once the exam window opens.',
    missed: 'This exam window has already passed, so it can no longer be started from your account.',
    given: 'This exam is no longer open for a new attempt. You can return to your results to review completed work.',
    unknown: 'Review the exam details below. Start will only be available during the live exam window.',
  }[examStatus];

  return (
    <div className="space-y-6">
      <SectionCard title="Exam details" eyebrow="Before you begin">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-slate-900">{data.title}</h1>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${getStudentExamStatusTone(examStatus)}`}>
                {getStudentExamStatusLabel(examStatus)}
              </span>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-600">{statusMessage}</p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              <li>Subject: {data.subjectName}</li>
              {data.topic ? <li>Topic: {data.topic}</li> : null}
              <li>Start time: {formatDateTime(data.startTime)}</li>
              <li>End time: {formatDateTime(data.endTime)}</li>
              <li>Time limit: {data.timeLimitMinutes ? `${data.timeLimitMinutes} minutes` : 'No fixed limit provided'}</li>
              <li>Pass percentage: {data.passPercentage}%</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">What to expect</p>
            {canStartExam ? (
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li>Keep this tab active throughout the exam.</li>
                <li>Use a stable internet connection.</li>
                <li>Review each answer before final submission.</li>
                <li>You will be redirected to your result after submit.</li>
              </ul>
            ) : (
              <ul className="mt-4 space-y-3 text-sm text-slate-700">
                <li>This page is for review only until the exam becomes available.</li>
                <li>Check the exam window carefully before returning.</li>
                <li>Only exams in the Live section can be started right away.</li>
              </ul>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              {canStartExam ? (
                <button
                  type="button"
                  onClick={() => startMutation.mutate()}
                  disabled={startMutation.isPending}
                  className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <IconLabel label={startMutation.isPending ? 'Starting...' : 'Start exam now'} icon={appIcons.Send} />
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-400 disabled:cursor-not-allowed"
                >
                  <IconLabel label="Start available during live window only" icon={appIcons.CalendarClock} />
                </button>
              )}
              <Link to="/student/exams" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400">
                <IconLabel label="Back to exams" icon={appIcons.ChevronRight} className="[&>svg]:rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
