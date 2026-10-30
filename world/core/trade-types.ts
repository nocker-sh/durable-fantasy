/** 一方が提示する、持ち物の枠と個数・所持金。 */
export type Offer = {
  lots: readonly { slot: number; count: number }[]
  gold: number
}
