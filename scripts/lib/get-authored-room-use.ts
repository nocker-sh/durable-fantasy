import type { Use } from "#/world/town/floorplan/types"
const uses: Readonly<Record<string, Use>> = { 共用: "共用", 作業: "作業場", 階段: "土間", 貯蔵: "貯蔵", 寝: "寝間" }

/** Authored room roles map explicitly to runtime uses; unknown roles never become a generic room. */
export function getAuthoredRoomUse(value: unknown): Use | Error {
  if (typeof value !== "string" || !Object.hasOwn(uses, value)) return new Error("Unsupported authored room use")

  return uses[value]
}
