const colorOffset = Math.round(Math.random() * 100);

export function getBlockColor(index: number): string {
  if (index === 0) return '#333344';

  const offset = index + colorOffset;
  const r = Math.round(Math.sin(0.3 * offset) * 55 + 200);
  const g = Math.round(Math.sin(0.3 * offset + 2) * 55 + 200);
  const b = Math.round(Math.sin(0.3 * offset + 4) * 55 + 200);

  return `rgb(${r},${g},${b})`;
}

export const BLOCK_COLORS = [
  '#E6C8C8', '#C8D8E6', '#C8E6D0', '#E6DCC8',
  '#D0C8E6', '#C8E6E0', '#E6C8D8', '#D8E6C8',
] as const;
