import { formatUtcDateTime, formatUtcWindow } from './utcDateTime';

export function formatDateTime(value?: string | null) {
  return formatUtcDateTime(value);
}

export function formatRelativeWindow(start?: string | null, end?: string | null) {
  return formatUtcWindow(start, end);
}

export function formatPercentage(value?: number | null) {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '0%';
  }

  return `${Math.round(value)}%`;
}

export function formatDuration(seconds?: number | null) {
  if (typeof seconds !== 'number' || Number.isNaN(seconds)) {
    return 'Not tracked';
  }

  const mins = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${mins}m ${remaining}s`;
}

export function formatRoleLabel(role: string) {
  return role
    .toLowerCase()
    .split('_')
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(' ');
}
