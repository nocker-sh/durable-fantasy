import { rectangleFace } from "#/lib/engine/rectangle-face"
import type { RectangleSide } from "#/lib/engine/rectangle-face"
import type { Rectangle } from "#/lib/engine/rectangle-subtraction"
import { hearthChamber } from "#/world/town/hearth-chamber"
import type { HearthSpec } from "#/world/town/hearth-types"
import { translatedCuboid } from "#/lib/engine/translated-cuboid"
import { hearthWorkTilt } from "#/world/town/hearth-work-tilt"
import { tiltedToolEnvelope } from "#/world/town/tilted-tool-envelope"

type Props = {
  bounds: Rectangle
  front: RectangleSide
  spec: HearthSpec
  grip: readonly [number, number]
  height: number
  width: number
  thickness: number
  length: number
}

export function hearthSpatialStrokes(props: Props) {
  hearthChamber({ bounds: props.bounds, front: props.front, spec: props.spec, bottom: 0 })
  if (![...props.grip, props.height, props.width, props.thickness, props.length].every(Number.isFinite)) throw new Error("Invalid spatial tool dimensions")
  const face = rectangleFace({
      x: (props.bounds.x0 + props.bounds.x1) / 2,
      z: (props.bounds.z0 + props.bounds.z1) / 2,
      width: props.bounds.x1 - props.bounds.x0,
      depth: props.bounds.z1 - props.bounds.z0,
      side: props.front,
    }),
    normal = face.outward,
    nx = normal[0],
    nz = normal[1]
  const dx = props.grip[0] - face.point[0],
    dz = props.grip[1] - face.point[1],
    outside = dx * nx + dz * nz,
    across = -dx * nz + dz * nx
  if (outside <= 0 || Math.abs(across - props.spec.openingOffset) > 1e-9 || props.width <= 0 || props.width >= props.spec.openingWidth || props.length <= 0)
    throw new Error("Spatial tool stroke is not aligned with the firebox")
  const tilt = hearthWorkTilt({ reach: outside + props.spec.chamberDepth, gripHeight: props.height, floor: props.spec.openingBottom, thickness: props.thickness })
  if (tilt.gripFromBlade > props.length + 1e-9) throw new Error("Tilted tool cannot reach the firebox back")
  const crossing = props.height - outside * Math.tan(tilt.angle),
    half = props.thickness / (2 * Math.cos(tilt.angle))
  if (crossing - half < props.spec.openingBottom - 1e-9 || crossing + half > props.spec.openingTop + 1e-9) throw new Error("Tilted tool clips the firebox opening")
  const axis: [number, number, number] = [nx * Math.cos(tilt.angle), Math.sin(tilt.angle), nz * Math.cos(tilt.angle)]
  return {
    tilt,
    axis,
    strokes: [-1, 1].map((sign) => {
      const offset = (sign * (props.spec.openingWidth - props.width)) / 2
      const at = [props.grip[0] - nz * offset, props.height, props.grip[1] + nx * offset] as const
      return {
        grip: at,
        offset,
        bounds: translatedCuboid(
          tiltedToolEnvelope({ front: props.front, width: props.width, thickness: props.thickness, length: props.length, gripFromBlade: tilt.gripFromBlade, tilt: tilt.angle }),
          at,
        ),
      }
    }),
  }
}
