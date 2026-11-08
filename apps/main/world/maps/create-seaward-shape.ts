import { smooth } from "#/lib/engine/smooth"
import { fbm } from "#/lib/engine/fbm"
import type { Layout } from "#/world/maps/layout-types"

/** Lower ground east of the coastline, keeping its existing noise and transition width. */
export function createSeawardShape(coastline: number, width: number, depth = 2.4): NonNullable<Layout["shape"]> {
  return (input) => input.h - smooth(coastline, coastline + width, input.x + (fbm({ x: input.x, y: input.z, scale: 0.15, seed: 7 }) - 0.5) * 3) * depth
}
