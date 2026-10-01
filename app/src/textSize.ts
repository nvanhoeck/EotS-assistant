export const TEXT_SIZES = [16, 18, 21] as const;
export const DEFAULT_SIZE_INDEX = 1;

export function stepSize(index: number, delta: -1 | 1): number {
  return Math.min(TEXT_SIZES.length - 1, Math.max(0, index + delta));
}
