import { getStringHash } from "#/lib/engine/get-string-hash"

/** Match the stored source format: sort paths, concatenate their contents, then encode the UTF-16 hash in base 36. */
export function getSourceFingerprint(sources: Readonly<Record<string, string>>): string {
  const source = Object.keys(sources)
    .sort()
    .map((path) => sources[path])
    .join("")
  return getStringHash(source).toString(36)
}
