import { Kit } from "#/world/scene/construction/kit"

/** A smaller spot inside the piece, centred `v` back from its middle, `W` wide. */
export function shrink(k: Kit, W: number, v: number): { x: number; z: number; w: number; d: number } {
  const xState = k.at(0, v),
    x = xState[0],
    z = xState[1]
  const side = k.s.face === 1 || k.s.face === 3
  return { x, z, w: side ? 0.4 : W, d: side ? W : 0.4 }
}
