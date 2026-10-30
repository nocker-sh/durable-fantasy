import type { Piece } from "#/world/town/fit"
import { SIZES } from "#/world/town/fit"

/** The pieces a furniture entry stands for: 「寝台×2」 is two beds; 「炉（外）」 is outside and takes no floor; 「…（2階）」 stands upstairs. */
export function piecesOf(entry: string): Piece[] | null {
  if (entry.endsWith("（外）")) return []
  const furniture = entry.replace(/（2階）$/, "")
  const m = /^(.+?)×(\d+)$/.exec(furniture)
  const name = m ? m[1] : furniture,
    n = m ? Number(m[2]) : 1
  const size = SIZES[name]
  if (size === undefined) return null
  if (size === "wall") return []
  return Array.from({ length: n }, () => ({ name, ...size }))
}
