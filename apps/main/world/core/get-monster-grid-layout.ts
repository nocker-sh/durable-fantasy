import { MONSTER_MAX_NAV_CELLS } from "#/world/core/monster-motion-rules"
type Props = Readonly<{ area: readonly [number, number, number, number]; cellsPerTile: number; storage: "square" | "rectangle" }>

/** Bound the actual traversal or storage shape; padding a thin territory to a square must count toward the same budget. */
export function getMonsterGridLayout(props: Props) {
  if (![...props.area, props.cellsPerTile].every(Number.isFinite) || props.cellsPerTile <= 0 || props.area[0] > props.area[2] || props.area[1] > props.area[3])
    return new Error("Invalid monster grid territory or scale")
  const ox = Math.floor(props.area[0] * props.cellsPerTile),
    oz = Math.floor(props.area[1] * props.cellsPerTile)
  const ex = Math.floor(props.area[2] * props.cellsPerTile),
    ez = Math.floor(props.area[3] * props.cellsPerTile)
  const width = ex - ox + 1,
    depth = ez - oz + 1,
    size = Math.max(width, depth)
  const count = props.storage === "square" ? size * size : width * depth
  if (![ox, oz, ex, ez, width, depth, count].every(Number.isSafeInteger) || count > MONSTER_MAX_NAV_CELLS) return new Error("Monster navigation grid exceeds allocation budget")

  return { ox, oz, width, depth, size, count }
}
