export function resolveNotificationTarget(type?: string | null, relatedId?: string | null) {
  if (!relatedId) {
    return '/student/notifications';
  }

  const upperType = (type ?? '').toUpperCase();

  if (upperType.includes('RESULT') || upperType.includes('SUBMIT')) {
    return `/student/results/${relatedId}`;
  }

  if (upperType.includes('LEADER')) {
    return `/student/exams/${relatedId}/leaderboard`;
  }

  return `/student/exams/${relatedId}`;
}
