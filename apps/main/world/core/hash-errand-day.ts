/** 日付と住民から、同じ町で共有する抽選値を再現する。 */
export function hashErrandDay(input: string): number {
  const hash = { value: 2166136261 }
  for (const character of input) {
    hash.value ^= character.charCodeAt(0)
    hash.value = Math.imul(hash.value, 16777619)
  }
  hash.value ^= hash.value >>> 13
  hash.value = Math.imul(hash.value, 0x5bd1e995)
  hash.value ^= hash.value >>> 15

  return (hash.value >>> 0) / 4294967296
}
