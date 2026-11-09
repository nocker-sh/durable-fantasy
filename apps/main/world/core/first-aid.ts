/** First aid combines the herb's base recovery with alchemy and the provided vitality stat. */
export function firstAid(alchemy: number, vit: number): number {
  return 15 + alchemy * 3 + Math.floor(vit / 2)
}
