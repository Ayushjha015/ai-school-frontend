export function parseUtcTimestampToMs(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatUtcDateTime(value?: string | null) {
  if (!value) {
    return 'Not available';
  }

  const parsed = parseUtcTimestampToMs(value);
  if (parsed === null) {
    return 'Not available';
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed);
}

export function formatUtcWindow(start?: string | null, end?: string | null) {
  if (!start && !end) {
    return 'Flexible schedule';
  }

  if (start && end) {
    return `${formatUtcDateTime(start)} to ${formatUtcDateTime(end)}`;
  }

  if (start) {
    return `Starts ${formatUtcDateTime(start)}`;
  }

  return `Ends ${formatUtcDateTime(end)}`;
}
