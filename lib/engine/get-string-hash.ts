/** FNV-1a over UTF-16 code units, including both halves of a surrogate pair and lone surrogates. */
export function getStringHash(source: string): number {
  const hash = { value: 2166136261 }
  for (const character of source) {
    hash.value = Math.imul(hash.value ^ character.charCodeAt(0), 16777619)
    if (character.length === 2) hash.value = Math.imul(hash.value ^ character.charCodeAt(1), 16777619)
  }
  return hash.value >>> 0
}
