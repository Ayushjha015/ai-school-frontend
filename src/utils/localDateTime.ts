export function localDateTimeToUtcIso(localDateTime: string): string | null {
  const trimmed = localDateTime.trim();

  if (!trimmed) {
    return null;
  }

  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute, second = '00'] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
    0,
  );

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}
