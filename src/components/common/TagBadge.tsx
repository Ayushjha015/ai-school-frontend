import type { QuestionTagResponse, TagResponse } from '../../types/api';
import { getTagColor } from '../../utils/tagColors';

type TagLike = QuestionTagResponse | TagResponse;

interface TagBadgeProps {
  tag: TagLike;
  onRemove?: () => void;
  compact?: boolean;
}

export function TagBadge({ tag, onRemove, compact = false }: TagBadgeProps) {
  const colors = getTagColor(tag.name);

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full font-semibold ${compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'}`}
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <span>{tag.name}</span>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full text-[10px] leading-none opacity-80 transition hover:opacity-100"
          aria-label={`Remove ${tag.name}`}
        >
          ×
        </button>
      ) : null}
    </span>
  );
}
