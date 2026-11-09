/** Preserve the public mark used by saved threads without including the owner's ID. */
export function threadKey(owner: string): string {
  const hash = { first: 2166136261, second: 5381 }

  for (const character of `muffler:${owner}`) hash.first = Math.imul(hash.first ^ character.charCodeAt(0), 16777619)
  for (const character of owner) hash.second = (Math.imul(hash.second, 33) ^ character.charCodeAt(0)) >>> 0

  return `${(hash.first >>> 0).toString(36)}${hash.second.toString(36)}`
}
