import type { StudentExamAvailabilityStatus, StudentExamDetails } from '../types/api';
import { getStatusTone } from './statusStyles';

export type StudentExamAvailability = StudentExamAvailabilityStatus | 'unknown';

export function getStudentExamAvailability(examDetail?: StudentExamDetails | null): StudentExamAvailability {
  return examDetail?.availabilityStatus ?? 'unknown';
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
