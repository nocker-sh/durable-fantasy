// Fingerprint the sources that paint terrain, including the houses and their worn approaches.
const sources = import.meta.glob<string>(
  [
    "../../lib/engine/fbm.ts",
    "../../lib/engine/hash2.ts",
    "../../lib/engine/lerp.ts",
    "../../lib/engine/polyline.ts",
    "../../lib/engine/catmull-coordinate.ts",
    "../../lib/engine/get-catmull-path.ts",
    "../../lib/engine/get-integer-range.ts",
    "../../lib/engine/scalar-field.ts",
    "../../lib/engine/smooth.ts",
    "../../lib/engine/vnoise.ts",
    "../../lib/graphics/hex-to-rgb.ts",
    "../../lib/graphics/pixel-buffer.ts",
    "../maps/layout.ts",
    "./bayer.ts",
    "./current-layout.ts",
    "./ensure-fields.ts",
    "./fields-now.ts",
    "./ground-h.ts",
    "./helpers/terrain/ash-at.ts",
    "./helpers/terrain/biome-color.ts",
    "./helpers/terrain/cobble.ts",
    "./helpers/terrain/dirt.ts",
    "./helpers/terrain/fringe.ts",
    "./helpers/terrain/grass.ts",
    "./helpers/terrain/ground-color.ts",
    "./helpers/terrain/lvl.ts",
    "./helpers/terrain/patch-level.ts",
    "./helpers/terrain/stamp-at.ts",
    "./helpers/world/base-h.ts",
    "./helpers/world/compute-fields.ts",
    "./helpers/world/compute-h.ts",
    "./helpers/world/seg-road.ts",
    "./in-rect.ts",
    "./mesh-heights.ts",
    "./paint-ground.ts",
    "./paint-rows.ts",
    "./pick.ts",
    "./pix.ts",
    "./river-d.ts",
    "./road-d.ts",
    "./road-kind.ts",
    "./set-layout.ts",
    "./terrain.ts",
    "./textures/palette.ts",
    "./trail-d.ts",
    "./world.ts",
  ],
  { query: "?raw", import: "default", eager: true },
)

/** Source changes invalidate kept pixels; sorting makes the fingerprint independent of file enumeration order. */
export const GROUND_VERSION = hash(
  Object.keys(sources)
    .sort()
    .map((file) => sources[file])
    .join(""),
)

function hash(s: string): string {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (h >>> 0).toString(36)
}
