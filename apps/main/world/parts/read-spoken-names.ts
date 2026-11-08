/** Remembered conversations are optional when browser storage or its saved JSON is unavailable. */
export function readSpokenNames(key: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "[]")
  } catch {
    return []
  }
}
