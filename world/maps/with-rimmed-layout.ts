import { getGroundRimHeight } from "#/world/maps/get-ground-rim-height"
import type { Layout } from "#/world/maps/layout-types"

/** Retain the map's shape and add its closed-edge hills without changing the source layout. */
export function withRimmedLayout(layout: Layout, openSides = ""): Layout {
  const inner = layout.shape
  return { ...layout, shape: (input) => (inner ? inner({ x: input.x, z: input.z, h: input.h, roadD: input.roadD }) : input.h) + getGroundRimHeight(input, openSides) }
}
