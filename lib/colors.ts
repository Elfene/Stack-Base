export const BLOCK_COLORS = [
  '#FF6B6B', // coral red
  '#4ECDC4', // turquoise
  '#45B7D1', // sky blue
  '#FFA07A', // light salmon
  '#98D8C8', // mint
  '#F7DC6F', // yellow
  '#BB8FCE', // lavender
  '#85C1E2', // powder blue
] as const;

export function getBlockColor(index: number): string {
  return BLOCK_COLORS[index % BLOCK_COLORS.length];
}
