const TAG_PALETTE = [
  { bg: '#EDE9FE', text: '#6D28D9' },
  { bg: '#DBEAFE', text: '#1D4ED8' },
  { bg: '#D1FAE5', text: '#065F46' },
  { bg: '#FEF3C7', text: '#92400E' },
  { bg: '#FCE7F3', text: '#9D174D' },
  { bg: '#E0F2FE', text: '#0369A1' },
  { bg: '#FFE4E6', text: '#9F1239' },
  { bg: '#ECFCCB', text: '#3F6212' },
  { bg: '#F3E8FF', text: '#7E22CE' },
  { bg: '#FFEDD5', text: '#9A3412' },
] as const;

export function getTagColor(tagName: string) {
  let hash = 0;
  for (let index = 0; index < tagName.length; index += 1) {
    hash = tagName.charCodeAt(index) + ((hash << 5) - hash);
  }
  const paletteIndex = Math.abs(hash) % TAG_PALETTE.length;
  return TAG_PALETTE[paletteIndex];
}
