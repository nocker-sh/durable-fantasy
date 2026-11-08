import type { WaterVesselPart } from "#/world/town/get-water-vessel-parts"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Props = { parts: readonly WaterVesselPart[]; position: Point3; scale: number; rootY: number }

/** Physical vessel metres become native figure coordinates at the same grounded root used to solve the arms. */
export function getWaterVesselNativeParts(props: Props): readonly WaterVesselPart[] | Error {
  if (![...props.position, props.scale, props.rootY].every(Number.isFinite) || props.scale <= 0) return new Error("Invalid carried water vessel transform")
  const point = (value: Point3): Point3 => [(value[0] + props.position[0]) / props.scale, (value[1] + props.position[1]) / props.scale - props.rootY, (value[2] + props.position[2]) / props.scale]

  return props.parts.map((part) => {
    if (part.kind === "tube")
      return {
        ...part,
        centre: [(part.centre[0] + props.position[0]) / props.scale, (part.centre[1] + props.position[2]) / props.scale] satisfies [number, number],
        radius: part.radius / props.scale,
        innerRadius: part.innerRadius / props.scale,
        bottom: (part.bottom + props.position[1]) / props.scale - props.rootY,
        top: (part.top + props.position[1]) / props.scale - props.rootY,
      }
    if (part.kind === "cone") return { ...part, from: point(part.from), to: point(part.to), radiusFrom: part.radiusFrom / props.scale, radiusTo: part.radiusTo / props.scale }
    return { ...part, from: point(part.from), to: point(part.to), radius: part.radius / props.scale }
  })
}
