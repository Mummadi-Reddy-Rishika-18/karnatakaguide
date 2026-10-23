/** Whole days affordable for a total budget at a given per-day spend. */
export function affordableDays(total: number, perDay: number): number {
  if (!(total > 0) || !(perDay > 0)) return 0;
  return Math.floor(total / perDay);
}

/** Money left over after spending perDay for the affordable days. */
export function leftover(total: number, perDay: number): number {
  const d = affordableDays(total, perDay);
  return d === 0 ? Math.max(0, total || 0) : total - d * perDay;
}
