import { parseUtcTimestampToMs } from './utcDateTime';

interface ResolveDeadlineInput {
  startedAt?: string | null;
  timeLimitMinutes?: number | null;
  clientStartedAtMs?: number;
  resolvedDeadlineMs?: number;
}

interface ResolveDeadlineResult {
  deadlineMs: number | null;
  usedServerStart: boolean;
}

const MAX_SERVER_SKEW_MS = 2 * 60 * 1000;

export function resolveAttemptDeadline({
  startedAt,
  timeLimitMinutes,
  clientStartedAtMs,
  resolvedDeadlineMs,
}: ResolveDeadlineInput): ResolveDeadlineResult {
  if (!timeLimitMinutes || timeLimitMinutes <= 0) {
    return { deadlineMs: null, usedServerStart: false };
  }

  if (resolvedDeadlineMs && Number.isFinite(resolvedDeadlineMs)) {
    return { deadlineMs: resolvedDeadlineMs, usedServerStart: false };
  }

  const durationMs = timeLimitMinutes * 60_000;
  const safeClientStartedAtMs = Number.isFinite(clientStartedAtMs) ? clientStartedAtMs! : Date.now();
  const parsedServerStart = parseUtcTimestampToMs(startedAt);

  if (parsedServerStart !== null) {
    const skew = Math.abs(parsedServerStart - safeClientStartedAtMs);
    if (skew <= MAX_SERVER_SKEW_MS) {
      return {
        deadlineMs: parsedServerStart + durationMs,
        usedServerStart: true,
      };
    }
  }

  return {
    deadlineMs: safeClientStartedAtMs + durationMs,
    usedServerStart: false,
  };
}
