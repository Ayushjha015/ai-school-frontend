export type StatusAccent = 'emerald' | 'blue' | 'amber' | 'slate' | 'rose';

function normalizeStatus(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? '';
}

export function getStatusTone(status: string | null | undefined) {
  switch (normalizeStatus(status)) {
    case 'active':
    case 'published':
    case 'live':
    case 'completed':
    case 'correct':
      return 'bg-emerald-100 text-emerald-700';
    case 'upcoming':
    case 'review':
      return 'bg-blue-100 text-blue-700';
    case 'draft':
      return 'bg-amber-100 text-amber-700';
    case 'missed':
    case 'inactive':
    case 'ended':
    case 'incorrect':
      return 'bg-rose-100 text-rose-700';
    case 'past':
    case 'given':
      return 'bg-slate-200 text-slate-700';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}

export function getStatusAccent(status: string | null | undefined): StatusAccent {
  switch (normalizeStatus(status)) {
    case 'active':
    case 'published':
    case 'live':
    case 'completed':
    case 'correct':
      return 'emerald';
    case 'upcoming':
    case 'review':
      return 'blue';
    case 'draft':
      return 'amber';
    case 'missed':
    case 'inactive':
    case 'ended':
    case 'incorrect':
      return 'rose';
    case 'past':
    case 'given':
    default:
      return 'slate';
  }
}
