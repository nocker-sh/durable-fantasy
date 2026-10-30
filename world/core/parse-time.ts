/** Read the complete HH:MM value, returning null for missing or invalid input. */
export function parseTime(text: string | null): number | null {
  const m = text ? /^(\d{1,2}):(\d{2})$/.exec(text) : null
  if (!m) return null
  const h = Number(m[1]),
    mm = Number(m[2])
  return h < 24 && mm < 60 ? h * 60 + mm : null
}
