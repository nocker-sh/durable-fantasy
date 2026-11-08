/** How high the top of a piece is, for setting things down on it (the traces of life, interior.ts). */
export function topOf(full: string): number | null {
  const name = full.replace(/（.+）$/, "")
  if (/^(食卓|大きな食卓|長卓|地図の卓)$/.test(name)) return 0.76
  if (name === "卓") return 0.74
  if (/^(書き物机|縫い物の台)$/.test(name)) return 0.77
  if (/^(作業台|木工台|修理台)$/.test(name)) return 0.9
  if (name === "台所の台") return 0.88
  if (name === "調合台") return 0.88
  if (/^(売り台|カウンター|帳場)$/.test(name)) return 0.66
  return null
}
