import { quarterTurnRect } from "#/lib/engine/quarter-turn-rect"
import type { Cuboid } from "#/lib/engine/cuboid-subtraction"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
import type { PouringPotLayoutInput, PouringPotStations } from "#/world/town/pouring-pot-layout-types"

/** Derive both stations from the stove origin, with the same west-facing complete vessel. */
export function getPouringPotStations(props: PouringPotLayoutInput): PouringPotStations | Error {
  if (
    [props.stove, props.plate, props.shaft, ...props.masonry].some((part) => ![part.x0, part.x1, part.z0, part.z1].every(Number.isFinite) || part.x0 >= part.x1 || part.z0 >= part.z1) ||
    [props.plate, ...props.masonry].some((part) => ![part.bottom, part.top].every(Number.isFinite) || part.bottom >= part.top)
  )
    return new Error("Invalid pouring pot support geometry")
  const profile = props.profile,
    height = props.plate.top
  const heating: Point3 = [props.stove.x0 + props.heating[0], height, props.stove.z0 + props.heating[1]]
  const resting: Point3 = [props.stove.x0 + props.resting[0], height, props.stove.z0 + props.resting[1]]
  const area = {
    x0: props.stove.x0 + props.restArea[0],
    z0: props.stove.z0 + props.restArea[1],
    x1: props.stove.x0 + props.restArea[0] + props.restArea[2],
    z1: props.stove.z0 + props.restArea[1] + props.restArea[3],
  }
  if (![...heating, ...resting, ...Object.values(area)].every(Number.isFinite) || props.restArea[2] <= 0 || props.restArea[3] <= 0) return new Error("Invalid hot-pot station dimensions")
  const bounds = (at: Point3): Cuboid => ({
    ...quarterTurnRect({ bounds: { x0: profile.min[0], z0: profile.min[2], x1: profile.max[0], z1: profile.max[2] }, turn: 2, origin: [at[0], at[2]] }),
    bottom: at[1],
    top: at[1] + profile.height,
  })
  return { heating, resting, heated: bounds(heating), rested: bounds(resting), area, heading: Math.PI }
}
