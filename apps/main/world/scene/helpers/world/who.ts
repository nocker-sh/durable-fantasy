export function who(): string {
  if (!import.meta.env?.DEV) return ""
  const frames = (new Error().stack ?? "")
    .split("\n")
    .slice(3, 6)
    .map((l) => /at (\S+)/.exec(l)?.[1] ?? "?")
  return frames.join(" < ")
}
