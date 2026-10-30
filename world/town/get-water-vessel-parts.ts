import type { getWaterVesselProfile } from "#/world/town/get-water-vessel-profile"
import type { Point3 } from "#/lib/engine/cuboid-motion-types"
type Profile = Exclude<ReturnType<typeof getWaterVesselProfile>, Error>
export type WaterVesselPart =
  | { kind: "tube"; part: "wall"; centre: readonly [number, number]; radius: number; innerRadius: number; bottom: number; top: number }
  | { kind: "cone"; part: "base" | "lid" | "knob"; from: Point3; to: Point3; radiusFrom: number; radiusTo: number }
  | { kind: "capsule"; part: "handle"; side: "l" | "r"; section: "upper" | "lower" | "grip"; from: Point3; to: Point3; radius: number }

/** The renderer and collision review receive the same wall, base, lid, knob and six connected handle bars. */
export function getWaterVesselParts(profile: Profile): readonly WaterVesselPart[] {
  const parts: WaterVesselPart[] = [
    { kind: "tube", part: "wall", centre: [0, 0], radius: profile.radius, innerRadius: profile.innerRadius, bottom: profile.base, top: profile.rim },
    { kind: "cone", part: "base", from: [0, 0, 0], to: [0, profile.base, 0], radiusFrom: profile.radius, radiusTo: profile.radius },
    { kind: "cone", part: "lid", from: [0, profile.rim, 0], to: [0, profile.lidTop, 0], radiusFrom: profile.radius, radiusTo: profile.radius },
    { kind: "cone", part: "knob", from: [0, profile.lidTop, 0], to: [0, profile.height, 0], radiusFrom: profile.knobRadius / 2, radiusTo: profile.knobRadius },
  ]
  for (const side of ["l", "r"] satisfies ("l" | "r")[]) {
    const sign = side === "l" ? 1 : -1,
      barX = profile.handle.outerBar * sign,
      rootX = profile.handle.root * sign,
      low = profile.handle.height - profile.handle.span,
      high = profile.handle.height + profile.handle.span
    parts.push(
      { kind: "capsule", part: "handle", side, section: "lower", from: [rootX, low, 0], to: [barX, low, 0], radius: profile.handle.radius },
      { kind: "capsule", part: "handle", side, section: "upper", from: [rootX, high, 0], to: [barX, high, 0], radius: profile.handle.radius },
      { kind: "capsule", part: "handle", side, section: "grip", from: [barX, low, 0], to: [barX, high, 0], radius: profile.handle.radius },
    )
  }

  return parts
}
