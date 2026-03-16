interface TopicBarListProps {
  title: string;
  items: Array<{ topic?: string | null; accuracy: number; correct: number; incorrect: number }>;
  emptyLabel: string;
}

function getAccuracyTone(accuracy: number) {
  if (accuracy <= 24) {
    return 'bg-rose-500';
  }

  if (accuracy <= 49) {
    return 'bg-amber-400';
  }

  if (accuracy <= 74) {
    return 'bg-emerald-400';
  }

  return 'bg-emerald-600';
}

export function TopicBarList({ title, items, emptyLabel }: TopicBarListProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5">
      <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</h3>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-slate-600">{emptyLabel}</p>
      ) : (
        <div className="mt-4 space-y-4">
          {items.map((item, index) => {
            const accuracy = Math.round(item.accuracy);
            const barTone = getAccuracyTone(accuracy);

            return (
              <div key={`${item.topic ?? 'untagged'}-${index}`}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-700">
                  <span>{item.topic || 'Untagged topic'}</span>
                  <span className="font-semibold">{accuracy}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div className={`h-2 rounded-full ${barTone}`} style={{ width: `${Math.max(6, Math.min(100, item.accuracy))}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {item.correct} correct, {item.incorrect} incorrect
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
