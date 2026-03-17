function formatOffset(offsetMinutes: number) {
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const absolute = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absolute / 60)).padStart(2, '0');
  const minutes = String(absolute % 60).padStart(2, '0');
  return `${sign}${hours}:${minutes}`;
}

export function localDateTimeToOffsetIso(localDateTime: string): string | null {
  const trimmed = localDateTime.trim();

  if (!trimmed) {
    return null;
  }

  const match = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/);

  if (!match) {
    return null;
  }

  const [, parsedYear, parsedMonth, parsedDay, hour, minute, second = '00'] = match;
  const date = new Date(
    Number(parsedYear),
    Number(parsedMonth) - 1,
    Number(parsedDay),
    Number(hour),
    Number(minute),
    Number(second),
    0,
  );

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const offsetMinutes = -date.getTimezoneOffset();
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${formatOffset(offsetMinutes)}`;
}
