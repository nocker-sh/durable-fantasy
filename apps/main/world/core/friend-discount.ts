/** 親しさの段階に応じた値引き率を、共通の上限まで返す。 */
export function friendDiscount(friend: number): number {
  return Math.min(10, Math.floor(friend / 10)) / 100
}
