import { quarterTurnRect } from "#/lib/engine/quarter-turn-rect"
import { shelfTurn } from "#/world/town/shelf-turn"
import type { ShelfSpec, ShelfPart } from "#/world/town/shelf"

type Props = {
  x: number
  z: number
  width: number
  depth: number
  floor: number
  shelf: ShelfSpec
}

/** Levels denote board upper faces; stored objects occupy the clear bays between them. */
export function shelfParts(props: Props): ShelfPart[] {
  const shelfSpec = props.shelf,
    h = shelfSpec.height,
    t = shelfSpec.board,
    levels = shelfSpec.levels,
    front = shelfSpec.front,
    sideways = front === "e" || front === "w",
    w = sideways ? props.depth : props.width,
    d = sideways ? props.width : props.depth
  if (
    ![props.x, props.z, props.floor].every(Number.isFinite) ||
    ![w, d, h, t].every((n) => Number.isFinite(n) && n > 0) ||
    2 * t >= Math.min(w, d) ||
    levels.length < 2 ||
    levels.some((y, i) => !Number.isFinite(y) || y < t || y > h || (i > 0 && y - levels[i - 1] <= t)) ||
    Math.abs((levels.at(-1) ?? NaN) - h) > 1e-9 ||
    !["n", "s", "w", "e"].includes(front)
  )
    throw new Error("Invalid shelf dimensions")
  const turn = shelfTurn(front),
    parts: ShelfPart[] = []
  const add = (inputProps: { part: ShelfPart["part"]; x0: number; y0: number; z0: number; x1: number; y1: number; z1: number }) => {
    const part = inputProps.part
    const x0 = inputProps.x0
    const y0 = inputProps.y0
    const z0 = inputProps.z0
    const x1 = inputProps.x1
    const y1 = inputProps.y1
    const z1 = inputProps.z1
    return parts.push({ part, ...quarterTurnRect({ bounds: { x0: x0, z0: z0, x1: x1, z1: z1 }, turn: turn, origin: [props.x, props.z] }), y0: props.floor + y0, y1: props.floor + y1 })
  }
  add({ part: "side", x0: -w / 2, y0: 0, z0: -d / 2, x1: -w / 2 + t, y1: h, z1: d / 2 })
  add({ part: "side", x0: w / 2 - t, y0: 0, z0: -d / 2, x1: w / 2, y1: h, z1: d / 2 })
  add({ part: "back", x0: -w / 2 + t, y0: 0, z0: -d / 2, x1: w / 2 - t, y1: h, z1: -d / 2 + t })
  for (const level of levels) add({ part: "board", x0: -w / 2 + t, y0: level - t, z0: -d / 2 + t, x1: w / 2 - t, y1: level, z1: d / 2 })
  return parts
}
