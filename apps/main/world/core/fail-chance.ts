/** 必要な生活スキルからの習熟に応じた製作の失敗率。 */
export function failChance(level: number, min: number): number {
  return Math.max(0, 0.3 - (level - min) * 0.1)
}
