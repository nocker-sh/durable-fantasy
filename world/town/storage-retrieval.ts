import { quarterTurnPoint } from "../../lib/engine/quarter-turn-point"
import { shelfItemParts } from "#/world/town/shelf-item-parts"
import { shelfTurn } from "#/world/town/shelf-turn"
import type { ShelfSpec } from "#/world/town/shelf"
/** Straight withdrawal and a simultaneous retreat, in the caller's coordinates and scale. */
export function storageRetrieval(inputProps: { x: number; z: number; width: number; depth: number; shelf: ShelfSpec; index: number }) {
  const x = inputProps.x
  const z = inputProps.z
  const width = inputProps.width
  const depth = inputProps.depth
  const shelf = inputProps.shelf
  const index = inputProps.index

  const item = shelf.items?.[index],
    r = item?.retrieval
  if (
    !item ||
    !r ||
    !Number.isFinite(r.withdraw) ||
    r.withdraw <= 0 ||
    !Number.isFinite(r.bodyRadius) ||
    r.bodyRadius <= 0 ||
    ![r.bodyAcross, r.bodyStart, r.bodyEnd].every(Number.isFinite) ||
    !Number.isSafeInteger(r.space) ||
    r.space < 0
  )
    throw new Error("Invalid shelf retrieval")
  const turn = shelfTurn(shelf.front),
    normal = quarterTurnPoint(0, 1, turn),
    side = shelf.front === "e" || shelf.front === "w",
    d = side ? width : depth
  if (-d / 2 + shelf.board + item.fromBack + r.withdraw < d / 2 - 1e-9) throw new Error("Stored object does not clear the shelf front")
  const from = shelfItemParts({ x: x, z: z, width: width, depth: depth, floor: 0, shelf: shelf })[index],
    dx = normal[0] * r.withdraw,
    dz = normal[1] * r.withdraw
  const to = { ...from, x0: from.x0 + dx, x1: from.x1 + dx, z0: from.z0 + dz, z1: from.z1 + dz }
  const body = (distance: number): readonly [number, number] => {
    const p = quarterTurnPoint(r.bodyAcross, d / 2 + distance, turn)
    return [x + p[0], z + p[1]]
  }
  const grip: readonly [number, number] = [(from.x0 + from.x1) / 2 + (normal[0] * item.depth) / 2, (from.z0 + from.z1) / 2 + (normal[1] * item.depth) / 2]
  const across = quarterTurnPoint(item.width / 2, 0, turn)
  const gripsStart = [-1, 1].map((sign) => [grip[0] + sign * across[0], grip[1] + sign * across[1]] as const)
  const gripsEnd = gripsStart.map((p) => [p[0] + dx, p[1] + dz] as const)
  return {
    from,
    to,
    delta: [dx, dz] as const,
    bodyStart: body(r.bodyStart),
    bodyEnd: body(r.bodyEnd),
    gripsStart,
    gripsEnd,
    swept: [Math.min(from.x0, to.x0), Math.min(from.z0, to.z0), Math.max(from.x1, to.x1), Math.max(from.z1, to.z1)] as const,
  }
}
