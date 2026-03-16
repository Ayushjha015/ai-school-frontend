import type { StudentExamDetails, StudentExamListResponse } from '../types/api';
import { getStatusTone } from './statusStyles';
import { parseUtcTimestampToMs } from './utcDateTime';

export type StudentExamAvailability = 'live' | 'upcoming' | 'missed' | 'given' | 'unknown';

function matchesExam(examId: string, exams?: StudentExamDetails[]) {
  return Boolean(exams?.some((exam) => exam.id === examId));
}

export function getStudentExamAvailability(examId: string, examLists?: StudentExamListResponse | null, examDetail?: StudentExamDetails | null): StudentExamAvailability {
  if (examLists) {
    if (matchesExam(examId, examLists.live)) return 'live';
    if (matchesExam(examId, examLists.upcoming)) return 'upcoming';
    if (matchesExam(examId, examLists.missed)) return 'missed';
    if (matchesExam(examId, examLists.given)) return 'given';
  }

  if (!examDetail) {
    return 'unknown';
  }

  const now = Date.now();
  const startTime = parseUtcTimestampToMs(examDetail.startTime) ?? Number.NaN;
  const endTime = parseUtcTimestampToMs(examDetail.endTime) ?? Number.NaN;
  const hasValidStart = Number.isFinite(startTime);
  const hasValidEnd = Number.isFinite(endTime);

  if (hasValidStart && now < startTime) {
    return 'upcoming';
  }

  if (hasValidStart && (!hasValidEnd || now <= endTime) && now >= startTime) {
    return 'live';
  }

  if (hasValidEnd && now > endTime) {
    return 'given';
  }

  return 'unknown';
}

export function getStudentExamStatusLabel(status: StudentExamAvailability) {
  switch (status) {
    case 'live':
      return 'Live';
    case 'upcoming':
      return 'Upcoming';
    case 'missed':
      return 'Missed';
    case 'given':
      return 'Past';
    default:
      return 'Exam';
  }
}

export function getStudentExamStatusTone(status: StudentExamAvailability) {
  return getStatusTone(getStudentExamStatusLabel(status));
}
