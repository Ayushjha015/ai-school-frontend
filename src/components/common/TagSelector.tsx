import { useMemo, useState } from 'react';
import type { TagResponse } from '../../types/api';
import { TagBadge } from './TagBadge';

interface TagSelectorProps {
  tags: TagResponse[];
  selectedIds: string[];
  onChange: (tagIds: string[]) => void;
  label?: string;
  helperText?: string;
  error?: string;
  disabled?: boolean;
}

const MAX_TAGS = 3;

export function TagSelector({
  tags,
  selectedIds,
  onChange,
  label = 'Tags',
  helperText = 'Optional. Select up to 3 tags.',
  error,
  disabled = false,
}: TagSelectorProps) {
  const [query, setQuery] = useState('');

  const filteredTags = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) {
      return tags;
    }

    return tags.filter((tag) => tag.name.toLowerCase().includes(normalized));
  }, [query, tags]);

  const selectedTags = useMemo(
    () => tags.filter((tag) => selectedIds.includes(tag.id)),
    [selectedIds, tags],
  );

  function toggleTag(tagId: string) {
    if (disabled) {
      return;
    }

    const alreadySelected = selectedIds.includes(tagId);
    if (alreadySelected) {
      onChange(selectedIds.filter((id) => id !== tagId));
      return;
    }

    if (selectedIds.length >= MAX_TAGS) {
      return;
    }

    onChange([...selectedIds, tagId]);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <label className="text-sm font-medium text-slate-700">{label}</label>
          <p className="mt-1 text-xs text-slate-500">{helperText}</p>
        </div>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
          {selectedIds.length}/{MAX_TAGS}
        </span>
      </div>

      {selectedTags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} onRemove={() => toggleTag(tag.id)} compact />
          ))}
        </div>
      ) : null}

      <div className="rounded-3xl border border-slate-200 bg-white p-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search tags"
          disabled={disabled}
          className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700"
        />
        <div className="mt-3 max-h-48 space-y-2 overflow-y-auto pr-1">
          {filteredTags.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
              No tags match your search.
            </p>
          ) : (
            filteredTags.map((tag) => {
              const checked = selectedIds.includes(tag.id);
              const maxedOut = !checked && selectedIds.length >= MAX_TAGS;

              return (
                <label
                  key={tag.id}
                  className={`flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                    checked
                      ? 'border-emerald-400/80 bg-slate-900 text-slate-50 shadow-[0_0_0_1px_rgba(52,211,153,0.12)]'
                      : 'border-slate-200 bg-slate-50/70 text-slate-700'
                  } ${maxedOut ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTag(tag.id)}
                      disabled={disabled || maxedOut}
                      className="accent-emerald-500"
                    />
                    <span>{tag.name}</span>
                  </div>
                  <TagBadge tag={tag} compact />
                </label>
              );
            })
          )}
        </div>
      </div>

      {selectedIds.length >= MAX_TAGS ? <p className="text-xs text-amber-600">Maximum 3 tags allowed.</p> : null}
      {error ? <p className="text-sm text-rose-500">{error}</p> : null}
    </div>
  );
}
