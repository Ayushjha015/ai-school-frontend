import type { AttemptSessionSnapshot } from '../types/api';

function getStorageKey(attemptId: string) {
  return `student-attempt:${attemptId}`;
}

export function saveAttemptSession(snapshot: AttemptSessionSnapshot) {
  sessionStorage.setItem(getStorageKey(snapshot.attemptId), JSON.stringify(snapshot));
}

export function loadAttemptSession(attemptId: string) {
  const raw = sessionStorage.getItem(getStorageKey(attemptId));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AttemptSessionSnapshot;
  } catch {
    return null;
  }
}

export function clearAttemptSession(attemptId: string) {
  sessionStorage.removeItem(getStorageKey(attemptId));
}
